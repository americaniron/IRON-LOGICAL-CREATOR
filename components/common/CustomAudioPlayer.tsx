
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from './Icons';

interface CustomAudioPlayerProps {
  src: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setProgress(audio.currentTime);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const audio = audioRef.current;
    if (progressBar && audio) {
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const width = progressBar.offsetWidth;
      const newTime = (clickPosition / width) * duration;
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-asphalt/80 p-4 border-2 border-industrial-gray w-full text-left shadow-2xl relative flex items-center gap-4">
      <audio ref={audioRef} src={src} preload="metadata"></audio>
      <button 
        onClick={togglePlayPause}
        className="flex-shrink-0 p-3 bg-cyan-400 text-black hover:bg-cyan-300 transition-colors disabled:bg-gray-700"
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </button>

      <div className="flex-grow flex items-center gap-3">
        <span className="font-mono text-xs text-cyan-400">{formatTime(progress)}</span>
        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="w-full h-3 bg-asphalt border border-industrial-gray cursor-pointer"
        >
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300" 
            style={{ width: `${(progress / duration) * 100}%` }}
          ></div>
        </div>
        <span className="font-mono text-xs text-gray-500">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
