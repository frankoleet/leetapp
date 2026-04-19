export type WordPair = {
  id: string;
  english: string;
  russian: string;
  transcription?: string;
  mnemonic?: string;
};

export type SwipeDirection = 'known' | 'unknown';

export type UserProgress = {
  knownWords: string[];
  unknownWords: string[];
  knownCount: number;
  unknownCount: number;
};
