import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = true;

/** Synced from settings by the store; avoids a circular import. */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function canVibrate(): boolean {
  return enabled && Platform.OS !== 'web';
}

export function tapHaptic(): void {
  if (!canVibrate()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function successHaptic(): void {
  if (!canVibrate()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warningHaptic(): void {
  if (!canVibrate()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

export function completionHaptic(): void {
  if (!canVibrate()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
