import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import PulseVisualizer from './PulseVisualizer';
import './Original.css';
import './ChatInput.css';

interface ChatInputProps {
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [fftData, setFftData] = useState(new Uint8Array(0));

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setupMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      mediaStreamSourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setFftData(dataArray);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const startRecording = () => {
    if (isRecording) return;
    setupMicrophone().then(() => {
      setIsRecording(true);
      const draw = () => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          setFftData(dataArray);
          animationFrameRef.current = requestAnimationFrame(draw);
        }
      };
      draw();
    });
  };

  const stopRecording = () => {
    if (!isRecording) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setFftData(new Uint8Array(0));
  };

  const toggleHumming = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <motion.div
      className="search-container"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
        hidden: { y: -50, opacity: 0 },
      }}
    >
      <div className={`search-field-wrapper ${isInputFocused ? 'focused' : ''}`}>
        {isRecording && (
          <div className="voice-visualizer-container">
            <PulseVisualizer fftData={fftData} width={200} height={30} />
          </div>
        )}
        <button onClick={toggleHumming} className="chat-button mic-button">
          {isRecording ? (
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h12v12H6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2h-2z" fill="currentColor"/>
            </svg>
          )}
        </button>
        
        <div className="input-wrapper">
          <input 
            type="text" 
            className="search-input" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {inputValue === '' && !isRecording && (
            <div className="placeholder-animation">
              <span>i'm feeling...&nbsp;</span>
              <TypeAnimation
                sequence={[
                  'edm', 2000, 'rock', 2000, 'pop', 2000, 'hip hop', 2000, 'jazz', 2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
          )}
        </div>

        <button onClick={onSend} className="chat-button send-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
          </svg>
        </button>

        {/* Laser tracing effect */}
        <div className="laser-trace top"></div>
        <div className="laser-trace bottom"></div>
      </div>
    </motion.div>
  );
};

export default ChatInput;