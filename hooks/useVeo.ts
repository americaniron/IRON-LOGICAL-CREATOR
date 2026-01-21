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

  const pollOperation = useCallback(async (initialOperation: any) => {
      let operation = initialOperation;
      let messageIndex = 1;
      let retryCount = 0;
      const MAX_RETRIES = 5;

      while (!operation.done) {
          if (!isMounted.current) throw new Error('Operation cancelled: Component unmounted.');
          
          await new Promise(resolve => setTimeout(resolve, 8000));
          
          try {
            operation = await checkVideoOperationStatus(operation);
            retryCount = 0; // Reset on success
          } catch (pollErr) {
            console.warn("Polling error encountered, retrying...", pollErr);
            retryCount++;
            if (retryCount > MAX_RETRIES) throw pollErr;
            continue;
          }

          if (!isMounted.current) throw new Error('Operation cancelled: Component unmounted.');
          setProgressMessage(VIDEO_GENERATION_MESSAGES[messageIndex % VIDEO_GENERATION_MESSAGES.length]);
          messageIndex++;
      }
      return operation;
  }, []);
  
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
      
      operation = await pollOperation(operation);

      if (operation.error) {
        throw new Error(`INITIAL SEGMENT FAILED: ${operation.error.message || 'ENGINE FAILURE'}`);
      }

      // Check for successful response but missing data (sometimes returned as "UNKNOWN" state in internal logs)
      let currentVideo = operation.response?.generatedVideos?.[0]?.video;
      
      if (!currentVideo?.uri && operation.done) {
          throw new Error('INITIAL SEGMENT FAILED: Operation finished but no valid asset URI was emitted.');
      }
      
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

        operation = await pollOperation(operation);
        
        if (operation.error) {
            throw new Error(`EXTENSION SEGMENT FAILED: ${operation.error.message || 'ENGINE FAILURE'}`);
        }

        const extendedVideo = operation.response?.generatedVideos?.[0]?.video;
        if (!extendedVideo?.uri) {
            throw new Error('EXTENSION SEGMENT FAILED: Operation finished but asset extension was incomplete.');
        }

        currentVideo = extendedVideo;
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
        throw new Error('FABRICATION COMPLETE BUT EXPORT LINK IS NULL.');
      }
    } catch (err) {
        if (isMounted.current) {
            let errorMessage = err instanceof Error ? err.message : 'UNEXPECTED SYSTEM CRASH.';

            if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('resource_exhausted')) {
                errorMessage = '!! QUOTA EXHAUSTED !!\nSYSTEM HAS REACHED GENERATION LIMITS. PLEASE CHECK BILLING OR WAIT FOR RESET.';
            }

            setError(errorMessage.toUpperCase());
            handleApiError(err, 'gemini_pro');
        }
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
            setProgressMessage('');
            stopTimer();
        }
    }
  }, [handleApiError, pollOperation]);

  return { isLoading, error, resultUrl, progressMessage, estimatedTimeRemaining, generateVideo };
};