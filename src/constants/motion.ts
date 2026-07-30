import { Easing, FadeInDown, FadeOutDown } from 'react-native-reanimated';

/**
 * Shared motion language: elements enter in a soft cascade (never all at
 * once), rising slightly while fading, with a long ease-out settle. Exits are
 * quicker and drift down. All of it is bypassed when reduced motion is on —
 * use the <Reveal> component rather than calling these directly.
 */

/** Cinematic ease-out: quick start, long soft settle. */
const EASE_ENTER = Easing.bezier(0.22, 1, 0.36, 1);
/** Gentle ease-in for outgoing elements. */
const EASE_EXIT = Easing.bezier(0.4, 0, 0.9, 0.6);

export const STAGGER_IN_MS = 70;
export const STAGGER_OUT_MS = 35;
export const ENTER_MS = 520;
export const EXIT_MS = 240;

/** Staggered entrance: rise + fade, offset by cascade index. */
export function enterStage(index = 0) {
  return FadeInDown.duration(ENTER_MS)
    .delay(index * STAGGER_IN_MS)
    .easing(EASE_ENTER)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 18 }] });
}

/** Staggered exit: quick fade with a slight downward drift. */
export function exitStage(index = 0) {
  return FadeOutDown.duration(EXIT_MS)
    .delay(index * STAGGER_OUT_MS)
    .easing(EASE_EXIT);
}
