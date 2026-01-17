
import React, { useRef, useEffect, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigProvider';

interface AudioVisualizerProps {
  stream: MediaStream;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream }) => {
  const { safeMode } = useContext(ConfigContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current || safeMode) return;

    const canvas = canvasRef.current;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvasCtx = canvas.getContext('2d');

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    });
    resizeObserver.observe(canvas);
    
    const draw = () => {
      if (!canvasCtx) return;

      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = '#111317'; // --asphalt
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#00BFFF'; // --cyber-cyan
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [stream, safeMode]);

  return <canvas ref={canvasRef} className={`w-full max-w-[300px] h-[50px] bg-asphalt border-2 border-industrial-gray ${safeMode ? 'opacity-20' : ''}`} />;
};

export default AudioVisualizer;
