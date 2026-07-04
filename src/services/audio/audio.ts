import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type SoundName = 'tap' | 'correct' | 'wrong' | 'complete' | 'daily';

const SOURCES: Record<SoundName, number> = {
  tap: require('@/assets/sounds/tap.wav'),
  correct: require('@/assets/sounds/correct.wav'),
  wrong: require('@/assets/sounds/wrong.wav'),
  complete: require('@/assets/sounds/complete.wav'),
  daily: require('@/assets/sounds/daily.wav'),
};

let enabled = true;
let players: Partial<Record<SoundName, AudioPlayer>> = {};
let initialized = false;

/** Synced from settings by the store; avoids a circular import. */
export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export async function initAudio(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
    for (const name of Object.keys(SOURCES) as SoundName[]) {
      const player = createAudioPlayer(SOURCES[name]);
      player.volume = name === 'tap' ? 0.35 : 0.6;
      players[name] = player;
    }
  } catch {
    // If audio fails to initialize, the game continues silently.
    players = {};
  }
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  try {
    const player = players[name];
    if (!player) return;
    player.seekTo(0);
    player.play();
  } catch {
    // Continue silently.
  }
}

export function releaseAudio(): void {
  try {
    for (const player of Object.values(players)) player?.release();
  } catch {
    // ignore
  }
  players = {};
  initialized = false;
}
