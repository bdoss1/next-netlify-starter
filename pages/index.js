import React, { useState } from 'react';
import Script from 'next/script';
import { useAcceptJs } from 'react-acceptjs';

const PaymentForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('ACH');
  const [total, setTotal] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState(total);
  const [error, setError] = useState('');

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
    setError('');

    if (paymentMethod === 'CreditCard') {
      const cardData = {
        cardNumber: document.getElementsByName('cardNumber')[0].value,
        month: document.getElementsByName('expiryDate')[0].value.split('/')[0],
        year: document.getElementsByName('expiryDate')[0].value.split('/')[1],
        cvv: document.getElementsByName('cvv')[0].value,
      };

      console.log('Card Data:', cardData); // Debugging log

      try {
        const response = await dispatchData(cardData);
        if (response.messages.resultCode === 'Ok') {
          // Handle successful payment
          console.log('Payment Successful:', response);
        } else {
          // Handle payment error
          console.error('Payment Error:', response.messages.message[0].text);
          setError(response.messages.message[0].text);
        }
      } catch (error) {
        console.error('Error dispatching data:', error);
        setError('An error occurred while processing the payment. Please try again.');
      }
    } else if (paymentMethod === 'ACH') {
      // Handle ACH payment
      console.log('Processing ACH payment');
    }
  };

  return (
    <>
      <Script src="https://js.authorize.net/v1/Accept.js" strategy="beforeInteractive" />
      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.heading}>Payment Form</h2>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              First Name:
              <input type="text" name="firstName" required style={styles.input} />
            </label>

            <label style={styles.label}>
              Last Name:
              <input type="text" name="lastName" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Company:
              <input type="text" name="company" style={styles.input} />
            </label>

           
          </div>

          <div style={styles.inputGroup}>
          <label style={styles.label}>
              Invoice #:
              <input type="text" name="invoice" style={styles.input} />
            </label>
            
            <label style={styles.label}>
              Amount:
              <input type="number" name="amount" required onChange={handleAmountChange} style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Billing Address:
              <input type="text" name="billingAddress" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              City:
              <input type="text" name="city" required style={styles.input} />
            </label>

            <label style={styles.label}>
              State:
              <input type="text" name="state" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Zip:
              <input type="text" name="zip" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Payment Method:
              <select value={paymentMethod} onChange={handlePaymentMethodChange} style={styles.select}>
                <option value="ACH">ACH</option>
                <option value="CreditCard">Credit Card</option>
              </select>
            </label>
          </div>

          {paymentMethod === 'ACH' && (
            <div>
              <h3 style={styles.subheading}>Bank Information</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Bank Name:
                  <input type="text" name="bankName" style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Account Number:
                  <input type="text" name="accountNumber" style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Routing Number:
                  <input type="text" name="routingNumber" style={styles.input} />
                </label>
              </div>
            </div>
          )}

          {paymentMethod === 'CreditCard' && (
            <div>
              <h3 style={styles.subheading}>Credit Card Information</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Card Number:
                  <input type="text" name="cardNumber" style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Expiry Date:
                  <input type="text" name="expiryDate" placeholder="MM/YYYY" style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  CVV:
                  <input type="text" name="cvv" style={styles.input} />
                </label>
              </div>
              <p style={styles.note}>Note: A 3% credit card fee is added to the total.</p>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <h3 style={styles.total}>Total: ${adjustedTotal.toFixed(2)}</h3>
          <button type="submit" style={styles.button}>Submit Payment</button>
        </form>
      </div>
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
  },
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  inputGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  label: {
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column',
    marginRight: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '5px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '5px',
  },
  subheading: {
    marginTop: '20px',
    marginBottom: '10px',
    fontSize: '18px',
  },
  note: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center',
  },
  total: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '18px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default PaymentForm;
