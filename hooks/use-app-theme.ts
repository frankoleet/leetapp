import { useColorScheme } from 'react-native';

import { getAppTheme } from '@/constants/theme';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const theme = getAppTheme(colorScheme);

  return {
    colorScheme: theme.mode,
    isDark: theme.mode === 'dark',
    theme,
  };
}
