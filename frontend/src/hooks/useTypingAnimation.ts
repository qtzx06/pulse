import { useState, useEffect } from 'react';

const useTypingAnimation = (text: string, typingSpeed = 150, delay = 0) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const startTyping = () => {
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, typingSpeed);
    };

    const timeoutId = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, typingSpeed, delay]);

  return { displayedText };
};

export default useTypingAnimation;
