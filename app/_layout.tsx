import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { WordsProvider, useWords } from '@/contexts/WordsContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UserDataSync } from '@/contexts/UserDataSync';
import { useAppTheme } from '@/hooks/use-app-theme';

function RootLayoutContent() {
  const { isDark, theme } = useAppTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentUid, customWordsLoading, isHydrating } = useWords();
  const segments = useSegments();
  const router = useRouter();
  const hasLoadedUserProgress =
    !isAuthenticated || (!isHydrating && !customWordsLoading && currentUid === user?.uid);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const metaName = 'theme-color';
    let themeColorMeta = document.querySelector(`meta[name="${metaName}"]`);

    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', metaName);
      document.head.appendChild(themeColorMeta);
    }

    const browserColor = theme.background.base;
    themeColorMeta.setAttribute('content', browserColor);
    document.documentElement.style.backgroundColor = browserColor;
    document.body.style.backgroundColor = browserColor;
    document.documentElement.style.colorScheme = theme.mode;
  }, [theme.background.base, theme.mode]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/');
    }
  }, [currentUid, hasLoadedUserProgress, isAuthenticated, isHydrating, isLoading, router, segments, user?.uid]);

  if (!isLoading && isAuthenticated && !hasLoadedUserProgress) {
    return <StatusBar style={isDark ? 'light' : 'dark'} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="register" options={{ gestureEnabled: false }} />
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="study" />
        <Stack.Screen
          name="add-word"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <WordsProvider>
            <UserDataSync>
              <RootLayoutContent />
            </UserDataSync>
          </WordsProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
