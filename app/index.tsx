import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaskedView from '@react-native-masked-view/masked-view';

import type { AppTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useWords } from '@/contexts/WordsContext';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function StartScreen() {
  const { theme } = useAppTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const { knownWords, unknownWords } = useWords();
  const { logout } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const knownCount = knownWords.length;
  const unknownCount = unknownWords.length;

  const fireButtonHaptic = () => {
    void Haptics.selectionAsync();
  };

  const handleStart = () => {
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'unstudied' } });
  };

  const handleKnown = () => {
    if (knownCount === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'known' } });
  };

  const handleUnknown = () => {
    if (unknownCount === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'unknown' } });
  };

  const handleThemeSwitch = (mode: 'light' | 'dark') => {
    fireButtonHaptic();
    void setThemeMode(mode);
  };

  const handleLogout = () => {
    fireButtonHaptic();
    void logout();
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
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />

            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Выйти</Text>
            </Pressable>
          </View>

          <View style={styles.upperBlock}>
            <View style={styles.topArea}>
              <View style={styles.topRow}>
                <BlurView intensity={34} tint={theme.blurTint} style={styles.badge}>
                  <Text style={styles.badgeText}>Daily vocabulary</Text>
                </BlurView>

                <View style={styles.themeSwitch}>
                  <Pressable
                    onPress={() => handleThemeSwitch('light')}
                    style={[
                      styles.themeSwitchButton,
                      themeMode === 'light' && styles.themeSwitchButtonActive,
                    ]}>
                    <Text
                      style={[
                        styles.themeSwitchText,
                        themeMode === 'light' && styles.themeSwitchTextActive,
                      ]}>
                      Light
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleThemeSwitch('dark')}
                    style={[
                      styles.themeSwitchButton,
                      themeMode === 'dark' && styles.themeSwitchButtonActive,
                    ]}>
                    <Text
                      style={[
                        styles.themeSwitchText,
                        themeMode === 'dark' && styles.themeSwitchTextActive,
                      ]}>
                      Dark
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.titleBlock}>
                {theme.mode === 'dark' ? (
                  <MaskedView
                    maskElement={<Text style={[styles.title, styles.titleMask]}>Leet App</Text>}>
                    <LinearGradient
                      colors={['#FF6EC7', '#9B84FF', '#FFB36B', '#FFD84D']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}>
                      <Text style={[styles.title, styles.titleTransparent]}>Leet App</Text>
                    </LinearGradient>
                  </MaskedView>
                ) : (
                  <Text style={styles.title}>Leet App</Text>
                )}
                <Text style={styles.subtitle}>Учи английские слова каждый день</Text>
              </View>
            </View>

            <View style={styles.middleArea}>
              <BlurView intensity={28} tint={theme.blurTint} style={styles.previewCard}>
                <Text style={styles.previewLabel}>Статистика</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statValueSuccess]}>{knownCount}</Text>
                    <Text style={styles.statLabel}>Знаю</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statValueDanger]}>{unknownCount}</Text>
                    <Text style={styles.statLabel}>Не знаю</Text>
                  </View>
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

            <View style={styles.secondaryRow}>
              <Pressable
                onPress={handleKnown}
                disabled={knownCount === 0}
                style={[styles.secondaryButton, knownCount === 0 && styles.secondaryButtonDisabled]}>
                <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      knownCount === 0 && styles.secondaryButtonTextDisabled,
                    ]}>
                    Знаю ({knownCount})
                  </Text>
                </BlurView>
              </Pressable>

              <Pressable
                onPress={handleUnknown}
                disabled={unknownCount === 0}
                style={[
                  styles.secondaryButton,
                  unknownCount === 0 && styles.secondaryButtonDisabled,
                ]}>
                <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      unknownCount === 0 && styles.secondaryButtonTextDisabled,
                    ]}>
                    Не знаю ({unknownCount})
                  </Text>
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
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerSpacer: {
      width: 1,
    },
    upperBlock: {
      flex: 1,
      justifyContent: 'center',
    },
    topArea: {
      alignItems: 'center',
      marginBottom: 28,
    },
    topRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      marginBottom: 18,
    },
    badge: {
      backgroundColor: theme.surface.glass,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.strong,
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
    themeSwitch: {
      backgroundColor: theme.surface.glass,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.strong,
      flexDirection: 'row',
      overflow: 'hidden',
      padding: 2,
    },
    themeSwitchButton: {
      alignItems: 'center',
      borderRadius: 6,
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    themeSwitchButtonActive: {
      backgroundColor: theme.accent.purple,
    },
    themeSwitchText: {
      color: theme.text.secondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0,
    },
    themeSwitchTextActive: {
      color: '#FFFFFF',
    },
    logoutButton: {
      alignItems: 'center',
      backgroundColor: theme.surface.glass,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border.strong,
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    logoutText: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '600',
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
    },
    titleMask: {
      backgroundColor: 'transparent',
    },
    titleTransparent: {
      opacity: 0,
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
      marginBottom: 16,
      textAlign: 'center',
    },
    statsRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      color: theme.text.primary,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: 0,
      marginBottom: 4,
    },
    statValueSuccess: {
      color: theme.state.success,
    },
    statValueDanger: {
      color: theme.state.danger,
    },
    statLabel: {
      color: theme.text.secondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0,
    },
    statDivider: {
      backgroundColor: theme.border.subtle,
      height: 40,
      width: 1,
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
    primaryButtonDisabled: {
      backgroundColor: theme.button.disabled,
      opacity: 0.5,
    },
    primaryButtonText: {
      color: theme.text.onPrimary,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0,
    },
    secondaryRow: {
      flexDirection: 'row',
      gap: 12,
    },
    secondaryButton: {
      borderRadius: 8,
      flex: 1,
      minHeight: 52,
      overflow: 'hidden',
    },
    secondaryButtonDisabled: {
      opacity: 0.5,
    },
    secondaryButtonGlass: {
      alignItems: 'center',
      backgroundColor: theme.button.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.button.secondaryBorder,
      justifyContent: 'center',
      minHeight: 52,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    secondaryButtonText: {
      color: theme.text.primary,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0,
    },
    secondaryButtonTextDisabled: {
      color: theme.text.muted,
    },
  });
