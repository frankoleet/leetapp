import type { ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  blurTint: 'light' | 'dark';
  background: {
    base: string;
    start: string;
    mid: string;
    end: string;
  };
  surface: {
    primary: string;
    secondary: string;
    card: string;
    cardAlt: string;
    glass: string;
    glassStrong: string;
  };
  text: {
    primary: string;
    strong: string;
    secondary: string;
    muted: string;
    onPrimary: string;
  };
  button: {
    primary: string;
    primaryPressed: string;
    secondary: string;
    secondaryBorder: string;
    disabled: string;
  };
  border: {
    subtle: string;
    strong: string;
    accent: string;
  };
  accent: {
    purple: string;
    blue: string;
    pink: string;
    warm: string;
  };
  state: {
    success: string;
    successSoft: string;
    danger: string;
    dangerSoft: string;
  };
  progress: {
    track: string;
    fill: string;
  };
  chip: {
    bg: string;
    border: string;
  };
  shadow: {
    cool: string;
    purple: string;
  };
  effects: {
    titleGlow: string;
  };
};

export const lightTheme: AppTheme = {
  mode: 'light',
  blurTint: 'light',
  background: {
    base: '#F7F8FC',
    start: '#F7F8FC',
    mid: '#EEF2FF',
    end: '#FFF6FD',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#FDFDFF',
    card: '#FFFFFF',
    cardAlt: '#FDFDFF',
    glass: 'rgba(255,255,255,0.72)',
    glassStrong: 'rgba(255,255,255,0.88)',
  },
  text: {
    primary: '#0F172A',
    strong: '#111827',
    secondary: '#667085',
    muted: '#7A8499',
    onPrimary: '#FFFFFF',
  },
  button: {
    primary: '#121A34',
    primaryPressed: '#0D1328',
    secondary: 'rgba(255,255,255,0.76)',
    secondaryBorder: '#DDE3F0',
    disabled: 'rgba(18, 26, 52, 0.22)',
  },
  border: {
    subtle: '#E7EAF4',
    strong: '#DDE3F0',
    accent: 'rgba(124, 92, 255, 0.16)',
  },
  accent: {
    purple: '#7C5CFF',
    blue: '#59B3FF',
    pink: '#F05DFF',
    warm: '#FF9D4D',
  },
  state: {
    success: '#34C759',
    successSoft: 'rgba(52, 199, 89, 0.14)',
    danger: '#FF5A6B',
    dangerSoft: 'rgba(255, 90, 107, 0.14)',
  },
  progress: {
    track: 'rgba(89, 179, 255, 0.12)',
    fill: '#59B3FF',
  },
  chip: {
    bg: 'rgba(124, 92, 255, 0.12)',
    border: 'rgba(124, 92, 255, 0.14)',
  },
  shadow: {
    cool: '#C6D2F5',
    purple: '#CFC7FF',
  },
  effects: {
    titleGlow: 'rgba(0,0,0,0)',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  blurTint: 'dark',
  background: {
    base: '#0B1020',
    start: '#0B1020',
    mid: '#10172B',
    end: '#170F27',
  },
  surface: {
    primary: '#141B2F',
    secondary: '#1A2140',
    card: '#171F38',
    cardAlt: '#202846',
    glass: 'rgba(20, 27, 47, 0.76)',
    glassStrong: 'rgba(24, 31, 56, 0.94)',
  },
  text: {
    primary: '#F8FAFC',
    strong: '#FFFFFF',
    secondary: '#A8B1C7',
    muted: '#8590A8',
    onPrimary: '#F8FAFC',
  },
  button: {
    primary: '#1D2644',
    primaryPressed: '#18203A',
    secondary: 'rgba(28, 34, 56, 0.78)',
    secondaryBorder: '#2C3555',
    disabled: 'rgba(29, 38, 68, 0.32)',
  },
  border: {
    subtle: '#222B45',
    strong: '#2C3555',
    accent: 'rgba(155, 132, 255, 0.2)',
  },
  accent: {
    purple: '#9B84FF',
    blue: '#7FC8FF',
    pink: '#FF84F8',
    warm: '#FFB36B',
  },
  state: {
    success: '#45D36B',
    successSoft: 'rgba(69, 211, 107, 0.18)',
    danger: '#FF6B7D',
    dangerSoft: 'rgba(255, 107, 125, 0.18)',
  },
  progress: {
    track: 'rgba(127, 200, 255, 0.18)',
    fill: '#7FC8FF',
  },
  chip: {
    bg: 'rgba(155, 132, 255, 0.16)',
    border: 'rgba(155, 132, 255, 0.22)',
  },
  shadow: {
    cool: '#060A14',
    purple: '#7C5CFF',
  },
  effects: {
    titleGlow: 'rgba(155, 132, 255, 0.34)',
  },
};

export const getAppTheme = (scheme?: ColorSchemeName): AppTheme =>
  scheme === 'dark' ? darkTheme : lightTheme;
