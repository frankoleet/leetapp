import { Platform, type ViewStyle } from 'react-native';

type ShadowOptions = {
  color: string;
  opacity: number;
  radius: number;
  offsetX?: number;
  offsetY: number;
};

const hexToRgb = (value: string) => {
  const normalized = value.replace('#', '');

  if (normalized.length === 3) {
    const [r, g, b] = normalized.split('');
    return {
      r: parseInt(`${r}${r}`, 16),
      g: parseInt(`${g}${g}`, 16),
      b: parseInt(`${b}${b}`, 16),
    };
  }

  if (normalized.length === 6) {
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  return null;
};

const withAlpha = (color: string, opacity: number) => {
  const rgb = hexToRgb(color);

  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\((.+),\s*[\d.]+\)/, `rgba($1, ${opacity})`);
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }

  return color;
};

export const createShadow = ({
  color,
  opacity,
  radius,
  offsetX = 0,
  offsetY,
}: ShadowOptions): ViewStyle =>
  Platform.select<ViewStyle>({
    web: {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${withAlpha(color, opacity)}`,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  }) ?? {};
