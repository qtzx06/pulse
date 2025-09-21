import React, { useRef, useEffect } from 'react';
import { useMicrophone } from '../context/MicrophoneContextProvider';

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData } = useMicrophone();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const draw = () => {
      requestAnimationFrame(draw);

      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);

      if (audioData) {
        const barWidth = width / audioData.length;
        let x = 0;

        audioData.forEach((value: number) => {
          const barHeight = (value / 255) * height;
          context.fillStyle = 'rgba(255, 255, 255, 0.5)';
          context.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth;
        });
      }
    };

    draw();
  }, [audioData]);

  return <canvas ref={canvasRef} className="audio-visualizer" />;
};

export default AudioVisualizer;
