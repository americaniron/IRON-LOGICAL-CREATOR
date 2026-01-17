import { useState, useCallback, useRef, useEffect } from 'react';
import { startVideoGeneration, extendVideoGeneration, checkVideoOperationStatus, fetchVideoResult } from '../services/geminiService';
import { VIDEO_GENERATION_MESSAGES } from '../constants';

interface GenerateVideoParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  model: string;
  imageFile?: File;
}

export const useVeo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const isMounted = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = (seconds: number) => {
    setEstimatedTimeRemaining(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setEstimatedTimeRemaining(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEstimatedTimeRemaining(null);
  };
  
  const generateVideo = useCallback(async (params: GenerateVideoParams, resetKeySelection: () => void) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressMessage("CALIBRATING PRODUCTION RIG...");
    
    // Estimate baseline: ~60s for initial generation, ~45s per extension
    const baseEstimate = 60;
    const extensionEstimate = Math.ceil((params.duration - 8) / 7) * 45;
    startTimer(baseEstimate + (extensionEstimate > 0 ? extensionEstimate : 0));

    try {
      const requiresExtension = params.duration > 8;
      const generationModel = requiresExtension ? 'veo-3.1-generate-preview' : params.model;
      
      // CRITICAL: Extension logic requires the input video to be 720p.
      // If extension is required, we force the initial resolution to 720p.
      const effectiveResolution = requiresExtension ? '720p' : params.resolution;

      // 1. Initial Step
      let operation = await startVideoGeneration(
        params.prompt,
        params.aspectRatio,
        effectiveResolution,
        generationModel,
        params.imageFile
      );
      
      let messageIndex = 1;
      while (!operation.done) {
        if (!isMounted.current) return;
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await checkVideoOperationStatus(operation);
        if (!isMounted.current) return;
        setProgressMessage(VIDEO_GENERATION_MESSAGES[messageIndex % VIDEO_GENERATION_MESSAGES.length]);
        messageIndex++;
      }
      
      let currentVideo = operation.response?.generatedVideos?.[0]?.video;
      let currentDuration = 8; 

      // 2. Extensions
      while (currentDuration < params.duration && requiresExtension) {
        if (!isMounted.current) return;
        if (!currentVideo) throw new Error("SEQUENCE CONTINUITY ERROR.");

        setProgressMessage(`FABRICATING SEGMENT: ${currentDuration}s - ${currentDuration + 7}s...`);
        
        operation = await extendVideoGeneration(
          params.prompt,
          currentVideo,
          params.aspectRatio,
          '720p' // Extensions are always 720p
        );

        while (!operation.done) {
          if (!isMounted.current) return;
          await new Promise(resolve => setTimeout(resolve, 8000));
          operation = await checkVideoOperationStatus(operation);
          if (!isMounted.current) return;
        }

        currentVideo = operation.response?.generatedVideos?.[0]?.video;
        currentDuration += 7;
      }

      if (!isMounted.current) return;
      const downloadLink = currentVideo?.uri;

      if (downloadLink) {
        setProgressMessage('FINALIZING ASSET EXPORT...');
        const finalUrl = await fetchVideoResult(downloadLink);
        if (isMounted.current) {
          setResultUrl(finalUrl);
        }
      } else {
        throw new Error('FABRICATION COMPLETE BUT LINK IS NULL.');
      }
    } catch (err) {
        if (isMounted.current) {
            const errorMessage = err instanceof Error ? err.message : 'UNEXPECTED SYSTEM CRASH.';
            setError(errorMessage);
            if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403') || errorMessage.includes('Requested entity was not found')) {
                resetKeySelection();
            }
        }
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
            setProgressMessage('');
            stopTimer();
        }
    }
  }, []);

  return { isLoading, error, resultUrl, progressMessage, estimatedTimeRemaining, generateVideo };
};