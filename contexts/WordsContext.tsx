import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

import { auth } from '@/config/firebase';
import { WORDS } from '@/data/words';
import { createEmptyProgress, loadUserProgress, saveUserProgress } from '@/services/userProgress';
import type { UserProgress, WordPair } from '@/types';
import { shuffleArray } from '@/utils/shuffle';

type WordsContextType = {
  knownWords: string[];
  unknownWords: string[];
  currentUid: string | null;
  isHydrating: boolean;
  addKnownWord: (id: string) => Promise<void>;
  addUnknownWord: (id: string) => Promise<void>;
  getAllWords: () => WordPair[];
  getKnownWords: () => WordPair[];
  getUnknownWords: () => WordPair[];
  getUnstudiedWords: () => WordPair[];
  loadUserData: (uid: string) => Promise<void>;
  clearUserData: () => void;
};

const WordsContext = createContext<WordsContextType | undefined>(undefined);

const toProgress = (knownWords: string[], unknownWords: string[]): UserProgress => ({
  knownWords,
  unknownWords,
  knownCount: knownWords.length,
  unknownCount: unknownWords.length,
});

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const knownWordsRef = useRef<string[]>([]);
  const unknownWordsRef = useRef<string[]>([]);
  const currentUidRef = useRef<string | null>(null);
  const saveQueueRef = useRef(Promise.resolve());
  const loadVersionRef = useRef(0);

  const setWordState = useCallback((nextKnown: string[], nextUnknown: string[]) => {
    knownWordsRef.current = nextKnown;
    unknownWordsRef.current = nextUnknown;
    setKnownWords(nextKnown);
    setUnknownWords(nextUnknown);
  }, []);

  const getActiveUid = useCallback(() => currentUidRef.current ?? auth.currentUser?.uid ?? null, []);

  const persistProgress = useCallback(async (uid: string, progress: UserProgress) => {
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveUserProgress(uid, progress))
      .then(() => undefined);

    return saveQueueRef.current;
  }, []);

  const loadUserData = useCallback(async (uid: string) => {
    const loadVersion = loadVersionRef.current + 1;
    loadVersionRef.current = loadVersion;
    currentUidRef.current = uid;
    setCurrentUid(uid);
    setIsHydrating(true);

    try {
      await saveQueueRef.current.catch(() => undefined);
      const progress = await loadUserProgress(uid);

      if (loadVersionRef.current !== loadVersion) {
        return;
      }

      setWordState(progress.knownWords, progress.unknownWords);
      currentUidRef.current = uid;
      setCurrentUid(uid);
    } catch (error) {
      if (loadVersionRef.current !== loadVersion) {
        return;
      }

      console.warn('Failed to load Firestore progress:', error);
      const emptyProgress = createEmptyProgress();
      setWordState(emptyProgress.knownWords, emptyProgress.unknownWords);
      currentUidRef.current = uid;
      setCurrentUid(uid);
    } finally {
      if (loadVersionRef.current === loadVersion) {
        setIsHydrating(false);
      }
    }
  }, [setWordState]);

  const clearUserData = useCallback(() => {
    loadVersionRef.current += 1;
    setWordState([], []);
    currentUidRef.current = null;
    setCurrentUid(null);
    setIsHydrating(false);
  }, [setWordState]);

  const addKnownWord = useCallback(async (id: string) => {
    const uid = getActiveUid();
    if (!uid) return;

    currentUidRef.current = uid;
    setCurrentUid(uid);

    const nextKnown = [...knownWordsRef.current.filter((wordId) => wordId !== id), id];
    const nextUnknown = unknownWordsRef.current.filter((wordId) => wordId !== id);

    setWordState(nextKnown, nextUnknown);

    try {
      await persistProgress(uid, toProgress(nextKnown, nextUnknown));
    } catch (error) {
      console.warn('Failed to save known word to Firestore:', error);
    }
  }, [getActiveUid, persistProgress, setWordState]);

  const addUnknownWord = useCallback(async (id: string) => {
    const uid = getActiveUid();
    if (!uid) return;

    currentUidRef.current = uid;
    setCurrentUid(uid);

    const nextUnknown = [...unknownWordsRef.current.filter((wordId) => wordId !== id), id];
    const nextKnown = knownWordsRef.current.filter((wordId) => wordId !== id);

    setWordState(nextKnown, nextUnknown);

    try {
      await persistProgress(uid, toProgress(nextKnown, nextUnknown));
    } catch (error) {
      console.warn('Failed to save unknown word to Firestore:', error);
    }
  }, [getActiveUid, persistProgress, setWordState]);

  const getAllWords = () => {
    return shuffleArray(WORDS);
  };

  const getKnownWords = () => {
    return WORDS.filter((word) => knownWords.includes(word.id));
  };

  const getUnknownWords = () => {
    return WORDS.filter((word) => unknownWords.includes(word.id));
  };

  const getUnstudiedWords = () => {
    const studiedIds = new Set([...knownWords, ...unknownWords]);
    return shuffleArray(WORDS.filter((word) => !studiedIds.has(word.id)));
  };

  return (
    <WordsContext.Provider
      value={{
        knownWords,
        unknownWords,
        currentUid,
        isHydrating,
        addKnownWord,
        addUnknownWord,
        getAllWords,
        getKnownWords,
        getUnknownWords,
        getUnstudiedWords,
        loadUserData,
        clearUserData,
      }}>
      {children}
    </WordsContext.Provider>
  );
}

export function useWords() {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error('useWords must be used within WordsProvider');
  }
  return context;
}
