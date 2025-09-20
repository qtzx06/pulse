import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NeuroShaderCanvas from './components/NeuroShaderCanvas';
import Visualizer from './components/Visualizer';
import { useMicrophone, MicrophoneState } from './context/MicrophoneContextProvider';
import './App.css';

function App() {
  const [isHumming, setIsHumming] = useState(false);
  const { microphone, setupMicrophone, startMicrophone, stopMicrophone, microphoneState } = useMicrophone();

  useEffect(() => {
    setupMicrophone();
  }, [setupMicrophone]);

  const toggleHumming = () => {
    if (isHumming) {
      stopMicrophone();
      setIsHumming(false);
    } else {
      if (microphoneState === MicrophoneState.Ready) {
        startMicrophone();
        setIsHumming(true);
      }
    }
  };

  return (
    <div className="App">
      {/* Starts as a white screen, then fades out to reveal the content */}
      <motion.div
        className="white-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        onAnimationComplete={() => {
          const el = document.querySelector('.white-overlay');
          if (el) (el as HTMLElement).style.display = 'none';
        }}
      />

      {/* The canvas fades in after the white screen starts fading */}
      <motion.div
        className="shader-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <NeuroShaderCanvas />
      </motion.div>

      {isHumming && microphone && <Visualizer microphone={microphone} />}

      {/* The inverter bar slides in after the canvas is visible */}
      <motion.div
        className="inverter-bar"
        initial={{ y: '-100vh' }}
        animate={{ y: '0' }}
        transition={{
          type: 'tween',
          ease: [0.4, 0, 0.2, 1], // A gentler, more standard ease-out curve
          duration: 1.4, // Slower and smoother
          delay: 1.5,
        }}
      />

      {/* The title and button fade in last */}
      <motion.div
        className="title-and-button-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <h1 className="center-title">PULSE</h1>
        <div className="center-button">
          <button onClick={toggleHumming} className="hum-button">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2h-2z" fill="white"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default App;