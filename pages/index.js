// pages/index.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import emailjs from 'emailjs-com';

const PaymentForm = () => {
  const [paymentMethod, setPaymentMethod] = useState('CreditCard');
  const [total, setTotal] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState(total);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === 'CreditCard') {
      setAdjustedTotal(total * 1.03); // Adding 3% fee for credit card payments
    } else {
      setAdjustedTotal(total);
    }
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    setTotal(amount);
    if (paymentMethod === 'CreditCard') {
      setAdjustedTotal(amount * 1.03); // Adding 3% fee for credit card payments
    } else {
      setAdjustedTotal(amount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const paymentData = {
      firstName: document.getElementsByName('firstName')[0].value,
      lastName: document.getElementsByName('lastName')[0].value,
      email: document.getElementsByName('email')[0].value,
      company: document.getElementsByName('company')[0].value,
      invoice: document.getElementsByName('invoice')[0].value,
      amount: adjustedTotal,
      billingAddress: document.getElementsByName('billingAddress')[0].value,
      city: document.getElementsByName('city')[0].value,
      state: document.getElementsByName('state')[0].value,
      zip: document.getElementsByName('zip')[0].value,
      paymentMethod: paymentMethod,
    };

    if (paymentMethod === 'CreditCard') {
      paymentData.cardNumber = document.getElementsByName('cardNumber')[0].value;
      paymentData.expirationDate = `${document.getElementsByName('month')[0].value}${document.getElementsByName('year')[0].value}`;
      paymentData.cardCode = document.getElementsByName('cardCode')[0].value;

      if (!paymentData.cardNumber || !paymentData.expirationDate || !paymentData.cardCode || !paymentData.zip) {
        setError('All credit card fields are required.');
        return;
      }
    } else if (paymentMethod === 'ACH') {
      paymentData.bankName = document.getElementsByName('bankName')[0].value;
      paymentData.accountType = document.getElementsByName('accountType')[0].value;
      paymentData.accountNumber = document.getElementsByName('accountNumber')[0].value;
      paymentData.routingNumber = document.getElementsByName('routingNumber')[0].value;

      if (!paymentData.bankName || !paymentData.accountType || !paymentData.accountNumber || !paymentData.routingNumber) {
        setError('All ACH fields are required.');
        return;
      }
    }

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (response.ok) {
        // Handle successful payment
        console.log('Payment Successful:', result);
        await sendEmails(paymentData.email);
        router.push('/confirmation');
      } else {
        // Handle payment error
        console.error('Payment Error:', result.message);
        setError(result.message);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('An error occurred while processing the payment. Please try again.');
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
      to_email: 'admin@example.com',
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
      await emailjs.send('service_payment_form', 'template_m1nc78t', customerTemplateParams, 'i9o7d9HF19gjgmtlW');
      await emailjs.send('service_payment_form', 'template_tkaffat', adminTemplateParams, 'i9o7d9HF19gjgmtlW');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <>
      <Script src="https://js.authorize.net/v1/Accept.js" strategy="beforeInteractive" />
      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.heading}>Varispark Payment Form</h2>

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
              <input type="text" name="zip" required style={styles.input} />
            </label>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Payment Method:
              <select value={paymentMethod} onChange={handlePaymentMethodChange} style={styles.select}>
                <option value="CreditCard">Credit Card</option>
                <option value="ACH">ACH</option>
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
                  <input type="text" name="cardNumber" required style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Expiration Month:
                  <input type="text" name="month" placeholder="MM" required style={styles.input} />
                </label>
                <label style={styles.label}>
                  Expiration Year:
                  <input type="text" name="year" placeholder="YY" required style={styles.input} />
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  CVV:
                  <input type="text" name="cardCode" required style={styles.input} />
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
