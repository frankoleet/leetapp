import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { auth } from '@/config/firebase';
import { WORDS } from '@/data/words';
import {
  addCustomWord as addCustomWordRecord,
  deleteCustomWord as deleteCustomWordRecord,
  subscribeToCustomWords,
  updateCustomWord as updateCustomWordRecord,
} from '@/services/customWordsService';
import { createEmptyProgress, loadUserProgress, saveUserProgress } from '@/services/userProgress';
import type {
  CustomWord,
  CustomWordInput,
  StatsBySource,
  StudyMode,
  StudyReviewBucket,
  UserProgress,
  Word,
  WordProgressKey,
  WordSource,
} from '@/types';
import { parseWordProgressKey, toWordProgressKey } from '@/types';
import { shuffleArray } from '@/utils/shuffle';

type WordsContextType = {
  knownWords: WordProgressKey[];
  unknownWords: WordProgressKey[];
  currentUid: string | null;
  isHydrating: boolean;
  systemWords: Word[];
  customWords: CustomWord[];
  customWordsLoading: boolean;
  statsBySource: StatsBySource;
  addKnownWord: (word: Word | WordProgressKey) => Promise<void>;
  addUnknownWord: (word: Word | WordProgressKey) => Promise<void>;
  addCustomWord: (input: CustomWordInput) => Promise<CustomWord>;
  updateCustomWord: (id: string, input: CustomWordInput) => Promise<void>;
  deleteCustomWord: (id: string) => Promise<void>;
  getKnownWords: (source?: WordSource) => Word[];
  getUnknownWords: (source?: WordSource) => Word[];
  getUnstudiedWords: (source?: WordSource) => Word[];
  getWordsForMode: (mode: StudyMode, bucket?: StudyReviewBucket) => Word[];
  loadUserData: (uid: string) => Promise<void>;
  clearUserData: () => void;
};

const WordsContext = createContext<WordsContextType | undefined>(undefined);

const SYSTEM_WORDS: Word[] = WORDS.map((word) => ({
  ...word,
  source: 'system',
}));

const toProgress = (knownWords: WordProgressKey[], unknownWords: WordProgressKey[]): UserProgress => ({
  knownWords,
  unknownWords,
  knownCount: knownWords.length,
  unknownCount: unknownWords.length,
});

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const [knownWords, setKnownWords] = useState<WordProgressKey[]>([]);
  const [unknownWords, setUnknownWords] = useState<WordProgressKey[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);
  const [customWordsLoading, setCustomWordsLoading] = useState(false);
  const knownWordsRef = useRef<WordProgressKey[]>([]);
  const unknownWordsRef = useRef<WordProgressKey[]>([]);
  const currentUidRef = useRef<string | null>(null);
  const saveQueueRef = useRef(Promise.resolve());
  const loadVersionRef = useRef(0);
  const customWordsUnsubscribeRef = useRef<null | (() => void)>(null);

  const setWordState = useCallback((nextKnown: WordProgressKey[], nextUnknown: WordProgressKey[]) => {
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

  const stopCustomWordsSubscription = useCallback(() => {
    customWordsUnsubscribeRef.current?.();
    customWordsUnsubscribeRef.current = null;
  }, []);

  const startCustomWordsSubscription = useCallback(
    (uid: string) => {
      stopCustomWordsSubscription();
      setCustomWordsLoading(true);
      customWordsUnsubscribeRef.current = subscribeToCustomWords(
        uid,
        (nextWords) => {
          if (currentUidRef.current !== uid) {
            return;
          }

          setCustomWords(nextWords);
          setCustomWordsLoading(false);
        },
        (error) => {
          if (currentUidRef.current !== uid) {
            return;
          }

          console.warn('Failed to load custom words from Firestore:', error);
          setCustomWords([]);
          setCustomWordsLoading(false);
        }
      );
    },
    [stopCustomWordsSubscription]
  );

  const loadUserData = useCallback(async (uid: string) => {
    const loadVersion = loadVersionRef.current + 1;
    loadVersionRef.current = loadVersion;
    currentUidRef.current = uid;
    setCurrentUid(uid);
    setIsHydrating(true);
    startCustomWordsSubscription(uid);

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
  }, [setWordState, startCustomWordsSubscription]);

  const clearUserData = useCallback(() => {
    loadVersionRef.current += 1;
    stopCustomWordsSubscription();
    setWordState([], []);
    setCustomWords([]);
    currentUidRef.current = null;
    setCurrentUid(null);
    setIsHydrating(false);
    setCustomWordsLoading(false);
  }, [setWordState, stopCustomWordsSubscription]);

  const resolveProgressKey = useCallback((word: Word | WordProgressKey) => {
    if (typeof word === 'string') {
      return parseWordProgressKey(word)?.key ?? null;
    }

    return toWordProgressKey(word.source, word.id);
  }, []);

  const addKnownWord = useCallback(async (word: Word | WordProgressKey) => {
    const uid = getActiveUid();
    const progressKey = resolveProgressKey(word);
    if (!uid || !progressKey) return;

    currentUidRef.current = uid;
    setCurrentUid(uid);

    const nextKnown = [...knownWordsRef.current.filter((wordId) => wordId !== progressKey), progressKey];
    const nextUnknown = unknownWordsRef.current.filter((wordId) => wordId !== progressKey);

    setWordState(nextKnown, nextUnknown);

    try {
      await persistProgress(uid, toProgress(nextKnown, nextUnknown));
    } catch (error) {
      console.warn('Failed to save known word to Firestore:', error);
    }
  }, [getActiveUid, persistProgress, resolveProgressKey, setWordState]);

  const addUnknownWord = useCallback(async (word: Word | WordProgressKey) => {
    const uid = getActiveUid();
    const progressKey = resolveProgressKey(word);
    if (!uid || !progressKey) return;

    currentUidRef.current = uid;
    setCurrentUid(uid);

    const nextUnknown = [...unknownWordsRef.current.filter((wordId) => wordId !== progressKey), progressKey];
    const nextKnown = knownWordsRef.current.filter((wordId) => wordId !== progressKey);

    setWordState(nextKnown, nextUnknown);

    try {
      await persistProgress(uid, toProgress(nextKnown, nextUnknown));
    } catch (error) {
      console.warn('Failed to save unknown word to Firestore:', error);
    }
  }, [getActiveUid, persistProgress, resolveProgressKey, setWordState]);

  const addCustomWord = useCallback(async (input: CustomWordInput) => {
    const uid = getActiveUid();
    if (!uid) {
      throw new Error('User is not authenticated');
    }

    return addCustomWordRecord(uid, input);
  }, [getActiveUid]);

  const updateCustomWord = useCallback(async (id: string, input: CustomWordInput) => {
    const uid = getActiveUid();
    if (!uid) {
      throw new Error('User is not authenticated');
    }

    await updateCustomWordRecord(uid, id, input);
  }, [getActiveUid]);

  const deleteCustomWord = useCallback(async (id: string) => {
    const uid = getActiveUid();
    if (!uid) {
      throw new Error('User is not authenticated');
    }

    await deleteCustomWordRecord(uid, id);
  }, [getActiveUid]);

  const wordsBySource = useMemo(
    () => ({
      system: SYSTEM_WORDS,
      custom: customWords,
    }),
    [customWords]
  );

  const filterWordsByProgress = useCallback(
    (source: WordSource, target: 'known' | 'unknown') => {
      const progressSet = new Set(target === 'known' ? knownWords : unknownWords);
      return wordsBySource[source].filter((word) => progressSet.has(toWordProgressKey(source, word.id)));
    },
    [knownWords, unknownWords, wordsBySource]
  );

  const getKnownWords = useCallback(
    (source?: WordSource) => {
      if (!source) {
        return [...filterWordsByProgress('system', 'known'), ...filterWordsByProgress('custom', 'known')];
      }

      return filterWordsByProgress(source, 'known');
    },
    [filterWordsByProgress]
  );

  const getUnknownWords = useCallback(
    (source?: WordSource) => {
      if (!source) {
        return [...filterWordsByProgress('system', 'unknown'), ...filterWordsByProgress('custom', 'unknown')];
      }

      return filterWordsByProgress(source, 'unknown');
    },
    [filterWordsByProgress]
  );

  const getUnstudiedWords = useCallback(
    (source?: WordSource) => {
      const collectForSource = (targetSource: WordSource) => {
        const studiedKeys = new Set([...knownWords, ...unknownWords]);
        return shuffleArray(
          wordsBySource[targetSource].filter(
            (word) => !studiedKeys.has(toWordProgressKey(targetSource, word.id))
          )
        );
      };

      if (!source) {
        return [...collectForSource('system'), ...collectForSource('custom')];
      }

      return collectForSource(source);
    },
    [knownWords, unknownWords, wordsBySource]
  );

  const getWordsForMode = useCallback(
    (mode: StudyMode, bucket: StudyReviewBucket = 'unknown') => {
      if (mode === 'system:start') {
        return getUnstudiedWords('system');
      }

      if (mode === 'custom:start') {
        return shuffleArray(wordsBySource.custom);
      }

      const source: WordSource = mode.startsWith('system:') ? 'system' : 'custom';
      return bucket === 'known' ? getKnownWords(source) : getUnknownWords(source);
    },
    [getKnownWords, getUnknownWords, getUnstudiedWords, wordsBySource.custom]
  );

  const statsBySource = useMemo<StatsBySource>(() => {
    const buildStats = (source: WordSource) => {
      const total = wordsBySource[source].length;
      const known = getKnownWords(source).length;
      const unknown = getUnknownWords(source).length;

      return {
        total,
        known,
        unknown,
        unstudied: Math.max(total - known - unknown, 0),
      };
    };

    return {
      system: buildStats('system'),
      custom: buildStats('custom'),
    };
  }, [getKnownWords, getUnknownWords, wordsBySource]);

  return (
    <WordsContext.Provider
      value={{
        knownWords,
        unknownWords,
        currentUid,
        isHydrating,
        systemWords: SYSTEM_WORDS,
        customWords,
        customWordsLoading,
        statsBySource,
        addKnownWord,
        addUnknownWord,
        addCustomWord,
        updateCustomWord,
        deleteCustomWord,
        getKnownWords,
        getUnknownWords,
        getUnstudiedWords,
        getWordsForMode,
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
