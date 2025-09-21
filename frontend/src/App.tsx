import { useState, useEffect, useRef } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import NeuroShaderCanvas from './components/NeuroShaderCanvas';
import ChatInput from './components/ChatInput';
import ThreeJSAudioVisualizer from './components/ThreeJSAudioVisualizer'; // Import the new component
import './App.css';
import { main as musicMain } from './music_index';
import { LiveMusicHelper } from './music_utils/LiveMusicHelper';

const title = "PULSE";

// --- SVG Path Smoothing Helpers ---
const line = (pointA: any, pointB: any) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};

const controlPoint = (current: any, previous: any, next: any, reverse: any, smoothing = 0.2) => {
  const p = previous || current;
  const n = next || current;
  const l = line(p, n);
  const angle = l.angle + (reverse ? Math.PI : 0);
  const length = l.length * smoothing;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

const bezierCommand = (point: any, i: any, a: any) => {
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point, false);
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

const svgPath = (points: any) => {
  return points.reduce(
    (acc: any, point: any, i: any, a: any) =>
      i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${bezierCommand(point, i, a)}`,
    ''
  );
};
// --- End of SVG Path Smoothing Helpers ---


const titleContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 2,
      staggerChildren: 0.1,
    },
  },
};

const letterVariants: Variants = {
  hidden: (i: number) => {
    if (i < 2) return { x: -100, opacity: 0 }; // P, U from left
    if (i > 2) return { x: 100, opacity: 0 };  // S, E from right
    return { y: -100, opacity: 0 };           // L from top
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 50, damping: 15 }, // Slower and smoother spring
  },
};


function App() {
  const pathRef = useRef<SVGPathElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const [isExpanded, setIsExpanded] = useState(false);
  const musicHelperRef = useRef<LiveMusicHelper | null>(null);
  const updatePromptRef = useRef<((text: string) => Promise<void>) | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isFlickerComplete, setIsFlickerComplete] = useState(false);

  useEffect(() => {
    if (!musicHelperRef.current) {
      const { liveMusicHelper, updateFirstPrompt } = musicMain();
      musicHelperRef.current = liveMusicHelper;
      updatePromptRef.current = updateFirstPrompt;
    }
  }, []);

  const handleSend = (text: string) => {
    setIsExpanded(true);

    if (updatePromptRef.current) {
      updatePromptRef.current(text);
    }

    if (!musicStarted && musicHelperRef.current) {
      musicHelperRef.current.play();
      setMusicStarted(true);
    }
  };

  useEffect(() => {
    const animateWave = (timestamp: number) => {
      if (!pathRef.current || !barRef.current) return;

      const barRect = barRef.current.getBoundingClientRect();
      const headroom = 50;

      const points = [];
      const segments = 50;
      for (let i = 0; i <= segments; i++) {
        const x = (barRect.width / segments) * i;
        const sineWave = Math.sin(x * 0.01 + timestamp * 0.002) * 10;
        points.push([x, headroom + sineWave]);
      }

      const smoothPath = svgPath(points);

      const pathData =
        smoothPath +
        ` L ${barRect.width} ${barRect.height} L 0 ${barRect.height} Z`;

      pathRef.current.setAttribute('d', pathData);
      animationFrameId.current = requestAnimationFrame(animateWave);
    };

    animationFrameId.current = requestAnimationFrame(animateWave);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  

  return (
    <div className="App">
       <AnimatePresence>
        {musicStarted && musicHelperRef.current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.3, 1, 0.6, 1] }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -2 }}
            onAnimationComplete={() => setIsFlickerComplete(true)}
          >
            <ThreeJSAudioVisualizer analyser={musicHelperRef.current.analyser} isFlickerComplete={isFlickerComplete} />
          </motion.div>
        )}
      </AnimatePresence>
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
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <NeuroShaderCanvas />
      </motion.div>

      <motion.div
        ref={barRef}
        className="inverter-bar"
        initial={{ y: 'calc(100vh + 150px)' }}
        animate={{
          y: isExpanded ? '0px' : 'calc(50vh + 100px)'
        }}
        transition={{
          type: 'tween',
          ease: [0.4, 0, 0.2, 1],
          duration: 1.4,
          delay: isExpanded ? 0 : 1.5,
        }}
      />

      <div className="title-and-button-container">
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              key="title-group"
              exit={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
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
              <motion.p
                className="subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
              >
                hum a tune.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="center-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <ChatInput onSend={handleSend} />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
