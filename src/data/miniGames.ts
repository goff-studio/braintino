import { gradients } from '@/constants/colors';
import type { MiniGameConfig, MiniGameId } from '@/types/game';

export const MINI_GAMES: Record<MiniGameId, MiniGameConfig> = {
  focus_flash: {
    id: 'focus_flash',
    title: 'Processing Speed',
    shortTitle: 'Speed',
    skill: 'attention',
    skillLabel: 'Speed & Attention',
    description: 'React to brief visual cues with accuracy and control.',
    howToPlay:
      'Keep your eyes on the center. A cue appears briefly — then answer what you saw, or where the signal appeared. Accuracy first, speed second.',
    baseDurationSec: 60,
    icon: 'flash-outline',
    color: '#0067B1',
    gradient: gradients.focus,
    unlockLevel: 1,
  },
  route_recall: {
    id: 'route_recall',
    title: 'Route Memory',
    shortTitle: 'Route',
    skill: 'navigation',
    skillLabel: 'Spatial Memory',
    description: 'Recall a sequence of locations after a short preview.',
    howToPlay:
      'A route lights up across the grid, one waypoint at a time. When it fades, tap the waypoints in the same order.',
    baseDurationSec: 75,
    icon: 'navigate-outline',
    color: '#0E7C86',
    gradient: gradients.navigation,
    unlockLevel: 1,
  },
  pattern_garden: {
    id: 'pattern_garden',
    title: 'Pattern Sequence',
    shortTitle: 'Sequence',
    skill: 'memory',
    skillLabel: 'Working Memory',
    description: 'Repeat increasingly complex visual sequences.',
    howToPlay:
      'Tiles light up one by one. Repeat the sequence in order. At higher levels you may be asked to reverse it — the banner will tell you.',
    baseDurationSec: 70,
    icon: 'apps-outline',
    color: '#3E7C17',
    gradient: gradients.memory,
    unlockLevel: 1,
  },
  color_switch: {
    id: 'color_switch',
    title: 'Focus Control',
    shortTitle: 'Control',
    skill: 'inhibition',
    skillLabel: 'Focus Control',
    description: 'Respond to the rule while ignoring conflicting cues.',
    howToPlay:
      'A word appears in a colored ink — and they often disagree. Follow the current rule: respond to the COLOR you see, or the WORD you read.',
    baseDurationSec: 60,
    icon: 'swap-horizontal-outline',
    color: '#B26A00',
    gradient: gradients.color,
    unlockLevel: 2,
  },
  signal_shift: {
    id: 'signal_shift',
    title: 'Cognitive Flexibility',
    shortTitle: 'Flexibility',
    skill: 'flexibility',
    skillLabel: 'Flexibility',
    description: 'Adapt quickly as the sorting rule changes.',
    howToPlay:
      'Sort each card by shape or by color. The rule switches as you go — notice the change and adapt quickly.',
    baseDurationSec: 65,
    icon: 'git-branch-outline',
    color: '#3B5BA5',
    gradient: gradients.color,
    unlockLevel: 3,
  },
  market_memory: {
    id: 'market_memory',
    title: 'Practical Memory',
    shortTitle: 'Recall',
    skill: 'memory',
    skillLabel: 'Everyday Memory',
    description: 'Hold a short list in mind, then act on it.',
    howToPlay:
      'Memorize a short list of items. Then find exactly those items in the grid — nothing more.',
    baseDurationSec: 70,
    icon: 'list-outline',
    color: '#4B6478',
    gradient: gradients.memory,
    unlockLevel: 2,
  },
};

export const MINI_GAME_IDS = Object.keys(MINI_GAMES) as MiniGameId[];

export function getMiniGame(id: MiniGameId): MiniGameConfig {
  return MINI_GAMES[id];
}
