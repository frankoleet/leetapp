import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import type { AppTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useWords } from '@/contexts/WordsContext';
import { useAppTheme } from '@/hooks/use-app-theme';
import { createShadow } from '@/utils/shadow';

export default function StartScreen() {
  const { theme } = useAppTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const { logout } = useAuth();
  const { customWordsLoading, statsBySource } = useWords();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const systemStats = statsBySource.system;
  const customStats = statsBySource.custom;
  const isWeb = Platform.OS === 'web';
  const themeGlyph = themeMode === 'dark' ? '☾' : '☀';

  const fireButtonHaptic = () => {
    void Haptics.selectionAsync();
  };

  const handleSystemStart = () => {
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'system:start' } });
  };

  const handleSystemUnknown = () => {
    if (systemStats.unknown === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'system:review', bucket: 'unknown' } });
  };

  const handleSystemKnown = () => {
    if (systemStats.known === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'system:review', bucket: 'known' } });
  };

  const handleCustomStart = () => {
    if (customWordsLoading || customStats.total === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'custom:start' } });
  };

  const handleCustomUnknown = () => {
    if (customWordsLoading || customStats.unknown === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'custom:review', bucket: 'unknown' } });
  };

  const handleCustomKnown = () => {
    if (customWordsLoading || customStats.known === 0) return;
    fireButtonHaptic();
    router.push({ pathname: '/study', params: { mode: 'custom:review', bucket: 'known' } });
  };

  const handleAddWord = () => {
    fireButtonHaptic();
    router.push('/add-word');
  };

  const handleThemeToggle = () => {
    fireButtonHaptic();
    void setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerBlock}>
            <View style={styles.headerTopRow}>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>Leet App</Text>
                <Text style={styles.subtitle}>Учи английские слова каждый день</Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable onPress={handleThemeToggle} style={styles.iconButton}>
                  {isWeb ? (
                    <Text style={styles.iconGlyph}>{themeGlyph}</Text>
                  ) : (
                    <Ionicons
                      name={themeMode === 'dark' ? 'moon' : 'sunny'}
                      size={16}
                      color={theme.text.secondary}
                    />
                  )}
                  <Text style={styles.iconButtonText}>
                    {themeMode === 'dark' ? 'Dark' : 'Light'}
                  </Text>
                </Pressable>

                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutText}>Выйти</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.cardsColumn}>
            <BlurView intensity={28} tint={theme.blurTint} style={styles.previewCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.previewLabel}>Базовый словарь</Text>
                <Text style={styles.cardDescription}>Случайные слова</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.statValueSuccess]}>{systemStats.known}</Text>
                  <Text style={styles.statLabel}>Знаю</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.statValueDanger]}>{systemStats.unknown}</Text>
                  <Text style={styles.statLabel}>Не знаю</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>∞</Text>
                  <Text style={styles.statLabel}>Новые</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={handleSystemStart}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.cardPrimaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}>
                  <Text style={styles.primaryButtonText}>Начать</Text>
                </Pressable>

                <View style={styles.secondaryRow}>
                  <Pressable
                    onPress={handleSystemUnknown}
                    disabled={systemStats.unknown === 0}
                    style={[
                      styles.secondaryButton,
                      systemStats.unknown === 0 && styles.secondaryButtonDisabled,
                    ]}>
                    <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          systemStats.unknown === 0 && styles.secondaryButtonTextDisabled,
                        ]}>
                        Не знаю
                      </Text>
                    </BlurView>
                  </Pressable>

                  <Pressable
                    onPress={handleSystemKnown}
                    disabled={systemStats.known === 0}
                    style={[
                      styles.secondaryButton,
                      systemStats.known === 0 && styles.secondaryButtonDisabled,
                    ]}>
                    <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          systemStats.known === 0 && styles.secondaryButtonTextDisabled,
                        ]}>
                        Знаю
                      </Text>
                    </BlurView>
                  </Pressable>
                </View>
              </View>
            </BlurView>

            <BlurView intensity={28} tint={theme.blurTint} style={styles.previewCard}>
              <View style={styles.customHeader}>
                <View style={styles.cardHeaderCopy}>
                  <Text style={styles.previewLabel}>Мои слова</Text>
                  <Text style={styles.cardDescription}>Все ваши добавленные слова</Text>
                  <Text style={styles.customCountText}>
                    {customWordsLoading ? 'Загрузка...' : `Добавлено: ${customStats.total}`}
                  </Text>
                </View>

                <Pressable onPress={handleAddWord} style={styles.inlineAddButton}>
                  <Text style={styles.inlineAddButtonText}>Добавить</Text>
                </Pressable>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.statValueSuccess]}>{customStats.known}</Text>
                  <Text style={styles.statLabel}>Знаю</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.statValueDanger]}>{customStats.unknown}</Text>
                  <Text style={styles.statLabel}>Не знаю</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{customStats.unstudied}</Text>
                  <Text style={styles.statLabel}>Новые</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={handleCustomStart}
                  disabled={customWordsLoading || customStats.total === 0}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.cardPrimaryButton,
                    pressed && styles.primaryButtonPressed,
                    (customWordsLoading || customStats.total === 0) && styles.primaryButtonDisabled,
                  ]}>
                  <Text style={styles.primaryButtonText}>Начать</Text>
                </Pressable>

                <View style={styles.secondaryRow}>
                  <Pressable
                    onPress={handleCustomUnknown}
                    disabled={customWordsLoading || customStats.unknown === 0}
                    style={[
                      styles.secondaryButton,
                      (customWordsLoading || customStats.unknown === 0) && styles.secondaryButtonDisabled,
                    ]}>
                    <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          (customWordsLoading || customStats.unknown === 0) && styles.secondaryButtonTextDisabled,
                        ]}>
                        Не знаю
                      </Text>
                    </BlurView>
                  </Pressable>

                  <Pressable
                    onPress={handleCustomKnown}
                    disabled={customWordsLoading || customStats.known === 0}
                    style={[
                      styles.secondaryButton,
                      (customWordsLoading || customStats.known === 0) && styles.secondaryButtonDisabled,
                    ]}>
                    <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          (customWordsLoading || customStats.known === 0) && styles.secondaryButtonTextDisabled,
                        ]}>
                        Знаю
                      </Text>
                    </BlurView>
                  </Pressable>
                </View>
              </View>
            </BlurView>
          </View>
        </ScrollView>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 28,
    },
    headerBlock: {
      marginBottom: 24,
    },
    headerTopRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    titleWrap: {
      flex: 1,
      paddingTop: 6,
    },
    title: {
      color: theme.text.primary,
      fontSize: 34,
      fontWeight: '800',
      letterSpacing: 0,
    },
    subtitle: {
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 22,
      marginTop: 8,
      maxWidth: 230,
    },
    headerActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    iconButton: {
      alignItems: 'center',
      backgroundColor: theme.surface.glass,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border.strong,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    iconButtonText: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '700',
    },
    iconGlyph: {
      color: theme.text.secondary,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16,
    },
    logoutButton: {
      alignItems: 'center',
      backgroundColor: theme.surface.glass,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border.strong,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    logoutText: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '700',
    },
    cardsColumn: {
      gap: 14,
    },
    previewCard: {
      backgroundColor: theme.surface.glassStrong,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      overflow: 'hidden',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
      ...createShadow({
        color: theme.shadow.purple,
        offsetY: 16,
        opacity: theme.mode === 'dark' ? 0.18 : 0.1,
        radius: 28,
      }),
      width: '100%',
    },
    cardHeader: {
      marginBottom: 16,
    },
    cardHeaderCopy: {
      flex: 1,
      paddingRight: 12,
    },
    previewLabel: {
      color: theme.accent.purple,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0,
      marginBottom: 6,
    },
    cardDescription: {
      color: theme.text.secondary,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    customHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    customCountText: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 8,
    },
    inlineAddButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    inlineAddButtonText: {
      color: theme.text.onPrimary,
      fontSize: 13,
      fontWeight: '700',
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
    cardActions: {
      gap: 12,
      marginTop: 18,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 8,
      justifyContent: 'center',
      minHeight: 58,
      paddingHorizontal: 20,
      paddingVertical: 16,
      ...createShadow({
        color: theme.shadow.cool,
        offsetY: 12,
        opacity: theme.mode === 'dark' ? 0.2 : 0.16,
        radius: 20,
      }),
    },
    primaryButtonPressed: {
      backgroundColor: theme.button.primaryPressed,
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },
    cardPrimaryButton: {
      minHeight: 54,
      width: '100%',
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
