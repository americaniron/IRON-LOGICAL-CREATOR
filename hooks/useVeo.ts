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
      while (!operation.done) {
          if (!isMounted.current) throw new Error('Operation cancelled: Component unmounted.');
          await new Promise(resolve => setTimeout(resolve, 8000));
          operation = await checkVideoOperationStatus(operation);

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

      const initialState = operation.response?.generatedVideos?.[0]?.video?.state;
      if (initialState !== 'SUCCEEDED') {
          const failureReason = operation.error?.message || `Video processing failed with state: ${initialState}`;
          throw new Error(`INITIAL SEGMENT FAILED: ${failureReason}`);
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

        operation = await pollOperation(operation);
        
        const extendedState = operation.response?.generatedVideos?.[0]?.video?.state;
        if (extendedState !== 'SUCCEEDED') {
            const failureReason = operation.error?.message || `Video extension failed with state: ${extendedState}`;
            throw new Error(`EXTENSION SEGMENT FAILED: ${failureReason}`);
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
            let errorMessage = err instanceof Error ? err.message : 'UNEXPECTED SYSTEM CRASH.';

            if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('resource_exhausted')) {
                try {
                    const errorObj = JSON.parse(errorMessage);
                    const detailedMessage = errorObj?.error?.message || 'Rate limit or quota exceeded.';
                    errorMessage = `!! QUOTA EXHAUSTED !!\n${detailedMessage.toUpperCase()}`;
                } catch (e) {
                    errorMessage = '!! QUOTA EXHAUSTED !!\nYOU HAVE SURPASSED THE VIDEO GENERATION LIMIT FOR YOUR CURRENT PLAN. PLEASE CHECK YOUR BILLING DETAILS OR WAIT FOR THE QUOTA TO RESET.';
                }
            } else if (errorMessage.toLowerCase().includes('invalid_argument')) {
                try {
                    const errorJsonMatch = errorMessage.match(/{.*}/);
                    if (errorJsonMatch) {
                        const errorObj = JSON.parse(errorJsonMatch[0]);
                        const detailedMessage = errorObj?.ERROR?.MESSAGE || errorObj?.error?.message || 'The video segment for extension is invalid.';
                        errorMessage = `!! INVALID ARGUMENT !!\n${detailedMessage.toUpperCase()}`;
                    } else {
                         errorMessage = `!! INVALID ARGUMENT !!\n${errorMessage.toUpperCase()}`;
                    }
                } catch (e) {
                    errorMessage = `!! INVALID ARGUMENT !!\nTHE PREVIOUSLY GENERATED VIDEO SEGMENT COULD NOT BE USED FOR EXTENSION. PLEASE TRY AGAIN. RAW: ${errorMessage}`;
                }
            }


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
  }, [handleApiError, pollOperation]);

  return { isLoading, error, resultUrl, progressMessage, estimatedTimeRemaining, generateVideo };
};
