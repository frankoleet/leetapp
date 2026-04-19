import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const parseCount = (value: string | undefined) => {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
};

export default function ResultScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams<{
    total?: string | string[];
    knownCount?: string | string[];
    unknownCount?: string | string[];
    unknownIds?: string | string[];
  }>();

  const total = parseCount(readParam(params.total));
  const knownCount = parseCount(readParam(params.knownCount));
  const unknownCount = parseCount(readParam(params.unknownCount));
  const unknownIds = (readParam(params.unknownIds) ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const handleRepeatUnknown = () => {
    if (unknownIds.length === 0) {
      return;
    }
    router.replace({ pathname: '/study', params: { mode: 'unknown' } });
  };

  const handleClose = () => {
    router.replace('/');
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
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Результат</Text>
            <Text style={styles.title}>Сессия завершена</Text>
          </View>

          <View style={styles.centerWrap}>
            <BlurView intensity={38} tint={theme.blurTint} style={styles.panel}>
              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>Изучено в сессии</Text>
                <Text style={styles.totalValue}>{total}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Не знаю</Text>
                  <Text style={[styles.statValue, styles.statValueNegative]}>{unknownCount}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Знаю</Text>
                  <Text style={[styles.statValue, styles.statValuePositive]}>{knownCount}</Text>
                </View>
              </View>

              <Text style={styles.note}>
                {unknownCount === 0
                  ? 'Отлично! Все слова из сессии знакомы.'
                  : 'Продолжай изучать незнакомые слова.'}
              </Text>
            </BlurView>
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={handleClose} style={styles.secondaryButton}>
              <BlurView intensity={24} tint={theme.blurTint} style={styles.secondaryButtonGlass}>
                <Text style={styles.secondaryButtonText}>Закрыть</Text>
              </BlurView>
            </Pressable>

            {unknownCount > 0 && (
              <Pressable onPress={handleRepeatUnknown} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Повторить ({unknownCount})</Text>
              </Pressable>
            )}
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
      paddingTop: 16,
      paddingBottom: 28,
    },
    header: {
      marginBottom: 18,
    },
    eyebrow: {
      color: theme.text.secondary,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0,
      marginBottom: 8,
    },
    title: {
      color: theme.text.primary,
      fontSize: 34,
      fontWeight: '800',
      letterSpacing: 0,
    },
    centerWrap: {
      flex: 1,
      justifyContent: 'center',
    },
    panel: {
      backgroundColor: theme.surface.glassStrong,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      overflow: 'hidden',
      paddingHorizontal: 22,
      paddingTop: 28,
      paddingBottom: 24,
      shadowColor: theme.shadow.cool,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.12,
      shadowRadius: 28,
    },
    totalBlock: {
      alignItems: 'center',
      marginBottom: 28,
    },
    totalLabel: {
      color: theme.text.secondary,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0,
      marginBottom: 12,
    },
    totalValue: {
      color: theme.text.primary,
      fontSize: 64,
      fontWeight: '800',
      letterSpacing: 0,
      lineHeight: 72,
      textAlign: 'center',
    },
    statsRow: {
      alignItems: 'stretch',
      flexDirection: 'row',
      marginBottom: 22,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: 4,
    },
    statDivider: {
      backgroundColor: theme.border.strong,
      width: 1,
    },
    statLabel: {
      color: theme.text.muted,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0,
      marginBottom: 10,
    },
    statValue: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: 0,
    },
    statValueNegative: {
      color: theme.state.danger,
    },
    statValuePositive: {
      color: theme.state.success,
    },
    note: {
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '500',
      letterSpacing: 0,
      lineHeight: 22,
      textAlign: 'center',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    secondaryButton: {
      borderRadius: 8,
      flex: 1,
      minHeight: 54,
      overflow: 'hidden',
    },
    secondaryButtonGlass: {
      alignItems: 'center',
      backgroundColor: theme.button.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.button.secondaryBorder,
      justifyContent: 'center',
      minHeight: 54,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    secondaryButtonText: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 8,
      flex: 1,
      justifyContent: 'center',
      minHeight: 54,
      paddingHorizontal: 18,
      paddingVertical: 14,
      shadowColor: theme.shadow.purple,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.12,
      shadowRadius: 20,
    },
    primaryButtonDisabled: {
      backgroundColor: theme.button.disabled,
      opacity: 0.5,
    },
    primaryButtonText: {
      color: theme.text.onPrimary,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0,
    },
  });
