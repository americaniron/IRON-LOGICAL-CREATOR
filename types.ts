
export enum Task {
  Chat = 'chat',
  TextToImage = 't2i',
  TextToVideo = 't2v',
  ImageToVideo = 'i2v',
  TextToSpeech = 'tts',
  LiveConversation = 'live',
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
