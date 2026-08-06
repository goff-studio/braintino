import { pick, rngFromString } from '@/utils/random';
import factsJson from './facts.json';

export type ScienceFact = {
  id: string;
  fact: string;
  source: string;
  link: string;
};

const FACTS = factsJson as ScienceFact[];

/**
 * Fact of the day, shown after the daily session. Seeded by date so every
 * completion on the same day shows the same fact, and it rotates daily.
 */
export function getDailyFact(dateKey: string): ScienceFact {
  return pick(rngFromString(`fact-${dateKey}`), FACTS);
}
