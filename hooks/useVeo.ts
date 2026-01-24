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
          
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          try {
            console.log(`Polling Operation: ${operation.name || 'Unknown'}`);
            operation = await checkVideoOperationStatus(operation);
            retryCount = 0; // Reset on success
          } catch (pollErr) {
            console.warn("Polling error encountered, retrying...", pollErr);
            retryCount++;
            if (retryCount > MAX_RETRIES) throw pollErr;
            continue;
          }

          if (!isMounted.current) throw new Error('Operation cancelled: Component unmounted.');
          
          // Check for API errors inside the operation response
          if (operation.error) return operation;

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
    setProgressMessage("INITIALIZING PRODUCTION RIG...");
    
    // Duration > 8s requires extension segments.
    // CRITICAL: Any video that will be extended MUST start as 720p.
    const requiresExtension = params.duration > 8;
    const baseEstimate = 60;
    const extensionEstimate = Math.ceil((params.duration - 8) / 7) * 45;
    startTimer(baseEstimate + (extensionEstimate > 0 ? extensionEstimate : 0));

    try {
      // FORCE 720p for the initial segment if we know we are extending.
      // Extensions do NOT support 1080p input videos.
      const effectiveResolution = requiresExtension ? '720p' : params.resolution;
      const generationModel = requiresExtension ? 'veo-3.1-generate-preview' : params.model;

      console.log(`Fabricating Segment 1: Model=${generationModel}, Resolution=${effectiveResolution}, Duration=8.2s`);

      let operation = await startVideoGeneration(
        params.prompt,
        params.aspectRatio,
        effectiveResolution as '720p' | '1080p',
        generationModel,
        params.imageFile
      );
      
      operation = await pollOperation(operation);

      if (operation.error) {
        throw new Error(`SEGMENT 1 FAILURE: ${operation.error.message || 'ENGINE ERROR'}`);
      }

      let currentVideo = operation.response?.generatedVideos?.[0]?.video;
      
      if (!currentVideo?.uri && operation.done) {
          throw new Error('FABRICATION ERROR: Operation completed but no video asset was found.');
      }
      
      let currentDuration = 8.2; 

      while (currentDuration < params.duration && requiresExtension) {
        if (!isMounted.current) return;
        if (!currentVideo) throw new Error("SEQUENCE CONTINUITY ERROR: Missing input for extension.");

        setProgressMessage(`EXTENDING TIMELINE: ${currentDuration.toFixed(1)}s / ${params.duration}s...`);
        
        console.log(`Extending Video from ${currentDuration}s. Target Resolution: 720p`);

        operation = await extendVideoGeneration(
          params.prompt,
          currentVideo,
          params.aspectRatio,
        );

        operation = await pollOperation(operation);
        
        if (operation.error) {
            throw new Error(`EXTENSION FAILURE: ${operation.error.message || 'ENGINE ERROR'}`);
        }

        const extendedVideo = operation.response?.generatedVideos?.[0]?.video;
        if (!extendedVideo?.uri) {
            throw new Error('EXTENSION ERROR: Output video object is null.');
        }

        currentVideo = extendedVideo;
        currentDuration += 7;
      }

      if (!isMounted.current) return;
      const downloadLink = currentVideo?.uri;

      if (downloadLink) {
        setProgressMessage('FINALIZING MULTIMEDIA EXPORT...');
        const finalUrl = await fetchVideoResult(downloadLink);
        if (isMounted.current) {
          setResultUrl(finalUrl);
        }
      } else {
        throw new Error('EXPORT ERROR: Download link returned null from production core.');
      }
    } catch (err) {
        if (isMounted.current) {
            console.error("Video Orchestration Error:", err);
            
            // Extract the most useful error message
            let rawMessage = "";
            if (err instanceof Error) {
                rawMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const anyErr = err as any;
                rawMessage = anyErr.error?.message || anyErr.message || JSON.stringify(err);
            } else {
                rawMessage = String(err);
            }

            // Standardize error text
            const lowerMsg = rawMessage.toLowerCase();
            let finalError = rawMessage;

            if (lowerMsg.includes('requested entity was not found') || lowerMsg.includes('404')) {
                finalError = "!! ACCESS DENIED !!\nTHE SELECTED PROJECT DOES NOT SUPPORT VEO GENERATION. PLEASE RE-AUTHORIZE WITH A PAID API KEY FROM A BILLING-ENABLED PROJECT.";
            } else if (lowerMsg.includes('quota') || lowerMsg.includes('429') || lowerMsg.includes('resource_exhausted')) {
                finalError = "!! QUOTA EXHAUSTED !!\nSYSTEM HAS REACHED API LIMITS. ENSURE YOUR PROJECT HAS BILLING ENABLED AND QUOTA IS AVAILABLE.";
            } else if (lowerMsg.includes('1080p') || lowerMsg.includes('resolution')) {
                finalError = "!! RESOLUTION MISMATCH !!\nEXTENSION RIG REQUIRES 720P BASE. SYSTEM AUTOMATICALLY DOWN-SCALED BUT ENCOUNTERED A CONFLICT.";
            }

            setError(finalError.toUpperCase());
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