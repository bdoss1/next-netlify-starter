import React, { useState } from 'react';
import Script from 'next/script';
import { useAcceptJs } from 'react-acceptjs';
import emailjs from 'emailjs-com';
import { useRouter } from 'next/router';


const PaymentForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [total, setTotal] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState(total);
  const [error, setError] = useState('');
  const router = useRouter();

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

    const email = document.getElementsByName('email')[0].value;

    if (paymentMethod === 'CreditCard') {
      const cardNumber = document.getElementsByName('cardNumber')[0].value;
      const ExpirationDate = document.getElementsByName('ExpirationDate')[0].value;
      const cardCode = document.getElementsByName('cardCode')[0].value;
      const zip = document.getElementsByName('zip')[0].value;
      const fullName = document.getElementsByName('fullName')[0].value;

      if (!cardNumber || !ExpirationDate || !cardCode || !zip || !fullName) {
        setError('All credit card fields are required.');
        return;
      }

      const cardData = {
        cardNumber: cardNumber,
        ExpirationDate: ExpirationDate,
        cardCode: cardCode,
        zip: zip,
        fullName: fullName,
      };

      console.log('Card Data:', cardData); // Debugging log

      try {
        const response = await dispatchData(cardData);
        if (response.messages.resultCode === 'Ok') {
          // Handle successful payment
          console.log('Payment Successful:', response);
          await sendEmails(email);
          router.push('/confirmation');
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
      const bankName = document.getElementsByName('bankName')[0].value;
      const accountType = document.getElementsByName('accountType')[0].value;
      const accountNumber = document.getElementsByName('accountNumber')[0].value;
      const routingNumber = document.getElementsByName('routingNumber')[0].value;

      if (!bankName || !accountType || !accountNumber || !routingNumber || !email) {
        setError('All ACH fields and email are required.');
        return;
      }

      // Handle ACH payment
      console.log('Processing ACH payment');
      await sendEmails(email);
      router.push('/confirmation');
    }
  };

  const sendEmails = async (email) => {
    const customerTemplateParams = {
      to_email: email,
      subject: 'Payment Confirmation',
      message: `
        Dear Customer,

        Thank you for submitting your payment. We have successfully received your payment of $${adjustedTotal.toFixed(2)}.

        If you have any questions or need further assistance, please feel free to contact us.

        Best regards,
        Your Company Name
      `,
    };

    const adminTemplateParams = {
      to_email: 'bdoss@varispark.com',
      subject: 'New Payment Submitted',
      message: `
        A new payment has been submitted.

        Details:
        - Amount: $${adjustedTotal.toFixed(2)}
        - Email: ${email}

        Please check the payment details in the admin dashboard.

        Best regards,
        Your Company Name
      `,
    };

    try {
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', customerTemplateParams, 'YOUR_USER_ID');
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', adminTemplateParams, 'YOUR_USER_ID');
    } catch (error) {
      console.error('Error sending email:', error);
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
              Full Name:
              <input type="text" id="fullName" name="fullName" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Email:
              <input type="email" name="email" required style={styles.input} />
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
              <input type="text" id="zip" name="zip" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Payment Method:
              <select value={paymentMethod} onChange={handlePaymentMethodChange} style={styles.select}>
                <option value="">Select Payment Method</option>
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
                  <input type="text" name="bankName" required style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Account Type:
                  <select name="accountType" required style={styles.select}>
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Account Number:
                  <input type="text" name="accountNumber" required style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Routing Number:
                  <input type="text" name="routingNumber" required style={styles.input} />
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
                  <input type="text" id="cardNumber" name="cardNumber" required style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                
                <label style={styles.label}>
                  Expiration Date:
                  <input type="text" id="ExpirationDate" name="ExpirationDate" placeholder="MM/YY" required style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  CVV:
                  <input type="text" id="cardCode" name="cardCode" required style={styles.input} />
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
