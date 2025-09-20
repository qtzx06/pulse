import React from 'react';
import NeuroShaderCanvas from './components/NeuroShaderCanvas';
import './App.css';

function App() {
  return (
    <div className="App">
      <NeuroShaderCanvas />
      <div style={{
        width: '400px',
        height: '250px',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        mixBlendMode: 'difference'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: 'black' }}>Pulse</h1>
        <p style={{ fontSize: '1rem', margin: '0', color: 'rgba(0, 0, 0, 0.8)' }}>From Hum to Hit</p>
      </div>
    </div>
  );
}

export default App;