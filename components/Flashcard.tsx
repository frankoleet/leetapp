import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { SwipeDirection, WordPair } from '@/types';

export type FlashcardHandle = {
  triggerSwipe: (direction: SwipeDirection) => void;
};

type FlashcardProps = {
  word: WordPair;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipe: (direction: SwipeDirection) => void;
  size: number;
};

const SWIPE_DISTANCE = 46;
const SWIPE_VELOCITY = 420;
const SWIPE_PROJECTION = 0.09;

export const Flashcard = forwardRef<FlashcardHandle, FlashcardProps>(function Flashcard(
  { word, isFlipped, onFlip, onSwipe, size },
  ref
) {
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const flipProgress = useSharedValue(0);
  const isAnimatingOut = useSharedValue(false);

  const fireFlipHaptic = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  const fireAnswerHaptic = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  useEffect(() => {
    flipProgress.value = withTiming(isFlipped ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [flipProgress, isFlipped]);

  useEffect(() => {
    translateX.value = 0;
    rotateZ.value = 0;
    isAnimatingOut.value = false;
  }, [isAnimatingOut, rotateZ, translateX, word.id]);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => {
      onSwipe(direction);
    },
    [onSwipe]
  );

  const animateSwipeOut = useCallback(
    (direction: SwipeDirection) => {
      'worklet';

      if (isAnimatingOut.value) {
        return;
      }

      isAnimatingOut.value = true;
      runOnJS(fireAnswerHaptic)();

      const target = direction === 'known' ? width : -width;

      translateX.value = withTiming(target * 1.18, { duration: 145 }, (finished) => {
        if (finished) {
          translateX.value = 0;
          rotateZ.value = 0;
          isAnimatingOut.value = false;
          runOnJS(finishSwipe)(direction);
        }
      });
      rotateZ.value = withTiming(direction === 'known' ? 12 : -12, { duration: 145 });
    },
    [fireAnswerHaptic, finishSwipe, isAnimatingOut, rotateZ, translateX, width]
  );

  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction: SwipeDirection) => {
      if (!isAnimatingOut.value) {
        runOnUI(animateSwipeOut)(direction);
      }
    },
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-2, 2])
    .failOffsetY([-26, 26])
    .onUpdate((event) => {
      if (isAnimatingOut.value) {
        return;
      }

      translateX.value = event.translationX;
      rotateZ.value = interpolate(
        event.translationX,
        [-width * 0.6, 0, width * 0.6],
        [-8.5, 0, 8.5],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      const projectedX = translateX.value + event.velocityX * SWIPE_PROJECTION;
      const hasDistance = Math.abs(projectedX) >= SWIPE_DISTANCE;
      const hasVelocity = Math.abs(event.velocityX) >= SWIPE_VELOCITY;

      if (!hasDistance && !hasVelocity) {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 240,
          mass: 0.55,
          overshootClamping: false,
        });
        rotateZ.value = withSpring(0, {
          damping: 15,
          stiffness: 240,
          mass: 0.55,
          overshootClamping: false,
        });
        return;
      }

      const direction: SwipeDirection =
        projectedX > 0 || event.velocityX > 0 ? 'known' : 'unknown';
      animateSwipeOut(direction);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (!isAnimatingOut.value) {
      runOnJS(fireFlipHaptic)();
      runOnJS(onFlip)();
    }
  });

  const gesture = Gesture.Exclusive(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotateZ: `${rotateZ.value}deg` }],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  const knowBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_DISTANCE], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_DISTANCE],
          [0.92, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const retryBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_DISTANCE, 0], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_DISTANCE, 0],
          [1, 0.92],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.shell, { width: size, height: size }, cardStyle]}>
        <Animated.View style={[styles.badge, styles.badgeLeft, retryBadgeStyle]}>
          <Text style={[styles.badgeText, styles.badgeTextMuted]}>Again</Text>
        </Animated.View>

        <Animated.View style={[styles.badge, styles.badgeRight, knowBadgeStyle]}>
          <Text style={[styles.badgeText, styles.badgeTextStrong]}>Know</Text>
        </Animated.View>

        <View style={styles.pressable}>
          <Animated.View style={[styles.face, frontStyle]}>
            <LinearGradient
              colors={[theme.surface.card, theme.surface.cardAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}>
              <View style={styles.topMeta}>
                <Text style={styles.metaLabel}>English</Text>
                <Text style={styles.metaHint}>Tap to flip</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.wordText}>{word.english}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.face, backStyle]}>
            <LinearGradient
              colors={[theme.surface.card, theme.surface.cardAlt]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}>
              <View style={styles.topMeta}>
                <Text style={styles.metaLabel}>Russian</Text>
                <Text style={styles.metaHint}>Swipe when ready</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.translationText}>{word.russian}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    shell: {
      alignSelf: 'center',
      position: 'relative',
    },
    badge: {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
      position: 'absolute',
      top: 24,
      zIndex: 3,
    },
    badgeLeft: {
      backgroundColor: theme.state.dangerSoft,
      borderColor: theme.mode === 'dark' ? theme.border.strong : 'rgba(255, 90, 107, 0.26)',
      left: 22,
    },
    badgeRight: {
      backgroundColor: theme.state.successSoft,
      borderColor: theme.mode === 'dark' ? theme.border.strong : 'rgba(52, 199, 89, 0.24)',
      right: 22,
    },
    badgeText: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0,
    },
    badgeTextMuted: {
      color: theme.state.danger,
    },
    badgeTextStrong: {
      color: theme.state.success,
    },
    pressable: {
      flex: 1,
    },
    face: {
      backfaceVisibility: 'hidden',
      backgroundColor: theme.surface.glassStrong,
      bottom: 0,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      flex: 1,
      left: 0,
      overflow: 'hidden',
      position: 'absolute',
      right: 0,
      shadowColor: theme.shadow.purple,
      shadowOffset: { width: 0, height: 22 },
      shadowOpacity: theme.mode === 'dark' ? 0.22 : 0.12,
      shadowRadius: 30,
      top: 0,
    },
    gradient: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    topMeta: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    metaLabel: {
      color: theme.text.secondary,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0,
    },
    metaHint: {
      color: theme.text.muted,
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 0,
    },
    content: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    wordText: {
      color: theme.text.primary,
      fontSize: 38,
      fontWeight: '800',
      letterSpacing: 0,
      textAlign: 'center',
    },
    translationText: {
      color: theme.text.strong,
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: 0,
      textAlign: 'center',
    },
  });
