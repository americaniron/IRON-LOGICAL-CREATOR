import { useState, useCallback, useRef, useEffect } from 'react';
import { startVideoGeneration, extendVideoGeneration, checkVideoOperationStatus, fetchVideoResult } from '../services/geminiService';
import { VIDEO_GENERATION_MESSAGES } from '../constants';

interface GenerateVideoParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  model: string;
  imageFile?: File | null;
  imageBase64?: string;
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
      const requiresExtension = params.duration > 8;
      const generationModel = requiresExtension ? 'veo-3.1-generate-preview' : params.model;

      let operation = await startVideoGeneration(
        params.prompt,
        params.aspectRatio,
        params.resolution,
        generationModel,
        { file: params.imageFile, base64: params.imageBase64 }
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
      
      let currentVideo = operation.response?.generatedVideos?.[0]?.video;
      let currentDuration = 8; 

      while (currentDuration < params.duration && requiresExtension) {
        if (!isMounted.current) return;
        if (!currentVideo) throw new Error("Could not retrieve video from initial generation step.");
        
        setProgressMessage(`EXTENDING VIDEO... (${currentDuration}s / ${params.duration}s)`);
        
        let extensionOperation = await extendVideoGeneration(
          'something unexpected happens',
          currentVideo,
          params.aspectRatio
        );

        let extMessageIndex = 0;
        while (!extensionOperation.done) {
            if (!isMounted.current) return;
            await new Promise(resolve => setTimeout(resolve, 5000));
            extensionOperation = await checkVideoOperationStatus(extensionOperation);
            if (!isMounted.current) return;
            setProgressMessage(`EXTENDING: ${VIDEO_GENERATION_MESSAGES[extMessageIndex % VIDEO_GENERATION_MESSAGES.length]}`);
            extMessageIndex++;
        }
        
        currentVideo = extensionOperation.response?.generatedVideos?.[0]?.video;
        currentDuration += 7;
      }

      if (currentVideo?.uri) {
        if (!isMounted.current) return;
        setProgressMessage("FINALIZING ASSET...");
        const downloadLink = currentVideo.uri;
        const finalUrl = await fetchVideoResult(downloadLink);
        if (isMounted.current) {
          setResultUrl(finalUrl);
        }
      } else {
        throw new Error("Video generation completed, but no video URI found.");
      }
    } catch (err: any) {
        if (isMounted.current) {
            if (err instanceof Error && (err.message.includes('Requested entity was not found'))) {
                resetKeySelection();
                setError('ACCESS DENIED: AUTHORIZE_PAID_KEY_REQUIRED.');
            } else {
                setError(err instanceof Error ? err.message.toUpperCase() : 'UNKNOWN_ENGINE_FAILURE.');
            }
        }
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
        }
    }
  }, []);
  
  return { isLoading, error, resultUrl, progressMessage, generateVideo };
};