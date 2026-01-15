
import { useState, useCallback, useRef, useEffect } from 'react';
import { startVideoGeneration, checkVideoOperationStatus, fetchVideoResult } from '../services/geminiService';
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const generateVideo = useCallback(async (params: GenerateVideoParams, resetKeySelection: () => void) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressMessage(VIDEO_GENERATION_MESSAGES[0]);

    try {
      let operation = await startVideoGeneration(
        params.prompt,
        params.duration,
        params.aspectRatio,
        params.resolution,
        params.model,
        params.imageFile
      );
      
      let messageIndex = 1;

      while (!operation.done) {
        if (!isMounted.current) return;
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await checkVideoOperationStatus(operation);
        
        if (!isMounted.current) return;
        setProgressMessage(VIDEO_GENERATION_MESSAGES[messageIndex % VIDEO_GENERATION_MESSAGES.length]);
        messageIndex++;
      }
      
      if (!isMounted.current) return;
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

      if (downloadLink) {
        setProgressMessage('Finalizing video...');
        const finalUrl = await fetchVideoResult(downloadLink);
        if (isMounted.current) {
          setResultUrl(finalUrl);
        }
      } else {
        throw new Error('Video generation completed, but no download link was found.');
      }
    } catch (err) {
        if (isMounted.current) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during video generation.';
            setError(errorMessage);
            if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403') || errorMessage.includes('Requested entity was not found')) {
                resetKeySelection();
            }
        }
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
            setProgressMessage('');
        }
    }
  }, []);

  return { isLoading, error, resultUrl, progressMessage, generateVideo };
};
