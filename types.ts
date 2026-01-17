
export enum Task {
  Chat = 'chat',
  TextToImage = 't2i',
  TextToVideo = 't2v',
  ImageToVideo = 'i2v',
  TextToSpeech = 'tts',
  LiveConversation = 'live',
  OpenAIChat = 'oai_chat',
  OpenAITextToImage = 'oai_t2i',
  OpenAITextToVideo = 'oai_t2v',
  GrokChat = 'grok_chat',
  GrokTextToImage = 'grok_t2i',
  GrokImageToVideo = 'grok_i2v',
  ImageEdit = 'img_edit',
  Comparison = 'compare',
  Pipeline = 'pipeline',
  Theme = 'theme'
}

export enum ClearanceLevel {
  UNAUTHORIZED = 0, // No Gemini Key
  STANDARD = 1,     // Gemini Key Present
  CLASSIFIED = 2    // Gemini + Guest Keys Present
}

export type Overlay = 'security' | 'manifest' | 'logs' | null;

export enum LogSeverity {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface SystemLog {
  id: string;
  timestamp: number;
  message: string;
  severity: LogSeverity;
  provider: 'iron' | 'guest' | 'xcorp' | 'system';
  latency?: number; // Operational duration in ms
}

export interface TelemetryMetrics {
  lastLatency: number;
  totalOps: number;
  errorCount: number;
  providerLoad: {
    iron: number;
    guest: number;
    xcorp: number;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  isStreaming?: boolean;
}

export interface OrchestratorAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'data';
  url: string;
  prompt: string;
  provider: 'iron' | 'guest' | 'xcorp';
  timestamp: number;
  parentId?: string;
  status?: 'active' | 'expired';
}

export interface ImageResult {
  url: string;
  prompt: string;
}

export interface AudioResult {
  url: string;
  text: string;
}