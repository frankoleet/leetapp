import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { CustomWord, CustomWordInput } from '@/types';

const USERS_COLLECTION = 'users';
const CUSTOM_WORDS_COLLECTION = 'customWords';

const getCustomWordsCollectionRef = (uid: string) =>
  collection(db, USERS_COLLECTION, uid, CUSTOM_WORDS_COLLECTION);

const sanitizeText = (value: string | undefined) => {
  const trimmed = value?.trim() ?? '';
  return trimmed || undefined;
};

const mapSnapshotToCustomWord = (snapshot: QueryDocumentSnapshot<DocumentData>): CustomWord => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    english: typeof data.english === 'string' ? data.english : '',
    russian: typeof data.russian === 'string' ? data.russian : '',
    transcription: typeof data.transcription === 'string' ? data.transcription : undefined,
    mnemonic: typeof data.mnemonic === 'string' ? data.mnemonic : undefined,
    source: 'custom',
    createdAt: typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate() : null,
    updatedAt: typeof data.updatedAt?.toDate === 'function' ? data.updatedAt.toDate() : null,
  };
};

const toFirestorePayload = (id: string, input: CustomWordInput) => {
  const transcription = sanitizeText(input.transcription);
  const mnemonic = sanitizeText(input.mnemonic);

  return {
    id,
    english: input.english.trim(),
    russian: input.russian.trim(),
    ...(transcription ? { transcription } : {}),
    ...(mnemonic ? { mnemonic } : {}),
    source: 'custom' as const,
    updatedAt: serverTimestamp(),
  };
};

export const subscribeToCustomWords = (
  uid: string,
  onData: (words: CustomWord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const wordsQuery = query(getCustomWordsCollectionRef(uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    wordsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapSnapshotToCustomWord));
    },
    (error) => {
      onError?.(error);
    }
  );
};

export const addCustomWord = async (uid: string, input: CustomWordInput) => {
  const customWordsRef = getCustomWordsCollectionRef(uid);
  const wordRef = doc(customWordsRef);
  const payload = {
    ...toFirestorePayload(wordRef.id, input),
    createdAt: serverTimestamp(),
  };

  await setDoc(wordRef, payload);

  return {
    id: wordRef.id,
    english: payload.english,
    russian: payload.russian,
    transcription: payload.transcription,
    mnemonic: payload.mnemonic,
    source: 'custom' as const,
    createdAt: null,
    updatedAt: null,
  };
};

export const updateCustomWord = async (uid: string, id: string, input: CustomWordInput) => {
  const wordRef = doc(db, USERS_COLLECTION, uid, CUSTOM_WORDS_COLLECTION, id);
  await setDoc(wordRef, toFirestorePayload(id, input), { merge: true });
};

export const deleteCustomWord = async (uid: string, id: string) => {
  const wordRef = doc(db, USERS_COLLECTION, uid, CUSTOM_WORDS_COLLECTION, id);
  await deleteDoc(wordRef);
};
