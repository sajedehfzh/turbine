import React from 'react';
import StatusIndicator from './StatusIndicator';

const Header: React.FC = () => {
  return (
    <header className="App-header">
      <img src={process.env.PUBLIC_URL + '/logo.jpg'} className="App-logo" alt="logo" />
      <h1>Turbine Power Curve Analysis</h1>
      <StatusIndicator />
    </header>
  );
};

export default Header; 