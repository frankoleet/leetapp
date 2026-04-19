import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { UserProgress } from '@/types';

const USERS_COLLECTION = 'users';
const PROGRESS_COLLECTION = 'progress';
const MAIN_PROGRESS_DOC = 'main';
const PROGRESS_SCHEMA_VERSION = 1;

const normalizeIds = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueIds = new Set<string>();

  value.forEach((item) => {
    if (typeof item === 'string' && item.trim()) {
      uniqueIds.add(item);
    }
  });

  return Array.from(uniqueIds);
};

export const createEmptyProgress = (): UserProgress => ({
  knownWords: [],
  unknownWords: [],
  knownCount: 0,
  unknownCount: 0,
});

const normalizeProgress = (value: unknown): UserProgress => {
  if (!value || typeof value !== 'object') {
    return createEmptyProgress();
  }

  const raw = value as Record<string, unknown>;
  const knownWords = normalizeIds(raw.knownWords);
  const knownWordSet = new Set(knownWords);
  const unknownWords = normalizeIds(raw.unknownWords).filter((id) => !knownWordSet.has(id));

  return {
    knownWords,
    unknownWords,
    knownCount: knownWords.length,
    unknownCount: unknownWords.length,
  };
};

const toFirestorePayload = (progress: UserProgress) => ({
  knownWords: progress.knownWords,
  unknownWords: progress.unknownWords,
  knownCount: progress.knownCount,
  unknownCount: progress.unknownCount,
  schemaVersion: PROGRESS_SCHEMA_VERSION,
  updatedAt: serverTimestamp(),
});

const getUserProgressRef = (uid: string) =>
  doc(db, USERS_COLLECTION, uid, PROGRESS_COLLECTION, MAIN_PROGRESS_DOC);

export const loadUserProgress = async (uid: string) => {
  const progressRef = getUserProgressRef(uid);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    const emptyProgress = createEmptyProgress();
    await setDoc(progressRef, toFirestorePayload(emptyProgress));
    return emptyProgress;
  }

  return normalizeProgress(snapshot.data());
};

export const saveUserProgress = async (uid: string, progress: UserProgress) => {
  const progressRef = getUserProgressRef(uid);
  await setDoc(progressRef, toFirestorePayload(progress), { merge: true });
};
