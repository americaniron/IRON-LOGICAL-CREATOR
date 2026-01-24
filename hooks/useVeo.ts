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
    
    // Duration > 8s requires extension segments. 
    // Extensions MUST have 720p base.
    const requiresExtension = params.duration > 8;
    const baseEstimate = 60;
    const extensionEstimate = Math.ceil((params.duration - 8) / 7) * 45;
    startTimer(baseEstimate + (extensionEstimate > 0 ? extensionEstimate : 0));

    try {
      // Force 720p and Slow model for multi-segment generation to ensure compatibility
      const generationModel = requiresExtension ? 'veo-3.1-generate-preview' : params.model;
      const effectiveResolution = requiresExtension ? '720p' : params.resolution;

      console.log(`Fabricating Base Segment: Model=${generationModel}, Res=${effectiveResolution}`);

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

      let currentVideo = operation.response?.generatedVideos?.[0]?.video;
      
      if (!currentVideo?.uri && operation.done) {
          throw new Error('INITIAL SEGMENT FAILED: Operation finished but no valid asset URI was emitted.');
      }
      
      let currentDuration = 8; 

      while (currentDuration < params.duration && requiresExtension) {
        if (!isMounted.current) return;
        if (!currentVideo) throw new Error("SEQUENCE CONTINUITY ERROR.");

        setProgressMessage(`FABRICATING SEGMENT: ${currentDuration}s - ${Math.min(currentDuration + 7, params.duration)}s...`);
        
        console.log(`Extending Segment: From=${currentDuration}s, Model=veo-3.1-generate-preview, Res=720p`);

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
            console.error("Fabrication Catch-All Error:", err);
            let errorMessage = "UNKNOWN FABRICATION ERROR.";
        
            // Extraction logic for JSON or direct strings
            let rawMessage = "";
            if (err instanceof Error) {
                rawMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const anyErr = err as any;
                rawMessage = anyErr.error?.message || anyErr.message || JSON.stringify(err);
            } else {
                rawMessage = String(err);
            }

            if (rawMessage.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(rawMessage);
                    rawMessage = parsed.error?.message || parsed.message || rawMessage;
                } catch (e) { /* ignore parse error */ }
            }

            const lowerMsg = rawMessage.toLowerCase();
            if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('resource_exhausted') || lowerMsg.includes('limit')) {
                errorMessage = '!! QUOTA EXHAUSTED !!\nSYSTEM HAS REACHED GENERATION LIMITS. VEO MODELS REQUIRE A PAID PROJECT WITH ACTIVE BILLING. PLEASE RE-AUTHORIZE WITH A PAID KEY.';
            } else if (lowerMsg.includes('404') || lowerMsg.includes('requested entity was not found')) {
                errorMessage = '!! PROJECT ERROR !!\nTHE SELECTED API PROJECT WAS NOT FOUND OR DOES NOT SUPPORT VEO. PLEASE RE-AUTHORIZE WITH A PAID PROJECT.';
            } else if (lowerMsg.includes('720p')) {
                errorMessage = '!! RESOLUTION CONFLICT !!\nEXTENDED SEQUENCES REQUIRE 720P BASE RIGGING. RE-CALIBRATING SYSTEM...';
            } else {
                errorMessage = rawMessage;
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