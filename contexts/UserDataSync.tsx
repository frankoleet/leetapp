import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWords } from './WordsContext';

/**
 * Component that syncs user data when auth state changes
 * This ensures WordsContext loads the correct user's data
 */
export function UserDataSync({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { loadUserData, clearUserData } = useWords();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      void loadUserData(user.uid);
    } else {
      clearUserData();
    }
  }, [authLoading, clearUserData, loadUserData, user?.uid]);

  return <>{children}</>;
}
