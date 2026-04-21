import { useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import type { AppTheme } from '@/constants/theme';
import { useWords } from '@/contexts/WordsContext';
import { useAppTheme } from '@/hooks/use-app-theme';
import { createShadow } from '@/utils/shadow';

const normalizeForComparison = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const capitalizeLeadingLetter = (value: string) => {
  const chars = Array.from(value);
  const firstLetterIndex = chars.findIndex((char) => /\p{L}/u.test(char));

  if (firstLetterIndex === -1) {
    return value;
  }

  const next = [...chars];
  next[firstLetterIndex] = next[firstLetterIndex].toLocaleUpperCase();
  return next.join('');
};

export default function AddWordScreen() {
  const { theme } = useAppTheme();
  const { addCustomWord, customWords } = useWords();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [english, setEnglish] = useState('');
  const [russian, setRussian] = useState('');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fireButtonHaptic = () => {
    void Haptics.selectionAsync();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    fireButtonHaptic();
    router.back();
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    setError('');

    const trimmedEnglish = english.trim();
    const trimmedRussian = russian.trim();
    const trimmedTranscription = transcription.trim();

    if (!trimmedEnglish) {
      setError('Введите слово или фразу на английском');
      return;
    }

    if (!trimmedRussian) {
      setError('Введите перевод на русском');
      return;
    }

    const duplicate = customWords.some(
      (word) =>
        normalizeForComparison(word.english) === normalizeForComparison(trimmedEnglish) &&
        normalizeForComparison(word.russian) === normalizeForComparison(trimmedRussian)
    );

    if (duplicate) {
      setError('Такое слово уже есть в разделе "Мои слова"');
      return;
    }

    fireButtonHaptic();
    setIsSaving(true);

    try {
      await addCustomWord({
        english: trimmedEnglish,
        russian: trimmedRussian,
        transcription: trimmedTranscription || undefined,
      });
      router.back();
    } catch (err) {
      console.warn('Failed to add custom word:', err);
      setError('Не удалось сохранить слово. Попробуйте еще раз');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[theme.background.start, theme.background.mid, theme.background.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback disabled={Platform.OS === 'web'} onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Добавить слово</Text>
              </View>

              <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
                <Ionicons name="close" size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <View style={styles.panel}>
              <Text style={styles.subtitle}>
                Сохрани новую карточку и запускай отдельную сессию обучения для своего словаря.
              </Text>

              <View style={styles.inputGroup}>
                <View style={styles.field}>
                  <Text style={styles.label}>English</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Например: Vivid"
                    placeholderTextColor={theme.text.muted}
                    value={english}
                    onChangeText={(value) => setEnglish(capitalizeLeadingLetter(value))}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    editable={!isSaving}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Русский перевод</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Например: Яркий"
                    placeholderTextColor={theme.text.muted}
                    value={russian}
                    onChangeText={(value) => setRussian(capitalizeLeadingLetter(value))}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    editable={!isSaving}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Transcription</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Необязательно"
                    placeholderTextColor={theme.text.muted}
                    value={transcription}
                    onChangeText={(value) => setTranscription(capitalizeLeadingLetter(value))}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    editable={!isSaving}
                  />
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.helperText}>
                Проверяем только обязательные поля и точные дубли внутри ваших пользовательских слов.
              </Text>

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  isSaving && styles.primaryButtonDisabled,
                ]}>
                <Text style={styles.primaryButtonText}>
                  {isSaving ? 'Сохраняем...' : 'Сохранить слово'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      minHeight: 48,
    },
    headerCopy: {
      flex: 1,
      paddingRight: 16,
    },
    title: {
      color: theme.text.primary,
      fontSize: 34,
      fontWeight: '800',
      letterSpacing: 0,
    },
    closeButton: {
      alignItems: 'center',
      backgroundColor: theme.surface.glass,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border.strong,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    panel: {
      backgroundColor: theme.surface.glassStrong,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      overflow: 'hidden',
      padding: 20,
      ...createShadow({
        color: theme.shadow.cool,
        offsetY: 18,
        opacity: theme.mode === 'dark' ? 0.18 : 0.12,
        radius: 28,
      }),
    },
    subtitle: {
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 22,
      marginBottom: 20,
    },
    inputGroup: {
      gap: 14,
    },
    field: {
      gap: 8,
    },
    label: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    input: {
      backgroundColor: theme.surface.card,
      borderColor: theme.border.strong,
      borderRadius: 12,
      borderWidth: 1,
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '500',
      minHeight: 56,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    errorText: {
      color: theme.state.danger,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    helperText: {
      color: theme.text.muted,
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 20,
      marginTop: 16,
      textAlign: 'center',
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 12,
      justifyContent: 'center',
      marginTop: 20,
      minHeight: 56,
      paddingHorizontal: 20,
      paddingVertical: 16,
      ...createShadow({
        color: theme.shadow.purple,
        offsetY: 12,
        opacity: theme.mode === 'dark' ? 0.2 : 0.14,
        radius: 20,
      }),
    },
    primaryButtonPressed: {
      backgroundColor: theme.button.primaryPressed,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: theme.text.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
  });
