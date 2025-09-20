import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MicrophoneContextProvider } from './context/MicrophoneContextProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MicrophoneContextProvider>
      <App />
    </MicrophoneContextProvider>
  </React.StrictMode>,
)
