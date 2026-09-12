/** Public store listings used in invite / challenge share text (issue #7). */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6787367632';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.techtory.braintino';

/** Sharer's store — friends on the other OS still get both URLs in invite copy. */
export function storeUrlForPlatform(os: string): string {
  return os === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
}

export function storeLinksBlock(): string {
  return `Get Braintino:\n${APP_STORE_URL}\n${PLAY_STORE_URL}`;
}
