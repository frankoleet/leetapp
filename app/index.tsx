import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { WORDS } from '@/data/words';

export default function StartScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fireButtonHaptic = () => {
    void Haptics.selectionAsync();
  };

  const handleStart = () => {
    fireButtonHaptic();
    router.push('/study');
  };

  const handleRepeat = () => {
    fireButtonHaptic();
    router.push('/study');
  };

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
          <View style={styles.upperBlock}>
            <View style={styles.topArea}>
              <BlurView intensity={34} tint={theme.blurTint} style={styles.badge}>
                <Text style={styles.badgeText}>Daily vocabulary</Text>
              </BlurView>

              <View style={styles.titleBlock}>
                <Text style={styles.title}>Leet App</Text>
                <Text style={styles.subtitle}>Учи английские слова каждый день</Text>
              </View>
            </View>

            <View style={styles.middleArea}>
              <BlurView intensity={28} tint={theme.blurTint} style={styles.previewCard}>
                <Text style={styles.previewLabel}>Сегодняшняя подборка</Text>
                <Text style={styles.previewValue}>{WORDS.length} слов для изучения</Text>
                <Text style={styles.previewSupport}>Свайпай и запоминай · ~ 3–5 минут</Text>

                <View style={styles.previewMetaRow}>
                  <Text style={styles.previewMeta}>English → Русский</Text>
                </View>
              </BlurView>
            </View>
          </View>

          <View style={styles.bottomArea}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>Начать</Text>
            </Pressable>

            <Pressable onPress={handleRepeat} style={styles.secondaryButton}>
              <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                <Text style={styles.secondaryButtonText}>Повторить</Text>
              </BlurView>
            </Pressable>
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
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
    },
    upperBlock: {
      flex: 1,
      justifyContent: 'center',
    },
    topArea: {
      alignItems: 'center',
      marginBottom: 28,
    },
    badge: {
      backgroundColor: theme.surface.glass,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.strong,
      marginBottom: 18,
      overflow: 'hidden',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    badgeText: {
      color: theme.accent.purple,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0,
    },
    titleBlock: {
      alignItems: 'center',
      gap: 10,
    },
    title: {
      color: theme.text.primary,
      fontSize: 42,
      fontWeight: '800',
      letterSpacing: 0,
      textAlign: 'center',
      textShadowColor: theme.effects.titleGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: theme.mode === 'dark' ? 24 : 0,
    },
    subtitle: {
      color: theme.text.secondary,
      fontSize: 17,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 25,
      maxWidth: 320,
      textAlign: 'center',
    },
    middleArea: {
      alignItems: 'center',
    },
    previewCard: {
      backgroundColor: theme.surface.glassStrong,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      maxWidth: 360,
      overflow: 'hidden',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
      shadowColor: theme.shadow.purple,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.1,
      shadowRadius: 28,
      width: '100%',
    },
    previewLabel: {
      color: theme.accent.purple,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0,
      marginBottom: 8,
    },
    previewValue: {
      color: theme.text.strong,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: 0,
      marginBottom: 8,
    },
    previewSupport: {
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 22,
      marginBottom: 16,
    },
    previewMetaRow: {
      alignSelf: 'flex-start',
      backgroundColor: theme.mode === 'dark' ? theme.border.accent : theme.chip.bg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? theme.border.strong : theme.accent.blue + '33',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    previewMeta: {
      color: theme.text.strong,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0,
    },
    bottomArea: {
      gap: 12,
      paddingTop: 18,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 8,
      justifyContent: 'center',
      minHeight: 58,
      paddingHorizontal: 20,
      paddingVertical: 16,
      shadowColor: theme.shadow.cool,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.16,
      shadowRadius: 20,
    },
    primaryButtonPressed: {
      backgroundColor: theme.button.primaryPressed,
    },
    primaryButtonText: {
      color: theme.text.onPrimary,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0,
    },
    secondaryButton: {
      borderRadius: 8,
      minHeight: 52,
      overflow: 'hidden',
    },
    secondaryButtonGlass: {
      alignItems: 'center',
      backgroundColor: theme.button.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.button.secondaryBorder,
      justifyContent: 'center',
      minHeight: 52,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    secondaryButtonText: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0,
    },
  });
