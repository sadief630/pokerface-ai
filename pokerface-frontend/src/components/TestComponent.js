import React, { useState } from 'react';

const TestComponent = () => {
  const [handData, setHandData] = useState(null);

  const handleButtonClick = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/gethand');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.text();
      setHandData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleButtonClick}>
        Get Hand
      </button>
      <div style={styles.resultContainer}>
        {handData ? <p style={styles.resultText}>{handData}</p> : <p style={styles.infoText}>Press the button to get hand data.</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  resultContainer: {
    marginTop: '20px',
  },
  resultText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'green',
  },
  infoText: {
    fontSize: '16px',
    color: 'blue',
  },
};

export default TestComponent;
