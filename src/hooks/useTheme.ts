import { useMemo } from 'react';
import { getThemeColors, type ThemeColors } from '@/constants/colors';
import { scaledSize } from '@/constants/typography';
import { useGameStore } from '@/store/useGameStore';
import type { PlayerSettings } from '@/types/settings';

export type Theme = {
  colors: ThemeColors;
  /** Font size scaled by the bigger-text setting. */
  fs: (size: number) => number;
  reducedMotion: boolean;
  settings: PlayerSettings;
};

export function useTheme(): Theme {
  const settings = useGameStore((s) => s.settings);
  return useMemo(
    () => ({
      colors: getThemeColors(settings.highContrast),
      fs: (size: number) => scaledSize(size, settings.biggerText),
      reducedMotion: settings.reducedMotion,
      settings,
    }),
    [settings]
  );
}
