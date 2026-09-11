import { Platform, Share } from 'react-native';
import { captureRef, type CaptureOptions } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { shareMessage } from '@/game/engines/assessment';
import type { ShareMethod } from '@/services/analytics/assessmentEvents';
import type { AssessmentResult } from '@/types/assessment';

type ShotRef = Parameters<typeof captureRef>[0];

const CAPTURE: CaptureOptions = { format: 'png', quality: 1 };

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

async function shareTextFallback(result: AssessmentResult): Promise<ShareMethod> {
  await Share.share({
    message: shareMessage(result),
    title: 'Braintino Focus Snapshot',
  });
  return 'fallback_text';
}

/**
 * Share plumbing for the Focus Snapshot.
 *
 * Captures whatever view is passed as `viewRef` (today: the placeholder
 * result card). A Figma-designed card can replace that view later without
 * changing this API. Falls back to `share_message` text when image share
 * is unavailable (including web local-file limits).
 */
export async function shareAssessmentCard(
  viewRef: ShotRef,
  result: AssessmentResult
): Promise<ShareMethod> {
  try {
    if (Platform.OS === 'web') {
      const dataUri = await captureRef(viewRef, { ...CAPTURE, result: 'data-uri' });
      const file = typeof dataUri === 'string' ? dataUriToFile(dataUri, 'braintino-focus-snapshot.png') : null;
      const nav = globalThis.navigator as Navigator | undefined;
      if (file && nav && typeof nav.share === 'function' && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({
          files: [file],
          title: 'Braintino Focus Snapshot',
          text: shareMessage(result),
        });
        return 'image';
      }
      return shareTextFallback(result);
    }

    const uri = await captureRef(viewRef, { ...CAPTURE, result: 'tmpfile' });
    if (typeof uri === 'string' && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Focus Snapshot',
        UTI: 'public.png',
      });
      return 'image';
    }
  } catch (e) {
    if (__DEV__) console.warn('[share] image share failed', e);
  }

  try {
    return await shareTextFallback(result);
  } catch (e) {
    if (__DEV__) console.warn('[share] text share failed', e);
    throw e;
  }
}
