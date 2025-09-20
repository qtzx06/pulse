import React from 'react';
import NeuroShaderCanvas from './components/NeuroShaderCanvas';
import PulseUploader from './components/PulseUploader';
import './App.css';

function App() {
  return (
    <div className="App">
      <NeuroShaderCanvas />
      <div className="content-overlay">
        <header className="App-header">
          <h1>Pulse</h1>
          <p>From Hum to Hit</p>
        </header>
        <main>
          <PulseUploader />
        </main>
      </div>
    </div>
  );
}

export default App;