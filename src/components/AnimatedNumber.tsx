import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';
import type { fontSizes } from '@/constants/typography';

type Props = {
  value: number;
  durationMs?: number;
  prefix?: string;
  variant?: keyof typeof fontSizes;
  color?: string;
};

/** Counts up to `value` (instant when reduced motion is on). */
export function AnimatedNumber({ value, durationMs = 900, prefix = '', variant = 'display', color }: Props) {
  const { reducedMotion } = useTheme();
  const [shown, setShown] = useState(reducedMotion ? value : 0);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setShown(value);
      return;
    }
    const start = Date.now();
    raf.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t >= 1 && raf.current) clearInterval(raf.current);
    }, 33);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, [value, durationMs, reducedMotion]);

  return (
    <AppText variant={variant} color={color}>
      {prefix}
      {shown}
    </AppText>
  );
}
