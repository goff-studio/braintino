import { useEffect, useRef, useState } from 'react';
import type { DifficultyConfig, RoundsSummary } from '@/types/game';

export type MiniGameProps = {
  difficulty: DifficultyConfig;
  paused: boolean;
  /** Seed prefix so rounds are deterministic per date+level. */
  seed: string;
  onComplete: (summary: RoundsSummary) => void;
  /** Reports the current round (1-based) so the header can show progress. */
  onRoundChange?: (round: number) => void;
  /** Override the configured rounds per session (calibration's short bursts). */
  roundCount?: number;
};

/**
 * A timeout that respects pause. Fires `callback` once per `token` after
 * `delayMs` of unpaused time. Pass `delayMs = null` to disable.
 */
export function usePausableTimeout(
  callback: () => void,
  delayMs: number | null,
  paused: boolean,
  token: unknown
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const remainingRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    remainingRef.current = delayMs;
    firedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (delayMs == null || paused || firedRef.current) return;
    const remaining = remainingRef.current ?? delayMs;
    const startedAt = Date.now();
    const timer = setTimeout(() => {
      firedRef.current = true;
      remainingRef.current = null;
      cbRef.current();
    }, remaining);
    return () => {
      clearTimeout(timer);
      if (!firedRef.current && remainingRef.current != null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAt));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, paused, delayMs == null]);
}

/** Accumulates answers across rounds and builds the final RoundsSummary. */
export function useRoundTracker() {
  const ref = useRef({ correct: 0, total: 0, mistakes: 0, reactionTimesMs: [] as number[] });

  return {
    record(correct: boolean, reactionMs?: number) {
      ref.current.total += 1;
      if (correct) ref.current.correct += 1;
      else ref.current.mistakes += 1;
      if (reactionMs !== undefined && reactionMs > 0 && reactionMs < 30000) {
        ref.current.reactionTimesMs.push(reactionMs);
      }
    },
    summary(completedRounds: number, completed: boolean): RoundsSummary {
      return { ...ref.current, reactionTimesMs: [...ref.current.reactionTimesMs], completedRounds, completed };
    },
  };
}

/** Stopwatch for reaction times that ignores paused time. */
export function useReactionClock(paused: boolean) {
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) {
      pausedAtRef.current = Date.now();
    } else if (pausedAtRef.current != null) {
      accumulatedRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [paused]);

  return {
    start() {
      startRef.current = Date.now();
      accumulatedRef.current = 0;
      pausedAtRef.current = null;
    },
    elapsed(): number {
      return Date.now() - startRef.current - accumulatedRef.current;
    },
  };
}

/** Small helper for phase state machines: setPhase also bumps a timer token. */
export function usePhase<T extends string>(initial: T) {
  const [phase, setPhaseRaw] = useState<T>(initial);
  const [token, setToken] = useState(0);
  const setPhase = (next: T) => {
    setPhaseRaw(next);
    setToken((t) => t + 1);
  };
  return { phase, setPhase, token };
}

export const ENCOURAGEMENTS_CORRECT = ['Correct.', 'Sharp.', 'Clean.', 'Accurate.'];
export const ENCOURAGEMENTS_MISS = ['Not quite.', 'Keep going.', 'Next one.', 'Stay with it.'];
