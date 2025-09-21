import React from 'react';
import { motion } from 'framer-motion';

interface PulseVisualizerProps {
  fftData: Uint8Array;
  width: number;
  height: number;
}

const PulseVisualizer: React.FC<PulseVisualizerProps> = ({ fftData, width, height }) => {
  const numBars = fftData.length / 2; // Use half the data for a better look
  const gap = 1;
  const barWidth = (width - (numBars - 1) * gap) / numBars;

  return (
    <svg width={width} height={height} className="pulse-visualizer">
      {Array.from({ length: numBars }).map((_, index) => {
        const value = fftData[index] || 0;
        const barHeight = Math.min(Math.max((value / 255) * height, 2), height);
        const yOffset = height / 2 - barHeight / 2;

        return (
          <motion.rect
            key={index}
            x={index * (barWidth + gap)}
            y={yOffset}
            width={barWidth}
            height={barHeight}
            rx={2}
            initial={{ height: 0, y: height / 2 }}
            animate={{ height: barHeight, y: yOffset }}
            transition={{ duration: 0.05 }}
            fill="rgba(255, 255, 255, 0.7)"
          />
        );
      })}
    </svg>
  );
};

export default PulseVisualizer;
