import { getAppTheme } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';

export function useAppTheme() {
  const { themeMode } = useThemeContext();
  const theme = getAppTheme(themeMode);

  return {
    colorScheme: theme.mode,
    isDark: theme.mode === 'dark',
    theme,
  };
}
