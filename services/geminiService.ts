import { GoogleGenAI, GenerateContentResponse, Modality, LiveServerMessage, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const sanitizePrompt = (text: string): string => text.trim().slice(0, 10000);

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
};

const urlToBase64 = async (url: string): Promise<{ data: string, mimeType: string }> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve({
                data: (reader.result as string).split(',')[1],
                mimeType: blob.type
            });
        } else {
            reject(new Error("Failed to read blob as data URL."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};


export function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

export function createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

export async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
}

function bufferToWave(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let pos = 0;
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    const channels = [];
    for (let i = 0; i < numOfChan; i++) channels.push(abuffer.getChannelData(i));
    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true); pos += 2;
      }
      offset++;
    }
    return new Blob([view], { type: "audio/wav" });
}

export const connectLiveSession = (callbacks: { onopen: () => void, onmessage: (message: LiveServerMessage) => void, onerror: (e: ErrorEvent) => void, onclose: (e: CloseEvent) => void }) => {
    const ai = getAI();
    if (!ai) throw new Error("!! CRITICAL: Comm_Engine offline. Check API_KEY clearance. !!");
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are the AURA Core interface. Be helpful and clear.",
        },
    });
};

export const generateChatResponse = async (prompt: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AURA INTERFACE OFFLINE.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: sanitizePrompt(prompt),
      config: {
        systemInstruction: "You are the AURA Core interface. Be helpful and clear. Respond with concise, well-formatted markdown.",
        thinkingConfig: { thinkingBudget: 16384 },
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

export async function* generateChatStream(prompt: string) {
  const ai = getAI();
  if (!ai) {
    yield { text: "AURA INTERFACE OFFLINE." };
    return;
  }
  try {
    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: sanitizePrompt(prompt),
      config: {
        systemInstruction: "You are the AURA Core interface. Be helpful and clear. Respond with concise, well-formatted markdown.",
        thinkingConfig: { thinkingBudget: 16384 },
        tools: [{ googleSearch: {} }],
      }
    });
    for await (const chunk of streamResponse) {
      yield { 
        text: chunk.text,
        groundingChunks: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
}

export const generateImage = async (prompt: string, negativePrompt: string, aspectRatio: string, model: string, useGoogleSearch: boolean, resolution?: string, seed?: number): Promise<string> => {
  const ai = getAI();
  if (!ai) return "https://picsum.photos/seed/offline/1024/1024";
  try {
    const config: any = {
      imageConfig: { aspectRatio: aspectRatio as any },
      tools: useGoogleSearch ? [{ google_search: {} }] : undefined,
    };
    if (resolution) config.imageConfig.imageSize = resolution as any;
    if (seed) config.seed = seed;
    const fullPrompt = sanitizePrompt(prompt) + (negativePrompt ? `\nNegative Prompt: ${negativePrompt}` : "");
    const response = await ai.models.generateContent({ 
        model, 
        contents: { parts: [{ text: fullPrompt }] }, 
        config
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Image generation failed to return data.");
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

export const editImage = async (prompt: string, sourceImageUrl: string): Promise<string> => {
  const ai = getAI();
  if (!ai) throw new Error("AURA INTERFACE OFFLINE.");
  try {
    const imageData = await urlToBase64(sourceImageUrl);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData.data, mimeType: imageData.mimeType } },
          { text: `Edit instruction: ${sanitizePrompt(prompt)}. Maintain the original image's style and composition where possible.` }
        ]
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Image editing failed.");
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voice: string): Promise<string> => {
    const ai = getAI();
    if (!ai) throw new Error("AURA INTERFACE OFFLINE.");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sanitizePrompt(text) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data returned.");
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await decodePcmAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const url = URL.createObjectURL(bufferToWave(audioBuffer));
      audioCtx.close();
      return url;
    } catch (error) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
};

export const startVideoGeneration = async (prompt: string, aspectRatio: string, resolution: string, model: string, image?: { file?: File, base64?: string }): Promise<any> => {
  const ai = getAI();
  if (!ai) return { done: false, name: 'mock' };
  
  let imagePart;
  if (image?.file) {
    const genPart = await fileToGenerativePart(image.file);
    imagePart = { imageBytes: genPart.inlineData.data, mimeType: genPart.inlineData.mimeType };
  } else if (image?.base64) {
    const {data, mimeType} = await urlToBase64(image.base64);
    imagePart = { imageBytes: data, mimeType: mimeType };
  }

  try {
    return await ai.models.generateVideos({
      model,
      prompt: sanitizePrompt(prompt),
      image: imagePart,
      config: { numberOfVideos: 1, resolution: resolution as any, aspectRatio: aspectRatio as any }
    });
  } catch(e) {
    console.error("Gemini Service Error:", e);
    throw e;
  }
};

export const extendVideoGeneration = async (prompt: string, previousVideo: any, aspectRatio: string): Promise<any> => {
  const ai = getAI();
  if (!ai) return { done: false, name: 'mock_ext' };
  try {
    return await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: "Extend the video with this new scene: " + sanitizePrompt(prompt),
      video: previousVideo,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any }
    });
  } catch (e) {
    console.error("Gemini Service Error:", e);
    throw e;
  }
};

export const checkVideoOperationStatus = async (operation: any): Promise<any> => {
    const ai = getAI();
    if (!ai) return { done: Math.random() > 0.8 };
    return await ai.operations.getVideosOperation({ operation });
};

export const fetchVideoResult = async (downloadLink: string): Promise<string> => {
    const response = await fetch(downloadLink);
    if (!response.ok) throw new Error("Failed to download video asset.");
    return URL.createObjectURL(await response.blob());
};

export const generateTheme = async (prompt: string): Promise<any> => {
  const ai = getAI();
  if (!ai) throw new Error("AURA INTERFACE OFFLINE.");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a color scheme for a futuristic UI based on this prompt: "${prompt}". Return ONLY a valid JSON object with the specified schema. The colors should be aesthetically pleasing and accessible.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'A cool name for the theme.' },
            indigo: { type: Type.STRING, description: 'A very dark color, almost black, for the main background. Hex format.' },
            slate: { type: Type.STRING, description: 'A dark color for panel backgrounds. Hex format.' },
            mauve: { type: Type.STRING, description: 'A mid-tone color for borders and secondary elements. Hex format.' },
            violet: { type: Type.STRING, description: 'A bright, vibrant primary accent color for highlights and glows. Hex format.' },
            cyan: { type: Type.STRING, description: 'A bright secondary accent color. Hex format.' },
            light: { type: Type.STRING, description: 'A light color for primary text. Hex format.' },
            gray: { type: Type.STRING, description: 'A muted color for secondary text. Hex format.' },
          },
        },
      },
    });
    
    let jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Theme Generation Error:", error);
    throw error;
  }
};
