import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import type { AppTheme } from '@/constants/theme';
import { Flashcard, type FlashcardHandle } from '@/components/Flashcard';
import { useWords } from '@/contexts/WordsContext';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { StudyMode, StudyReviewBucket, SwipeDirection, Word, WordSource } from '@/types';
import { toWordProgressKey } from '@/types';
import { createShadow } from '@/utils/shadow';

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isStudyMode = (value: string | undefined): value is StudyMode =>
  value === 'system:start' ||
  value === 'system:review' ||
  value === 'custom:start' ||
  value === 'custom:review';

const isReviewBucket = (value: string | undefined): value is StudyReviewBucket =>
  value === 'known' || value === 'unknown';

const getSourceFromMode = (mode: StudyMode): WordSource =>
  mode.startsWith('custom:') ? 'custom' : 'system';

export default function StudyScreen() {
  const { width, height } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { addKnownWord, addUnknownWord, getWordsForMode } = useWords();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams<{ mode?: string | string[]; bucket?: string | string[] }>();
  const modeParam = readParam(params.mode);
  const bucketParam = readParam(params.bucket);
  const mode: StudyMode = isStudyMode(modeParam) ? modeParam : 'system:start';
  const bucket = isReviewBucket(bucketParam) ? bucketParam : undefined;
  const source = getSourceFromMode(mode);

  const buildDeck = useCallback(() => getWordsForMode(mode, bucket), [bucket, getWordsForMode, mode]);

  const flashcardRef = useRef<FlashcardHandle>(null);
  const previousSessionKeyRef = useRef(`${mode}:${bucket ?? 'all'}`);

  const [deck, setDeck] = useState<Word[]>(() => buildDeck());
  const [initialDeckSize, setInitialDeckSize] = useState(() => buildDeck().length);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionKnown, setSessionKnown] = useState<string[]>([]);
  const [sessionUnknown, setSessionUnknown] = useState<string[]>([]);

  useEffect(() => {
    const nextSessionKey = `${mode}:${bucket ?? 'all'}`;
    if (previousSessionKeyRef.current === nextSessionKey) {
      return;
    }

    previousSessionKeyRef.current = nextSessionKey;
    const nextDeck = buildDeck();
    setDeck(nextDeck);
    setInitialDeckSize(nextDeck.length);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionKnown([]);
    setSessionUnknown([]);
  }, [buildDeck, bucket, mode]);

  const currentWord = deck[currentIndex];
  const studiedCount = sessionKnown.length + sessionUnknown.length;
  const progress = initialDeckSize === 0 ? 0 : studiedCount / initialDeckSize;
  const cardSize = Math.max(240, Math.min(width - 48, height * 0.42, 390));

  const sessionLabel = source === 'custom' ? 'Мои слова' : 'Сессия';
  const footerTitle =
    source === 'custom' ? 'Открой перевод и оцени свое слово.' : 'Tap to reveal, then decide fast.';

  const emptyState = useMemo(() => {
    if (source === 'custom' && mode === 'custom:start') {
      return {
        title: 'Пока нет своих слов',
        text: 'Добавьте первую карточку в разделе "Мои слова", и здесь появится отдельная сессия обучения.',
      };
    }

    if (bucket === 'known') {
      return {
        title: 'Нет знакомых слов',
        text: 'В этой подборке пока нечего повторять. Вернитесь на главный экран и продолжайте обучение.',
      };
    }

    if (bucket === 'unknown') {
      return {
        title: 'Нет слов для повтора',
        text:
          source === 'custom'
            ? 'Среди ваших слов сейчас нет карточек со статусом "Не знаю".'
            : 'В этой категории пока нет слов. Вернитесь на главный экран и начните изучение.',
      };
    }

    return {
      title: 'Нет слов',
      text: 'В этой категории пока нет слов. Вернитесь на главный экран и начните изучение.',
    };
  }, [bucket, mode, source]);

  const openResult = useCallback(
    (nextKnownCount: number, nextUnknownCount: number) => {
      const total = nextKnownCount + nextUnknownCount;

      if (total === 0) {
        router.replace('/');
        return;
      }

      router.replace({
        pathname: '/result',
        params: {
          total: String(total),
          knownCount: String(nextKnownCount),
          unknownCount: String(nextUnknownCount),
          source,
          repeatMode: `${source}:review`,
          repeatBucket: 'unknown',
        },
      });
    },
    [source]
  );

  const handleBack = () => {
    router.replace('/');
  };

  const handleFinish = () => {
    openResult(sessionKnown.length, sessionUnknown.length);
  };

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const word = deck[currentIndex];

      if (!word) {
        return;
      }

      const wordKey = toWordProgressKey(word.source, word.id);

      if (direction === 'known') {
        void addKnownWord(word);
        setSessionKnown((prev) => [...prev, wordKey]);
      } else {
        void addUnknownWord(word);
        setSessionUnknown((prev) => [...prev, wordKey]);
      }

      const nextDeck = deck.filter((_, index) => index !== currentIndex);
      setDeck(nextDeck);

      if (nextDeck.length === 0) {
        const nextKnownCount = direction === 'known' ? sessionKnown.length + 1 : sessionKnown.length;
        const nextUnknownCount =
          direction === 'unknown' ? sessionUnknown.length + 1 : sessionUnknown.length;
        openResult(nextKnownCount, nextUnknownCount);
        return;
      }

      if (currentIndex >= nextDeck.length) {
        setCurrentIndex(nextDeck.length - 1);
      }

      setIsFlipped(false);
    },
    [addKnownWord, addUnknownWord, currentIndex, deck, openResult, sessionKnown.length, sessionUnknown.length]
  );

  const handleStartOver = () => {
    router.replace('/');
  };

  if (deck.length === 0) {
    return (
      <View style={styles.screen}>
        <LinearGradient
          colors={[theme.background.start, theme.background.mid, theme.background.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyWrap}>
            <BlurView intensity={40} tint={theme.blurTint} style={styles.emptyPanel}>
              <Text style={styles.emptyTitle}>{emptyState.title}</Text>
              <Text style={styles.emptyText}>{emptyState.text}</Text>

              <Pressable onPress={handleStartOver} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>На главную</Text>
              </Pressable>
            </BlurView>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[theme.background.start, theme.background.mid, theme.background.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topZone}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
              <BlurView intensity={30} tint={theme.blurTint} style={styles.backButtonGlass}>
                <Ionicons name="chevron-back" size={18} color={theme.text.secondary} />
              </BlurView>
            </Pressable>

            <BlurView intensity={34} tint={theme.blurTint} style={styles.topBar}>
              <View style={styles.topBarRow}>
                <View>
                  <Text style={styles.eyebrow}>{sessionLabel}</Text>
                  <Text style={styles.title}>Изучено: {studiedCount}</Text>
                </View>

                <Pressable onPress={handleFinish} style={styles.finishButton}>
                  <Text style={styles.finishButtonText}>Закончить</Text>
                </Pressable>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${Math.max(progress, 0.02) * 100}%` }]}
                />
              </View>
            </BlurView>
          </View>

          <View style={styles.middleZone}>
            <View style={styles.cardFrame}>
              <Flashcard
                ref={flashcardRef}
                key={`${currentWord.source}:${currentWord.id}`}
                word={currentWord}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((value) => !value)}
                onSwipe={handleSwipe}
                size={cardSize}
              />
            </View>
          </View>

          <View style={styles.bottomZone}>
            <Text style={styles.footerTitle}>{footerTitle}</Text>

            <View style={styles.footerChips}>
              <Pressable
                hitSlop={8}
                onPress={() => flashcardRef.current?.triggerSwipe('unknown')}
                style={({ pressed }) => [styles.footerChipButton, pressed && styles.footerChipPressed]}>
                <BlurView intensity={28} tint={theme.blurTint} style={styles.footerChip}>
                  <Text style={[styles.footerChipLabel, styles.footerChipLabelMuted]}>← Не знаю</Text>
                </BlurView>
              </Pressable>

              <Pressable
                hitSlop={8}
                onPress={() => flashcardRef.current?.triggerSwipe('known')}
                style={({ pressed }) => [
                  styles.footerChipButton,
                  styles.footerChipButtonRight,
                  pressed && styles.footerChipPressed,
                ]}>
                <BlurView intensity={28} tint={theme.blurTint} style={styles.footerChip}>
                  <Text style={[styles.footerChipLabel, styles.footerChipLabelStrong]}>Знаю →</Text>
                </BlurView>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      backgroundColor: theme.background.base,
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    topZone: {
      flex: 2,
      justifyContent: 'center',
    },
    middleZone: {
      alignItems: 'center',
      flex: 6,
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    bottomZone: {
      alignItems: 'center',
      flex: 2,
      justifyContent: 'center',
      paddingBottom: 6,
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    backButtonGlass: {
      alignItems: 'center',
      backgroundColor: theme.surface.glass,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.strong,
      height: 36,
      justifyContent: 'center',
      overflow: 'hidden',
      ...createShadow({
        color: theme.shadow.purple,
        offsetY: 8,
        opacity: theme.mode === 'dark' ? 0.18 : 0.1,
        radius: 18,
      }),
      width: 36,
    },
    topBar: {
      backgroundColor: theme.surface.glassStrong,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      overflow: 'hidden',
      padding: 18,
      ...createShadow({
        color: theme.shadow.cool,
        offsetY: 16,
        opacity: theme.mode === 'dark' ? 0.18 : 0.12,
        radius: 28,
      }),
    },
    topBarRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    eyebrow: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0,
      marginBottom: 6,
    },
    title: {
      color: theme.text.primary,
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: 0,
    },
    finishButton: {
      backgroundColor: theme.button.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    finishButtonText: {
      color: theme.text.onPrimary,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0,
    },
    progressTrack: {
      backgroundColor: theme.progress.track,
      borderRadius: 999,
      height: 8,
      overflow: 'hidden',
    },
    progressFill: {
      backgroundColor: theme.progress.fill,
      borderRadius: 999,
      height: '100%',
    },
    cardFrame: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    footerTitle: {
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0,
      marginBottom: 14,
      textAlign: 'center',
    },
    footerChips: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    footerChipButton: {
      minWidth: 138,
    },
    footerChipButtonRight: {
      alignItems: 'flex-end',
    },
    footerChip: {
      alignItems: 'center',
      backgroundColor: theme.surface.glass,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.strong,
      justifyContent: 'center',
      minHeight: 54,
      overflow: 'hidden',
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    footerChipPressed: {
      opacity: 0.88,
    },
    footerChipLabel: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0,
    },
    footerChipLabelMuted: {
      color: theme.state.danger,
    },
    footerChipLabelStrong: {
      color: theme.state.success,
    },
    emptyWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    emptyPanel: {
      backgroundColor: theme.surface.glassStrong,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      overflow: 'hidden',
      padding: 24,
      ...createShadow({
        color: theme.shadow.cool,
        offsetY: 18,
        opacity: theme.mode === 'dark' ? 0.18 : 0.12,
        radius: 28,
      }),
    },
    emptyTitle: {
      color: theme.text.primary,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: 0,
      marginBottom: 10,
    },
    emptyText: {
      color: theme.text.secondary,
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 24,
      marginBottom: 22,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 8,
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    primaryButtonText: {
      color: theme.text.onPrimary,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0,
    },
  });
