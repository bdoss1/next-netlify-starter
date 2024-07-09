import Head from 'next/head'
import { useState } from 'react';
import { useAcceptJs } from 'react-acceptjs';
<Head>
        <title>Varispark Client Payment Portal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

const PaymentForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('ACH');
  const [total, setTotal] = useState(100); // Replace with your actual total
  const [adjustedTotal, setAdjustedTotal] = useState(total);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === 'CreditCard') {
      setAdjustedTotal(total * 1.03); // Adding 3% fee
    } else {
      setAdjustedTotal(total);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === 'CreditCard') {
      // Use Authorize.net SDK to process credit card payment
      // This is a simplified example; you will need to set up the SDK properly and handle the API call

      const secureData = {
        cardData: {
          cardNumber: document.getElementsByName('cardNumber')[0].value,
          month: document.getElementsByName('expiryDate')[0].value.split('/')[0],
          year: document.getElementsByName('expiryDate')[0].value.split('/')[1],
          cvv: document.getElementsByName('cvv')[0].value,
        },
      };

      useAcceptJs.dispatchData(secureData, (response) => {
        if (response.messages.resultCode === 'Ok') {
          // Handle successful payment
          console.log('Payment Successful:', response);
        } else {
          // Handle payment error
          console.error('Payment Error:', response.messages.message[0].text);
        }
      });
    } else if (paymentMethod === 'ACH') {
      // Handle ACH payment
      console.log('Processing ACH payment');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Payment Form</h2>
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
            <input type="text" name="expiryDate" />
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
  );
};

export default PaymentForm;

