import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { enterStage, exitStage } from '@/constants/motion';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: React.ReactNode;
  /** Cascade position — each index enters slightly after the previous one. */
  index?: number;
  /** Also play a staggered exit when this element unmounts mid-screen. */
  exit?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Staggered cinematic entrance (and optional exit) for one screen element. */
export function Reveal({ children, index = 0, exit, style }: Props) {
  const { reducedMotion } = useTheme();
  if (reducedMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }
  return (
    <Animated.View
      entering={enterStage(index)}
      exiting={exit ? exitStage(index) : undefined}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
