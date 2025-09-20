import React from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onToggleHumming: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onToggleHumming }) => {
  return (
    <div className="chat-input-container">
      <button onClick={onToggleHumming} className="chat-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="black"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2h-2z" fill="black"/>
        </svg>
      </button>
      <input type="text" className="chat-input" placeholder="Hum a tune..." />
      <button className="chat-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="black"/>
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
