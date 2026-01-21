export enum Task {
  Chat = 'chat',
  TextToImage = 't2i',
  TextToVideo = 't2v',
  ImageToVideo = 'i2v',
  TextToSpeech = 'tts',
  LiveConversation = 'live',
  AssetBay = 'asset_bay',
  OpenAIChat = 'oai_chat',
  OpenAITextToImage = 'oai_t2i',
  OpenAITextToVideo = 'oai_t2v',
  GrokChat = 'grok_chat',
  GrokTextToImage = 'grok_t2i',
  GrokTextToVideo = 'grok_t2v',
  AdminPanel = 'admin_panel',
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
}

export interface ImageResult {
    url: string;
    prompt: string;
}

export interface VideoResult {
    url: string;
    prompt: string;
}

export interface AudioResult {
    url: string;
    text: string;
}

export type AssetType = 'image' | 'video';
export type AssetProvider = 'Gemini' | 'OpenAI' | 'Grok';

export interface Asset {
  id: string;
  url: string;
  type: AssetType;
  prompt: string;
  provider: AssetProvider;
  timestamp: number;
}

export interface AccessRequest {
    id: string;
    name: string;
    reason: string;
    timestamp: number;
    status: 'pending' | 'approved' | 'denied';
    generatedPin?: string;
}

export type OperativePlan = 'basic' | 'pro' | 'commander';

export interface UserAccount {
    id: string;
    name: string;
    pin: string;
    role: 'admin' | 'user';
    credits: number;
    plan: OperativePlan;
    joinedAt: number;
}

export interface UserSession extends Omit<UserAccount, 'pin'> {
    token: string;
}

export const FABRICATION_COSTS = {
    [Task.Chat]: 1,
    [Task.TextToImage]: 25,
    [Task.TextToVideo]: 100,
    [Task.ImageToVideo]: 150,
    [Task.TextToSpeech]: 10,
    [Task.LiveConversation]: 50, // Per session
} as const;