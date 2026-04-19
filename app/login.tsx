import { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaskedView from '@react-native-masked-view/masked-view';

import type { AppTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const { login } = useAuth();
  const { themeMode, setThemeMode } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fireButtonHaptic = () => {
    void Haptics.selectionAsync();
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/user-disabled':
        return 'Аккаунт заблокирован';
      case 'auth/user-not-found':
        return 'Пользователь не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      case 'auth/invalid-credential':
        return 'Неверный email или пароль';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Попробуйте позже';
      case 'auth/network-request-failed':
        return 'Ошибка сети. Проверьте подключение';
      default:
        return 'Ошибка входа';
    }
  };

  const handleLogin = async () => {
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

    fireButtonHaptic();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    Keyboard.dismiss();
    fireButtonHaptic();
    router.push('/register');
  };

  const handleThemeSwitch = (mode: 'light' | 'dark') => {
    fireButtonHaptic();
    void setThemeMode(mode);
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
            <View style={styles.headerRow}>
              <View style={styles.headerSpacer} />

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

            <View style={styles.upperBlock}>
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
                <Text style={styles.subtitle}>Войди, чтобы продолжить обучение</Text>
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
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonDisabled,
                ]}>
                <Text style={styles.primaryButtonText}>{isLoading ? 'Вход...' : 'Войти'}</Text>
              </Pressable>

              <Pressable onPress={handleRegister} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>
                  Нет аккаунта?{' '}
                  <Text style={styles.secondaryActionLink}>Зарегистрироваться</Text>
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
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    headerSpacer: {
      width: 1,
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
      shadowColor: theme.shadow.cool,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.16,
      shadowRadius: 20,
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
