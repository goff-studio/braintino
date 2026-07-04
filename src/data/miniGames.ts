import { gradients, palette } from '@/constants/colors';
import type { MiniGameConfig, MiniGameId } from '@/types/game';

export const MINI_GAMES: Record<MiniGameId, MiniGameConfig> = {
  focus_flash: {
    id: 'focus_flash',
    title: 'Focus Flash',
    shortTitle: 'Focus',
    skill: 'attention',
    skillLabel: 'Speed & Attention',
    description: 'Catch what flashes in the lighthouse beam.',
    howToPlay:
      'Watch the center of the lighthouse. Something will flash briefly — then answer what you saw, or where the sparkle appeared. No rush: accuracy matters most.',
    baseDurationSec: 60,
    icon: 'flash',
    color: palette.brainBlue,
    gradient: gradients.focus,
    location: 'Focus Lighthouse',
    unlockLevel: 1,
  },
  route_recall: {
    id: 'route_recall',
    title: 'Route Recall',
    shortTitle: 'Route',
    skill: 'navigation',
    skillLabel: 'Navigation',
    description: 'Remember the path across the island.',
    howToPlay:
      'Watch Tino’s route light up across the island landmarks. When it fades, tap the landmarks in the same order.',
    baseDurationSec: 75,
    icon: 'map',
    color: palette.aquaMint,
    gradient: gradients.navigation,
    location: 'Island Trails',
    unlockLevel: 1,
  },
  pattern_garden: {
    id: 'pattern_garden',
    title: 'Pattern Garden',
    shortTitle: 'Pattern',
    skill: 'memory',
    skillLabel: 'Memory',
    description: 'Repeat the glowing garden sequence.',
    howToPlay:
      'Watch the garden tiles glow one by one. Then tap them in the same order. Later levels may ask for reverse order — the banner will tell you.',
    baseDurationSec: 70,
    icon: 'flower',
    color: palette.successGreen,
    gradient: gradients.memory,
    location: 'Memory Garden',
    unlockLevel: 1,
  },
  color_switch: {
    id: 'color_switch',
    title: 'Color Switch',
    shortTitle: 'Color',
    skill: 'inhibition',
    skillLabel: 'Focus Control',
    description: 'Follow the rule, not the distraction.',
    howToPlay:
      'A card shows a word painted in a color — sometimes they disagree! Follow the rule banner: tap the COLOR you see, or the WORD you read.',
    baseDurationSec: 60,
    icon: 'color-palette',
    color: palette.sunriseCoral,
    gradient: gradients.color,
    location: 'Color Dock',
    unlockLevel: 2,
  },
  signal_shift: {
    id: 'signal_shift',
    title: 'Signal Shift',
    shortTitle: 'Signal',
    skill: 'flexibility',
    skillLabel: 'Flexibility',
    description: 'Sort the signals as the rule shifts.',
    howToPlay:
      'Cards arrive at the Signal Tower. Sort each one into the right dock — by color or by shape. Watch out: the sorting rule changes as you play!',
    baseDurationSec: 65,
    icon: 'git-compare',
    color: palette.softPurple,
    gradient: gradients.color,
    location: 'Signal Tower',
    unlockLevel: 3,
  },
  market_memory: {
    id: 'market_memory',
    title: 'Market Memory',
    shortTitle: 'Market',
    skill: 'memory',
    skillLabel: 'Practical Memory',
    description: 'Remember Tino’s little shopping list.',
    howToPlay:
      'Tino shows you a short shopping list. Remember it! Then tap only the right items at the market stall.',
    baseDurationSec: 70,
    icon: 'basket',
    color: palette.warmYellow,
    gradient: gradients.memory,
    location: 'Market Path',
    unlockLevel: 2,
  },
};

export const MINI_GAME_IDS = Object.keys(MINI_GAMES) as MiniGameId[];

export function getMiniGame(id: MiniGameId): MiniGameConfig {
  return MINI_GAMES[id];
}
