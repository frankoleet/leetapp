import { useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaskedView from '@react-native-masked-view/masked-view';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/contexts/AuthContext';
import { createShadow } from '@/utils/shadow';

export default function RegisterScreen() {
  const { theme } = useAppTheme();
  const { register } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fireButtonHaptic = () => {
    void Haptics.selectionAsync();
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email уже используется';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/operation-not-allowed':
        return 'Регистрация отключена';
      case 'auth/weak-password':
        return 'Слишком простой пароль (минимум 6 символов)';
      case 'auth/network-request-failed':
        return 'Ошибка сети. Проверьте подключение';
      default:
        return 'Ошибка регистрации';
    }
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    setError('');

    if (!email.trim()) {
      setError('Введите email');
      return;
    }

    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    fireButtonHaptic();
    setIsLoading(true);
    
    try {
      await register(email, password);
      // Navigation handled by auth state change
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    Keyboard.dismiss();
    fireButtonHaptic();
    router.back();
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
          <View style={styles.upperBlock}>
            <View style={styles.titleBlock}>
              {theme.mode === 'dark' ? (
                <MaskedView
                  maskElement={
                    <Text style={[styles.title, styles.titleMask]}>Leet App</Text>
                  }>
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
              <Text style={styles.subtitle}>Создай аккаунт и сохраняй прогресс</Text>
            </View>
          </View>

          <View style={styles.formBlock}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.text.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Пароль"
                placeholderTextColor={theme.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Повторите пароль"
                placeholderTextColor={theme.text.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                isLoading && styles.primaryButtonDisabled,
              ]}>
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Text>
            </Pressable>

            <Pressable onPress={handleLogin} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>
                Уже есть аккаунт? <Text style={styles.secondaryActionLink}>Войти</Text>
              </Text>
            </Pressable>
          </View>
          </View>
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
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    upperBlock: {
      alignItems: 'center',
      marginBottom: 48,
    },
    titleBlock: {
      alignItems: 'center',
      gap: 12,
    },
    title: {
      color: theme.text.primary,
      fontSize: 48,
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
    formBlock: {
      gap: 16,
    },
    inputGroup: {
      gap: 12,
    },
    input: {
      backgroundColor: theme.surface.card,
      borderColor: theme.border.strong,
      borderRadius: 12,
      borderWidth: 1,
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '500',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    errorText: {
      color: theme.state.danger,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: 12,
      justifyContent: 'center',
      minHeight: 56,
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
      opacity: 0.6,
    },
    primaryButtonText: {
      color: theme.text.onPrimary,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0,
    },
    secondaryAction: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    secondaryActionText: {
      color: theme.text.secondary,
      fontSize: 15,
      fontWeight: '500',
    },
    secondaryActionLink: {
      color: theme.accent.purple,
      fontWeight: '600',
    },
  });
