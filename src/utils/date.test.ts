import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  daysUntilNextWeek,
  weekIndexFromKey,
  weekKeysFrom,
  weekStartKey,
} from '@/utils/date';

describe('week helpers', () => {
  it('anchors the week on Monday in local time', () => {
    const saturday = new Date(2026, 8, 12);
    assert.equal(weekStartKey(saturday), '2026-09-07');
    assert.deepEqual(weekKeysFrom(saturday), [
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
    ]);
  });

  it('counts days until the next Monday', () => {
    assert.equal(daysUntilNextWeek('2026-09-07'), 7); // Monday
    assert.equal(daysUntilNextWeek('2026-09-12'), 2); // Saturday
    assert.equal(daysUntilNextWeek('2026-09-13'), 1); // Sunday
  });

  it('gives a stable week index', () => {
    assert.equal(weekIndexFromKey('1970-01-05'), 0);
    assert.equal(weekIndexFromKey('1970-01-12'), 1);
    assert.ok(weekIndexFromKey('2026-09-07') > 0);
  });
});
