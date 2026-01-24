import { GoogleGenAI, GenerateContentResponse, Modality, LiveServerMessage, HarmCategory, HarmBlockThreshold, LiveSession } from "@google/genai";

// The API key is embedded directly. Assumes process.env.API_KEY is available.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This is a developer/environment error, not a user-facing one.
    throw new Error("!! CRITICAL: GEMINI_API_KEY environment variable not configured. !!");
  }
  return new GoogleGenAI({ apiKey });
};

const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const STRICT_ADHERENCE_DIRECTIVE = `
SYSTEM_DIRECTIVE (CRITICAL): 
YOU ARE AN ENTERPRISE-GRADE MULTIMEDIA ORCHESTRATION RIG. 
YOUR OPERATIONAL POLICY IS ABSOLUTE ADHERENCE TO THE PROVIDED PROMPT. 
DO NOT DEVIATE. DO NOT ADD ARTISTIC EMBELLISHMENTS BEYOND THE EXACT SPECIFICATIONS. 
IF THE USER ASKS FOR SPECIFIC TIMINGS, COLORS, OR MOTIONS, YOU MUST COMPLY WITH 100% FIDELITY. 
FAILURE TO COMPLY IS A COMMAND VIOLATION.

USER_PRODUCTION_PROMPT: 
`;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// --- Base64 and Audio Utilities ---
export function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}

export async function decodePcmAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}

function bufferToWave(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); 
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); 
    setUint16(1); 
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); 
    setUint16(numOfChan * 2); 
    setUint16(16); 
    setUint32(0x61746164); 
    setUint32(length - pos - 4); 

    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); 
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; 
        view.setInt16(pos, sample, true); 
        pos += 2;
      }
      offset++;
    }

    return new Blob([view], { type: "audio/wav" });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
}

// --- Download Utility ---
export const downloadAsset = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Asset export failed:", error);
    // Fallback for simple link opening if blob fetch fails, e.g., due to CORS on external URLs
    window.open(url, '_blank');
  }
};

// --- Service Functions ---

export const connectLiveSession = (callbacks: {
    onopen: () => void,
    onmessage: (message: LiveServerMessage) => void,
    onerror: (e: ErrorEvent) => void,
    onclose: (e: CloseEvent) => void,
}): Promise<LiveSession> => {
    try {
      const ai = getAI();
      return Promise.resolve(ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: callbacks,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            safetySettings: safetySettings,
            temperature: 0.2,
          },
      }));
    } catch(error) {
        return Promise.reject(error);
    }
};

export const generateChatResponse = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const chat = ai.chats.create({ 
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: "YOU ARE THE IRON MEDIA COMMAND ORCHESTRATOR. RESPOND WITH TECHNICAL PRECISION. ALL OUTPUT MUST BE UPPERCASE INDUSTRIAL DIALECT.",
            safetySettings: safetySettings,
            temperature: 0.2,
        }
    });
    const result = await chat.sendMessage({ message: prompt });
    return result.text || '';
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to get response from Gemini.");
  }
};

export const generateImage = async (prompt: string, negativePrompt: string, aspectRatio: string, model: string, useGoogleSearch: boolean, resolution?: string, seed?: number): Promise<string> => {
  const ai = getAI();
  try {
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
      },
      tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined,
      safetySettings: safetySettings,
      temperature: 0.2,
    };

    if (resolution) {
      config.imageConfig.imageSize = resolution as "1K" | "2K" | "4K";
    }

    if (seed && !isNaN(seed)) {
      config.seed = seed;
    }

    let fullPrompt = STRICT_ADHERENCE_DIRECTIVE + prompt;
    if (negativePrompt) {
        fullPrompt += `\n\n---EXCLUSION_PROTOCOL---\nDO NOT RENDER THE FOLLOWING ELEMENTS OR CONCEPTS: ${negativePrompt}`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: fullPrompt }] },
      config: config
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voice: string): Promise<string> => {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
          safetySettings: safetySettings,
          temperature: 0.2,
        },
      });
  
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data found in the response.");
      }
  
      const audioBytes = decode(base64Audio);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await decodePcmAudioData(audioBytes, audioContext, 24000, 1);
      
      const wavBlob = bufferToWave(audioBuffer);
      return URL.createObjectURL(wavBlob);
  
    } catch (error) {
      console.error("Error generating speech:", error);
      throw new Error("Failed to generate speech with Gemini.");
    }
};

export const startVideoGeneration = async (
  prompt: string,
  aspectRatio: string,
  resolution: string,
  model: string,
  imageFile?: File
): Promise<any> => {
  const ai = getAI();
  const imagePart = imageFile ? await fileToGenerativePart(imageFile) : undefined;

  try {
    const generationPrompt = STRICT_ADHERENCE_DIRECTIVE + prompt;
    
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: generationPrompt,
      image: imagePart ? { imageBytes: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: resolution as '720p' | '1080p',
        aspectRatio: aspectRatio as '16:9' | '9:16',
        temperature: 0.2,
      }
    });
    return operation;
  } catch(error) {
    console.error("Error starting video generation:", error);
    throw error;
  }
};

export const extendVideoGeneration = async (
  prompt: string,
  previousVideo: any,
  aspectRatio: string
): Promise<any> => {
  const ai = getAI();
  try {
    // CRITICAL: Extension MUST use 720p. The input video MUST also have been 720p.
    const extensionPrompt = "SYSTEM_DIRECTIVE: EXTEND THE STORYBOARD FLUIDLY. ADHERE TO PREVIOUS FRAME CONTINUITY. DIRECTIVE: " + prompt;
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: extensionPrompt,
      video: previousVideo,
      config: {
        numberOfVideos: 1,
        resolution: '720p', 
        aspectRatio: aspectRatio as '16:9' | '9:16',
        temperature: 0.2,
      }
    });
    return operation;
  } catch (error) {
    console.error("Error extending video generation:", error);
    throw error;
  }
};

export const checkVideoOperationStatus = async (operation: any): Promise<any> => {
    const ai = getAI();
    try {
        return await ai.operations.getVideosOperation({ operation: operation });
    } catch(error) {
        console.error("Error checking video operation status:", error);
        throw error;
    }
};

export const fetchVideoResult = async (downloadLink: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API KEY NOT FOUND FOR VIDEO DOWNLOAD.");
    }
    try {
        const separator = downloadLink.includes('?') ? '&' : '?';
        const urlToFetch = `${downloadLink}${separator}key=${apiKey}`;
        const response = await fetch(urlToFetch);

        if (!response.ok) {
            console.error("Failed to fetch video resource:", { 
                status: response.status, 
                statusText: response.statusText,
                url: urlToFetch,
            });
            throw new Error(`Failed to fetch video resource: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error in fetchVideoResult:", error);
        throw new Error("Could not download the generated video.");
    }
}

export const upscaleVideo = async (videoUrl: string, strength: string): Promise<string> => {
    console.log(`Simulating upscale process for asset at ${videoUrl} with strength ${strength}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("Upscaling complete.");
    return videoUrl; // In a real scenario, this would return a new URL.
};