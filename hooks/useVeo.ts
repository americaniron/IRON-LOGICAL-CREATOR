import { useState, useCallback, useRef, useEffect } from 'react';
import { startVideoGeneration, extendVideoGeneration, checkVideoOperationStatus, fetchVideoResult } from '../services/geminiService';
import { VIDEO_GENERATION_MESSAGES } from '../constants';
import { useAppContext } from '../context/AppContext';

interface GenerateVideoParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  model: string;
  imageFile?: File;
}

export const useVeo = () => {
  const { handleApiError } = useAppContext();
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
  
  const generateVideo = useCallback(async (params: GenerateVideoParams) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressMessage("CALIBRATING PRODUCTION RIG...");
    
    const baseEstimate = 60;
    const extensionEstimate = Math.ceil((params.duration - 8) / 7) * 45;
    startTimer(baseEstimate + (extensionEstimate > 0 ? extensionEstimate : 0));

    try {
      const requiresExtension = params.duration > 8;
      const generationModel = requiresExtension ? 'veo-3.1-generate-preview' : params.model;
      const effectiveResolution = (requiresExtension || params.model === 'veo-3.1-generate-preview') ? '720p' : params.resolution;

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

      while (currentDuration < params.duration && requiresExtension) {
        if (!isMounted.current) return;
        if (!currentVideo) throw new Error("SEQUENCE CONTINUITY ERROR.");

        setProgressMessage(`FABRICATING SEGMENT: ${currentDuration}s - ${Math.min(currentDuration + 7, params.duration)}s...`);
        
        operation = await extendVideoGeneration(
          params.prompt,
          currentVideo,
          params.aspectRatio,
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
            handleApiError(err, 'gemini_pro');
        }
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
            setProgressMessage('');
            stopTimer();
        }
    }
  }, [handleApiError]);

  return { isLoading, error, resultUrl, progressMessage, estimatedTimeRemaining, generateVideo };
};