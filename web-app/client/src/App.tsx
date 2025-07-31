import React from 'react';
import './App.css';
import Header from './components/Header';
import PowerCurve from './components/Curve';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <PowerCurve />
      </main>
    </div>
  );
}

export default App;
