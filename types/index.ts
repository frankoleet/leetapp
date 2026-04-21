export type WordSource = 'system' | 'custom';

export type WordPair = {
  id: string;
  english: string;
  russian: string;
  transcription?: string;
  mnemonic?: string;
};

export type Word = WordPair & {
  source: WordSource;
};

export type CustomWord = Word & {
  source: 'custom';
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CustomWordInput = {
  english: string;
  russian: string;
  transcription?: string;
  mnemonic?: string;
};

export type SwipeDirection = 'known' | 'unknown';

export type StudyMode = 'system:start' | 'system:review' | 'custom:start' | 'custom:review';

export type StudyReviewBucket = 'known' | 'unknown';

export type WordProgressKey = `${WordSource}:${string}`;

export type UserProgress = {
  knownWords: WordProgressKey[];
  unknownWords: WordProgressKey[];
  knownCount: number;
  unknownCount: number;
};

export type SourceStats = {
  total: number;
  known: number;
  unknown: number;
  unstudied: number;
};

export type StatsBySource = Record<WordSource, SourceStats>;

export const toWordProgressKey = (source: WordSource, id: string): WordProgressKey =>
  `${source}:${id}`;

export const parseWordProgressKey = (
  value: string
): { source: WordSource; id: string; key: WordProgressKey } | null => {
  if (!value.trim()) {
    return null;
  }

  if (value.startsWith('system:')) {
    const id = value.slice('system:'.length).trim();
    return id ? { source: 'system', id, key: toWordProgressKey('system', id) } : null;
  }

  if (value.startsWith('custom:')) {
    const id = value.slice('custom:'.length).trim();
    return id ? { source: 'custom', id, key: toWordProgressKey('custom', id) } : null;
  }

  const legacyId = value.trim();
  return { source: 'system', id: legacyId, key: toWordProgressKey('system', legacyId) };
};
