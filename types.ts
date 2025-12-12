export enum AppPhase {
  INTRO = 0,
  INPUT = 1,
  DIAGNOSIS_AND_CHAT = 2,
  CRYSTALLIZATION = 4, // "Seal" phase
  GALLERY = 5, // New Gallery Phase
}

export enum Sender {
  USER = 'user',
  AI = 'model',
}

export interface Message {
  id: string;
  text: string;
  media?: string; // Base64 Data URI (Image, Audio, Video)
  sender: Sender;
  timestamp: number;
}

export interface SealData {
  id: string;        // UUID for storage
  timestamp: number; // For sorting
  category: 'Emotion' | 'Cognition' | 'Organization' | 'Wisdom'; // For classification
  title: string;
  essence: string;
  actionPrinciple: string;
  visualPrompt: string;
  base64Image?: string; // This remains an image as it is the generated totem
  
  // The "Seed" - Original Context
  originalText?: string;
  originalMedia?: string;
}

export interface ChatSession {
    history: {role: string, parts: {text: string}[]}[];
}