import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import './Original.css'; // Using a new CSS file to avoid conflicts

interface ChatInputProps {
  onToggleHumming: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onToggleHumming }) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

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
        <button onClick={onToggleHumming} className="chat-button mic-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2h-2z" fill="currentColor"/>
          </svg>
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
          {inputValue === '' && (
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

        <button className="chat-button send-button">
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
