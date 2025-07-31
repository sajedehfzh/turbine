import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../lib/api';

const StatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkBackendStatus();
      setIsConnected(status);
    };
    checkStatus();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isConnected ? (
        <span style={{ color: 'green', fontSize: '24px' }}>●</span>
      ) : (
        <span style={{ color: 'red', fontSize: '24px' }}>✖</span>
      )}
      <span style={{ marginLeft: '8px' }}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default StatusIndicator; 