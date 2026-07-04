import type { ComponentType } from 'react';
import type { MiniGameId } from '@/types/game';
import { ColorSwitch } from './ColorSwitch';
import { FocusFlash } from './FocusFlash';
import { MarketMemory } from './MarketMemory';
import { PatternGarden } from './PatternGarden';
import { RouteRecall } from './RouteRecall';
import { SignalShift } from './SignalShift';
import type { MiniGameProps } from './shared';

export const GAME_COMPONENTS: Record<MiniGameId, ComponentType<MiniGameProps>> = {
  focus_flash: FocusFlash,
  route_recall: RouteRecall,
  pattern_garden: PatternGarden,
  color_switch: ColorSwitch,
  signal_shift: SignalShift,
  market_memory: MarketMemory,
};
