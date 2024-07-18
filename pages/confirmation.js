import React from 'react';

const Confirmation = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Thank you for submitting your payment</h1>
    </div>
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
  heading: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#333',
  },
};

export default Confirmation;
