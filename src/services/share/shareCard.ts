import { Alert, Platform, Share } from 'react-native';
import { captureRef, type CaptureOptions } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/components/AssessmentShareCard';
import { shareMessage } from '@/game/engines/assessment';
import type { ShareMethod } from '@/services/analytics/assessmentEvents';
import type { AssessmentResult } from '@/types/assessment';

export type ShotRef = Parameters<typeof captureRef>[0];

export type ShareOutcome = {
  method: ShareMethod;
  platform: string;
  completed: boolean;
  activityType?: string;
};

const CAPTURE: CaptureOptions = {
  format: 'png',
  quality: 1,
  width: 1080,
  height: Math.round((1080 * SHARE_CARD_HEIGHT) / SHARE_CARD_WIDTH),
};

function dataUriToFile(dataUri: string, filename: string): File | null {
  try {
    const [header, data] = dataUri.split(',');
    if (!data) return null;
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
  } catch {
    return null;
  }
}

function outcomeFromShareResult(
  method: ShareMethod,
  shareResult: { action: string; activityType?: string | null }
): ShareOutcome {
  return {
    method,
    platform: Platform.OS,
    completed: shareResult.action !== Share.dismissedAction,
    activityType:
      typeof shareResult.activityType === 'string' ? shareResult.activityType : undefined,
  };
}

async function copyInviteToClipboard(message: string): Promise<boolean> {
  try {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.clipboard && typeof nav.clipboard.writeText === 'function') {
      await nav.clipboard.writeText(message);
      return true;
    }
  } catch {
    // Permissions / insecure context — the alert still shows the text.
  }
  return false;
}

/** Desktop web often has no share sheet; copy + alert still delivers the invite. */
function notifyInviteReady(message: string, copied: boolean): void {
  const body = copied ? `${message}\n\nCopied — paste it to a friend.` : message;
  if (Platform.OS === 'web' && typeof globalThis.alert === 'function') {
    globalThis.alert(`Invite ready\n\n${body}`);
    return;
  }
  Alert.alert('Invite ready', body);
}

async function presentCopiedInvite(message: string): Promise<ShareOutcome> {
  const copied = await copyInviteToClipboard(message);
  notifyInviteReady(message, copied);
  return { method: 'fallback_text', platform: Platform.OS, completed: true };
}

async function shareTextFallback(
  message: string,
  title = 'Braintino Focus Snapshot'
): Promise<ShareOutcome> {
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (typeof nav?.share === 'function') {
      try {
        await nav.share({ title, text: message });
        return { method: 'fallback_text', platform: Platform.OS, completed: true };
      } catch (e) {
        const name = e instanceof Error ? e.name : '';
        if (name === 'AbortError') {
          return { method: 'fallback_text', platform: Platform.OS, completed: false };
        }
      }
    }
    return presentCopiedInvite(message);
  }

  const shareResult = await Share.share({ message, title });
  return outcomeFromShareResult('fallback_text', shareResult);
}

/** Prefill-only invite / streak text + store URLs (issue #7). */
export async function shareTextInvite(
  message: string,
  title = 'Braintino'
): Promise<ShareOutcome> {
  return shareTextFallback(message, title);
}

/**
 * Share plumbing for the Focus Snapshot.
 *
 * Captures the Share Card / 1080 view (`AssessmentShareCard`) at 1080×1440.
 * Falls back to `share_message` text when image share is unavailable.
 * Optional `message` overrides the sheet text (invite / streak copy).
 */
export async function shareAssessmentCard(
  viewRef: ShotRef,
  result: AssessmentResult,
  options?: { message?: string }
): Promise<ShareOutcome> {
  const text = options?.message ?? shareMessage(result);

  try {
    if (Platform.OS === 'web') {
      const dataUri = await captureRef(viewRef, { ...CAPTURE, result: 'data-uri' });
      const file =
        typeof dataUri === 'string' ? dataUriToFile(dataUri, 'braintino-focus-snapshot.png') : null;
      const nav = globalThis.navigator as Navigator | undefined;
      if (file && nav && typeof nav.share === 'function' && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({
          files: [file],
          title: 'Braintino Focus Snapshot',
          text,
        });
        return { method: 'image', platform: Platform.OS, completed: true };
      }
      return shareTextFallback(text);
    }

    const uri = await captureRef(viewRef, { ...CAPTURE, result: 'tmpfile' });
    if (typeof uri === 'string' && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Focus Snapshot',
        UTI: 'public.png',
      });
      return { method: 'image', platform: Platform.OS, completed: true };
    }
  } catch (e) {
    if (__DEV__) console.warn('[share] image share failed', e);
  }

  try {
    return await shareTextFallback(text);
  } catch (e) {
    if (__DEV__) console.warn('[share] text share failed', e);
    throw e;
  }
}
