// pages/api/process-payment.js
import { APIContracts, APIControllers } from 'authorizenet';
import constants from '../../utils/constants'; // Adjust the path if necessary

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      firstName, lastName, email, company, invoice, amount, billingAddress,
      city, state, zip, paymentMethod, cardNumber, expirationDate, cardCode,
      bankName, accountType, accountNumber, routingNumber
    } = req.body;

    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(constants.apiLoginKey);
    merchantAuthenticationType.setTransactionKey(constants.transactionKey);

    const orderDetails = new APIContracts.OrderType();
    orderDetails.setInvoiceNumber(invoice || 'INV-12345');
    orderDetails.setDescription('Product Description');

    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(firstName);
    billTo.setLastName(lastName);
    billTo.setCompany(company);
    billTo.setAddress(billingAddress);
    billTo.setCity(city);
    billTo.setState(state);
    billTo.setZip(zip);
    billTo.setCountry('USA');
    billTo.setEmail(email);

    let paymentType;
    if (paymentMethod === 'CreditCard') {
      const creditCard = new APIContracts.CreditCardType();
      creditCard.setCardNumber(cardNumber);
      creditCard.setExpirationDate(expirationDate);
      creditCard.setCardCode(cardCode);

      paymentType = new APIContracts.PaymentType();
      paymentType.setCreditCard(creditCard);
    } else if (paymentMethod === 'ACH') {
      const bankAccount = new APIContracts.BankAccountType();
      bankAccount.setAccountType(APIContracts.BankAccountTypeEnum[accountType.toUpperCase()]);
      bankAccount.setRoutingNumber(routingNumber);
      bankAccount.setAccountNumber(accountNumber);
      bankAccount.setNameOnAccount(`${firstName} ${lastName}`);
      bankAccount.setBankName(bankName);

      paymentType = new APIContracts.PaymentType();
      paymentType.setBankAccount(bankAccount);
    }

    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(amount);
    transactionRequestType.setOrder(orderDetails);
    transactionRequestType.setBillTo(billTo);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

    ctrl.execute(function () {
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.CreateTransactionResponse(apiResponse);

      if (response && response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
        if (response.getTransactionResponse().getMessages() != null) {
          res.status(200).json({
            success: true,
            transactionId: response.getTransactionResponse().getTransId(),
            responseCode: response.getTransactionResponse().getResponseCode(),
            messageCode: response.getTransactionResponse().getMessages().getMessage()[0].getCode(),
            description: response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Failed Transaction.',
            error: response.getTransactionResponse().getErrors().getError()[0].getErrorText(),
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed Transaction.',
          error: response.getMessages().getMessage()[0].getText(),
        });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
