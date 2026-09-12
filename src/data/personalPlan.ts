import type { Ionicons } from '@expo/vector-icons';
import type { PlanAgeBand, PlanGoal, PlanWeakSpot } from '@/types/plan';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type PlanOption<T extends string> = {
  id: T;
  label: string;
  description: string;
  icon: IoniconName;
};

export const GOAL_OPTIONS: PlanOption<PlanGoal>[] = [
  {
    id: 'focus',
    label: 'Sharpen focus',
    description: 'Stay with a task without drifting',
    icon: 'eye-outline',
  },
  {
    id: 'memory',
    label: 'Remember more',
    description: 'Hold lists and sequences in mind',
    icon: 'layers-outline',
  },
  {
    id: 'speed',
    label: 'Think faster',
    description: 'React quickly and accurately',
    icon: 'flash-outline',
  },
  {
    id: 'flexibility',
    label: 'Stay flexible',
    description: 'Switch gears when the rule changes',
    icon: 'git-branch-outline',
  },
  {
    id: 'habit',
    label: 'Build a habit',
    description: 'Five minutes, most days',
    icon: 'calendar-outline',
  },
];

export const AGE_OPTIONS: PlanOption<PlanAgeBand>[] = [
  { id: 'under_25', label: 'Under 25', description: 'A quicker starting pace', icon: 'sparkles-outline' },
  { id: '25_34', label: '25–34', description: 'The standard adult baseline', icon: 'person-outline' },
  { id: '35_49', label: '35–49', description: 'The standard adult baseline', icon: 'person-outline' },
  { id: '50_plus', label: '50+', description: 'A calmer starting pace', icon: 'leaf-outline' },
  {
    id: 'prefer_not',
    label: 'Prefer not to say',
    description: 'We’ll start at the standard pace',
    icon: 'remove-outline',
  },
];

export const WEAK_SPOT_OPTIONS: PlanOption<PlanWeakSpot>[] = [
  {
    id: 'focus',
    label: 'Staying focused',
    description: 'Attention wanders during short tasks',
    icon: 'eye-outline',
  },
  {
    id: 'memory',
    label: 'Holding things in mind',
    description: 'Sequences and working memory',
    icon: 'layers-outline',
  },
  {
    id: 'speed',
    label: 'Quick reactions',
    description: 'Speed with accuracy',
    icon: 'speedometer-outline',
  },
  {
    id: 'switching',
    label: 'Switching tasks',
    description: 'Changing rules on the fly',
    icon: 'swap-horizontal-outline',
  },
  {
    id: 'everyday',
    label: 'Everyday recall',
    description: 'Lists, routes, and names',
    icon: 'list-outline',
  },
];

export const GOAL_TITLE: Record<PlanGoal, string> = {
  focus: 'Focus First',
  memory: 'Memory Mix',
  speed: 'Speed & Control',
  flexibility: 'Flex & Switch',
  habit: 'Daily Five',
};

export const GOAL_SHORT: Record<PlanGoal, string> = {
  focus: 'focus',
  memory: 'memory',
  speed: 'speed',
  flexibility: 'flexibility',
  habit: 'a daily habit',
};

export const WEAK_SPOT_SHORT: Record<PlanWeakSpot, string> = {
  focus: 'focus',
  memory: 'memory',
  speed: 'speed',
  switching: 'switching',
  everyday: 'everyday recall',
};

export const DIFFICULTY_PACE_LABEL: Record<'relaxed' | 'balanced' | 'challenging', string> = {
  relaxed: 'Comfortable pace',
  balanced: 'Balanced pace',
  challenging: 'Brisk pace',
};
