import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { WordsProvider, useWords } from '@/contexts/WordsContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UserDataSync } from '@/contexts/UserDataSync';
import { useAppTheme } from '@/hooks/use-app-theme';

function RootLayoutContent() {
  const { isDark } = useAppTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentUid, isHydrating } = useWords();
  const segments = useSegments();
  const router = useRouter();
  const hasLoadedUserProgress = !isAuthenticated || (!isHydrating && currentUid === user?.uid);

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
