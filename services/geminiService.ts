
import { GoogleGenAI, GenerateContentResponse, Modality, LiveServerMessage } from "@google/genai";

// Create a new instance right before making an API call to ensure it uses the most up-to-date key.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

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

// --- Mock Implementations ---
const mockWait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CHAT_RESPONSE = "OPERATIONS ACKNOWLEDGED. GENERATING STRUCTURAL BLUEPRINTS FOR YOUR MULTIMEDIA ASSETS. STANDBY FOR FABRICATION COMMENCEMENT.";

const MOCK_IMAGE_URL = "https://picsum.photos/seed/industrial/1024/1024";

const MOCK_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";


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

// Helper to convert AudioBuffer to a WAV Blob for browser playback
function bufferToWave(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
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


// --- Service Functions ---

export const connectLiveSession = (callbacks: {
    onopen: () => void,
    onmessage: (message: LiveServerMessage) => void,
    onerror: (e: ErrorEvent) => void,
    onclose: (e: CloseEvent) => void,
}) => {
    const ai = getAI();
    if (!ai) {
      throw new Error("!! CRITICAL: Comm_Engine offline. Check API_KEY clearance. !!");
    }
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: callbacks,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
    });
};

export const generateChatResponse = async (prompt: string): Promise<string> => {
  const ai = getAI();
  if (!ai) {
    await mockWait(1000);
    return MOCK_CHAT_RESPONSE;
  }
  
  try {
    const chat = ai.chats.create({ model: 'gemini-3-flash-preview' });
    const result = await chat.sendMessage({ message: prompt });
    return result.text || '';
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to get response from Gemini.");
  }
};

export const generateImage = async (prompt: string, aspectRatio: string, model: string, useGoogleSearch: boolean, resolution?: string, seed?: number): Promise<string> => {
  const ai = getAI();
  if (!ai) {
    await mockWait(2500);
    return MOCK_IMAGE_URL;
  }

  try {
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
      },
      tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined,
    };

    if (resolution) {
      config.imageConfig.imageSize = resolution as "1K" | "2K" | "4K";
    }

    if (seed && !isNaN(seed)) {
      config.seed = seed;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
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
    throw new Error("Failed to generate image with Gemini.");
  }
};

export const generateSpeech = async (text: string, voice: string): Promise<string> => {
    const ai = getAI();
    if (!ai) {
      await mockWait(1500);
      throw new Error("!! ACCESS DENIED: PA_SYSTEM REQUIRES API_KEY CLEARANCE. !!");
    }
  
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
  duration: number,
  aspectRatio: string,
  resolution: string,
  model: string,
  imageFile?: File
): Promise<any> => {
  const ai = getAI();
  if (!ai) {
    await mockWait(1000);
    return { done: false, name: 'mock_operation_123' };
  }
  
  const imagePart = imageFile ? await fileToGenerativePart(imageFile) : undefined;

  try {
    // We append the duration to the prompt to ensure the model targets the requested length,
    // as it is the most reliable way to influence frame count in the current Veo API iteration.
    const generationPrompt = `${prompt} Duration target: ${duration} seconds.`;
    
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: generationPrompt,
      image: imagePart ? { imageBytes: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: resolution as '720p' | '1080p',
        aspectRatio: aspectRatio as '16:9' | '9:16',
      }
    });
    return operation;
  } catch(error) {
    console.error("Error starting video generation:", error);
    throw new Error("Failed to start video generation with Veo.");
  }
};

export const checkVideoOperationStatus = async (operation: any): Promise<any> => {
    const ai = getAI();
    if (!ai) {
        await mockWait(8000); 
        const isDone = Math.random() > 0.4;
        if (isDone) {
            return { 
                done: true, 
                response: { 
                    generatedVideos: [{ video: { uri: MOCK_VIDEO_URL } }] 
                } 
            };
        }
        return { done: false, name: operation.name };
    }

    try {
        return await ai.operations.getVideosOperation({ operation: operation });
    } catch(error) {
        console.error("Error checking video operation status:", error);
        throw new Error("Failed to check video status.");
    }
};

export const fetchVideoResult = async (downloadLink: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if(!apiKey) {
        return downloadLink;
    }
    try {
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error fetching video result:", error);
        throw new Error("Could not download the generated video.");
    }
}
