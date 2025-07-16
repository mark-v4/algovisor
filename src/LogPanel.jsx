import React from 'react';
import { useContext } from 'react';
import { AppContext } from './AppContext';

const LogPanel = () => {
  const { logMessages } = useContext(AppContext);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '60px',
        left: '20px',
        width: '300px',
        maxHeight: '200px',
        overflowY: 'auto',
        backgroundColor: 'var(--color-background)',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: 'var(--xy-node-boxshadow-default)',
      }}
    >
      {logMessages.map((msg, index) => (
        <div key={index} style={{ color: msg.type === 'error' ? 'red' : 'black' }}>
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default LogPanel;