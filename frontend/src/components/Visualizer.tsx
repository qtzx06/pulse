import React, { useEffect, useRef } from "react";

const Visualizer = ({ microphone }: { microphone: MediaRecorder }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!microphone.stream) return;

    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    analyser.current = audioContext.current.createAnalyser();
    const source = audioContext.current.createMediaStreamSource(microphone.stream);
    source.connect(analyser.current);
    dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);

    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphone]);

  const draw = (): void => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser.current || !dataArray.current) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    requestAnimationFrame(draw);

    analyser.current.getByteFrequencyData(dataArray.current);

    if (!context) return;

    context.clearRect(0, 0, width, height);

    const barWidth = 10;
    let x = 0;

    for (const value of dataArray.current) {
      const barHeight = (value / 255) * height * 2;
      context.fillStyle = `rgba(0, 0, 0, 1)`;
      context.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth;
    }
  };

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}></canvas>;
};

export default Visualizer;
