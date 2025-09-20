import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import NeuroShaderCanvas from './components/NeuroShaderCanvas';
import { useMicrophone, MicrophoneState } from './context/MicrophoneContextProvider';
import './App.css';

const title = "PULSE";

// ... (variants remain the same)

const titleContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 2,
      staggerChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: (i: number) => {
    if (i < 2) return { x: -100, opacity: 0 }; // P, U from left
    if (i > 2) return { x: 100, opacity: 0 };  // S, E from right
    return { y: -100, opacity: 0 };           // L from top
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 },
  },
};


function App() {
  const [isHumming, setIsHumming] = useState(false);
  const { setupMicrophone, startMicrophone, stopMicrophone, microphoneState } = useMicrophone();
  const pathRef = useRef<SVGPathElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const mousePos = useRef({ x: -999, y: -999 });
  const animatedMousePos = useRef({ x: -999, y: -999 });

  useEffect(() => {
    setupMicrophone();
  }, [setupMicrophone]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animateWave = (timestamp: number) => {
      if (!pathRef.current || !barRef.current) return;

      const barRect = barRef.current.getBoundingClientRect();

      // Smoothly follow the mouse
      animatedMousePos.current.x += (mousePos.current.x - animatedMousePos.current.x) * 0.05;
      animatedMousePos.current.y += (mousePos.current.y - animatedMousePos.current.y) * 0.05;
      
      const mouseX = animatedMousePos.current.x - barRect.left;
      const mouseY = animatedMousePos.current.y - barRect.top;

      const points = [];
      const segments = 100; // More segments for a smoother curve
      for (let i = 0; i <= segments; i++) {
        const x = (barRect.width / segments) * i;
        
        // Base wave
        const sineWave = Math.sin(x * 0.01 + timestamp * 0.002) * 10;

        // Mouse interaction (a bell curve based on mouse proximity)
        const mouseDist = Math.abs(x - mouseX);
        const proximity = Math.max(0, 1 - mouseDist / 200); // 200 is the radius of influence
        const mouseEffect = Math.pow(proximity, 2) * 50 * Math.max(0, 1 - mouseY / 150);

        points.push([x, Math.min(barRect.height, sineWave + mouseEffect)]);
      }

      const pathData =
        `M 0 ${points[0][1]}` +
        points.map(p => ` L ${p[0]} ${p[1]}`).join('') +
        ` L ${barRect.width} ${barRect.height} L 0 ${barRect.height} Z`;

      pathRef.current.setAttribute('d', pathData);
      animationFrameId.current = requestAnimationFrame(animateWave);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId.current = requestAnimationFrame(animateWave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

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
      <svg className="clip-svg">
        <defs>
          <clipPath id="wave-clip">
            <path ref={pathRef} d={`M 0 0 L ${window.innerWidth} 0 L ${window.innerWidth} ${window.innerHeight} L 0 ${window.innerHeight} Z`} />
          </clipPath>
        </defs>
      </svg>

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

      <motion.div
        className="shader-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <NeuroShaderCanvas />
      </motion.div>

      <motion.div
        ref={barRef}
        className="inverter-bar"
        initial={{ y: '-100vh' }}
        animate={{ y: '0' }}
        transition={{
          type: 'tween',
          ease: [0.4, 0, 0.2, 1],
          duration: 1.4,
          delay: 1.5,
        }}
      />

      <div className="title-and-button-container">
        <motion.div
          className="center-title"
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {title.split('').map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              variants={letterVariants}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
        <motion.div
          className="center-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <button onClick={toggleHumming} className="hum-button">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V24h2v-3.06A9 9 0 0 0 21 12v-2h-2z" fill="white"/>
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default App;