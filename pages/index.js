import React, { useState } from 'react';
import Script from 'next/script';
import { AcceptJsProvider, useAcceptJs } from 'react-acceptjs';

const PaymentForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('ACH');
  const [total, setTotal] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState(total);

  const { dispatchData } = useAcceptJs({
    apiLoginID: '4w94cd8LEb', // Replace with your API login ID
    clientKey: '63P397P7JyHqdUr9', // Replace with your client key
  });

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === 'CreditCard') {
      setAdjustedTotal(total * 1.03); // Adding 3% fee
    } else {
      setAdjustedTotal(total);
    }
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    setTotal(amount);
    if (paymentMethod === 'CreditCard') {
      setAdjustedTotal(amount * 1.03); // Adding 3% fee
    } else {
      setAdjustedTotal(amount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'CreditCard') {
      const cardData = {
        cardNumber: document.getElementsByName('cardNumber')[0].value,
        month: document.getElementsByName('expiryDate')[0].value.split('/')[0],
        year: document.getElementsByName('expiryDate')[0].value.split('/')[1],
        cvv: document.getElementsByName('cvv')[0].value,
      };

      try {
        const response = await dispatchData(cardData);
        if (response.messages.resultCode === 'Ok') {
          // Handle successful payment
          console.log('Payment Successful:', response);
        } else {
          // Handle payment error
          console.error('Payment Error:', response.messages.message[0].text);
        }
      } catch (error) {
        console.error('Error dispatching data:', error);
      }
    } else if (paymentMethod === 'ACH') {
      // Handle ACH payment
      console.log('Processing ACH payment');
    }
  };

  return (
    <>
      <Script src="https://js.authorize.net/v1/Accept.js" strategy="beforeInteractive" />
      <form onSubmit={handleSubmit}>
        <h2>Payment Form</h2>
        
        <label>
          First Name:
          <input type="text" name="firstName" required />
        </label>
        
        <label>
          Last Name:
          <input type="text" name="lastName" required />
        </label>
        
        <label>
          Company:
          <input type="text" name="company" />
        </label>
        
        <label>
          Invoice #:
          <input type="text" name="invoice" />
        </label>
        
        <label>
          Amount:
          <input type="number" name="amount" required onChange={handleAmountChange} />
        </label>
        
        <label>
          Billing Address:
          <input type="text" name="billingAddress" required />
        </label>

        <label>
          Payment Method:
          <select value={paymentMethod} onChange={handlePaymentMethodChange}>
            <option value="ACH">ACH</option>
            <option value="CreditCard">Credit Card</option>
          </select>
        </label>

        {paymentMethod === 'ACH' && (
          <div>
            <h3>Bank Information</h3>
            <label>
              Bank Name:
              <input type="text" name="bankName" />
            </label>
            <label>
              Account Number:
              <input type="text" name="accountNumber" />
            </label>
            <label>
              Routing Number:
              <input type="text" name="routingNumber" />
            </label>
          </div>
        )}

        {paymentMethod === 'CreditCard' && (
          <div>
            <h3>Credit Card Information</h3>
            <label>
              Card Number:
              <input type="text" name="cardNumber" />
            </label>
            <label>
              Expiry Date:
              <input type="text" name="expiryDate" placeholder="MM/YYYY" />
            </label>
            <label>
              CVV:
              <input type="text" name="cvv" />
            </label>
            <p>Note: A 3% credit card fee is added to the total.</p>
          </div>
        )}

        <h3>Total: ${adjustedTotal.toFixed(2)}</h3>
        <button type="submit">Submit Payment</button>
      </form>
    </>
  );
};

const App = () => (
  <AcceptJsProvider apiLoginID="YOUR_API_LOGIN_ID" clientKey="YOUR_CLIENT_KEY">
    <PaymentForm />
  </AcceptJsProvider>
);

export default App;
