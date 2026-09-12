import type { TFunction } from 'i18next';
import type { MiniGameId, MiniGameResult, SkillType, WeeklyTwistId } from '@/types/game';
import type { PersonalPlan, PlanGoal, PlanWeakSpot } from '@/types/plan';
import type { DifficultyMode } from '@/types/settings';
import { rankForLevel } from '@/data/levels';
import type { DailyPlan } from '@/game/engines/dailyTraining';
import i18n, { currentAppLocale, localeTag } from '@/i18n';

type T = TFunction;

export function tNow(): T {
  return i18n.t.bind(i18n) as T;
}

export function formatClock(hour: number, minute: number, locale = currentAppLocale()): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(localeTag(locale), { hour: 'numeric', minute: '2-digit' }).format(
    date
  );
}

export function formatTodayLabel(date: Date, locale = currentAppLocale()): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
    .format(date)
    .toUpperCase();
}

export function localizedGameTitle(id: MiniGameId, t: T = tNow()): string {
  return t(`games.${id}.title`);
}

export function localizedGameShort(id: MiniGameId, t: T = tNow()): string {
  return t(`games.${id}.shortTitle`);
}

export function localizedGameDescription(id: MiniGameId, t: T = tNow()): string {
  return t(`games.${id}.description`);
}

export function localizedSkillLabel(skill: SkillType, t: T = tNow()): string {
  return t(`skills.${skill}`);
}

export function localizedRank(level: number, t: T = tNow()): string {
  return t(`ranks.${rankForLevel(level).toLowerCase()}`);
}

export function localizedDailyTitle(
  plan: DailyPlan,
  personalPlan: PersonalPlan | null | undefined,
  t: T = tNow()
): string {
  if (plan.themeId === 'personal' && personalPlan) {
    return t(`plan.titles.${personalPlan.goal}`);
  }
  if (plan.themeId && plan.themeId !== 'personal') {
    return t(`daily.themes.${plan.themeId}`);
  }
  return plan.title;
}

export function localizedWeeklyTitle(twist: WeeklyTwistId, t: T = tNow()): string {
  return t(`weekly.themes.${twist}.title`);
}

export function localizedWeeklyBlurb(twist: WeeklyTwistId, t: T = tNow()): string {
  return t(`weekly.themes.${twist}.blurb`);
}

export function localizedWeeklyTwist(twist: WeeklyTwistId, t: T = tNow()): string {
  return t(`weekly.twists.${twist}`);
}

export type AssessmentBandId = 'peak' | 'clear' | 'solid' | 'starting';

export function assessmentBandId(score: number): AssessmentBandId {
  if (score >= 85) return 'peak';
  if (score >= 70) return 'clear';
  if (score >= 55) return 'solid';
  return 'starting';
}

export function localizedAssessmentBand(score: number, t: T = tNow()): { label: string; blurb: string } {
  const id = assessmentBandId(score);
  return {
    label: t(`assessment.bands.${id}.label`),
    blurb: t(`assessment.bands.${id}.blurb`),
  };
}

export function localizedPlanTitle(goal: PlanGoal, t: T = tNow()): string {
  return t(`plan.titles.${goal}`);
}

export function localizedPlanPace(mode: DifficultyMode, t: T = tNow()): string {
  return t(`plan.paces.${mode}`);
}

function joinAnd(items: string[], t: T): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return t('plan.joinAnd2', { a: items[0], b: items[1] });
  return t('plan.joinAndMore', { list: items.slice(0, -1).join(', '), last: items[items.length - 1] });
}

export function localizedPlanFocusCopy(
  goal: PlanGoal,
  weakSpots: readonly PlanWeakSpot[],
  t: T = tNow()
): string {
  const spots = weakSpots.map((spot) => t(`plan.spots.${spot}`));
  if (spots.length > 0) {
    return t('plan.focusLean', { spots: joinAnd(spots, t) });
  }
  return t('plan.focusGoal', { goal: t(`plan.goals.${goal}`) });
}

export function localizedStreakSave(streak: number, t: T = tNow()): string {
  if (streak <= 1) return t('habit.streakDay1');
  return t('habit.streakSaved', { count: streak });
}

export function localizedConsistencyLabel(consistency: number, t: T = tNow()): string {
  if (consistency >= 0.8) return t('results.consistency.stable');
  if (consistency >= 0.6) return t('results.consistency.steady');
  return t('results.consistency.variable');
}

export function localizedFriendlyFeedback(result: MiniGameResult, t: T = tNow()): string {
  if (result.completed && result.accuracy >= 0.9) {
    return t(`results.feedback.${result.miniGameId}`);
  }
  if (result.completed && result.accuracy >= 0.75) return t('results.feedback.strong');
  if (result.accuracy < 0.55) return t('results.feedback.demanding');
  if (result.completed) return t('results.feedback.solid');
  return t('results.feedback.logged');
}

export function localizedDifficultyChange(
  previousLevel: number,
  nextLevel: number,
  t: T = tNow()
): string | null {
  const delta = nextLevel - previousLevel;
  if (delta >= 3) return t('results.difficulty.jump');
  if (delta === 2) return t('results.difficulty.upTwo');
  if (delta === 1) return t('results.difficulty.up');
  if (delta <= -1) return t('results.difficulty.down');
  return null;
}

export function localizedBadgeTitle(id: string, fallback: string, t: T = tNow()): string {
  const key = `badges.${id}.title`;
  const value = t(key);
  return value === key ? fallback : value;
}

export function localizedBadgeDescription(id: string, fallback: string, t: T = tNow()): string {
  const key = `badges.${id}.description`;
  const value = t(key);
  return value === key ? fallback : value;
}
