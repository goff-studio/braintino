import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { APP_STORE_URL, PLAY_STORE_URL, storeUrlForPlatform } from '@/constants/storeLinks';
import { backfillShareStreakBadges } from '@/data/badges';
import {
  genericInviteMessage,
  inviteMessage,
  newestShareStreak,
  shareBodyForKind,
  shareStreakFromBadgeId,
  shareableStreakReached,
  streakInviteMessage,
} from '@/game/engines/invite';
import { shareMessage } from '@/game/engines/assessment';
import type { AssessmentResult } from '@/types/assessment';

function result(score = 78): AssessmentResult {
  return {
    id: 'focus_snapshot',
    score,
    focus: 80,
    speed: 76,
    consistency: 74,
    accuracy: 0.8,
    completedRounds: 18,
    mistakes: 2,
    durationSec: 88,
    completedAt: '2026-09-12T00:00:00.000Z',
    source: 'today',
    band: { label: 'Clear focus', blurb: 'Steady attention across this snapshot.' },
  };
}

const CLAIM_WORDS = /\b(iq|adhd|diagnos(?:e|is|tic)|clinical|medical test)\b/i;

describe('store links', () => {
  it('points iOS at the App Store id and others at Play', () => {
    assert.equal(storeUrlForPlatform('ios'), APP_STORE_URL);
    assert.equal(storeUrlForPlatform('android'), PLAY_STORE_URL);
    assert.equal(storeUrlForPlatform('web'), PLAY_STORE_URL);
    assert.match(APP_STORE_URL, /id6787367632/);
    assert.match(PLAY_STORE_URL, /com\.techtory\.braintino/);
  });
});

describe('share streak milestones', () => {
  it('maps 7 / 14 / 30 badges and ignores other ids', () => {
    assert.equal(shareStreakFromBadgeId('streak_7'), 7);
    assert.equal(shareStreakFromBadgeId('streak_14'), 14);
    assert.equal(shareStreakFromBadgeId('streak_30'), 30);
    assert.equal(shareStreakFromBadgeId('streak_3'), null);
    assert.equal(newestShareStreak(['first_session', 'streak_7', 'streak_14']), 14);
    assert.equal(newestShareStreak(['sessions_25']), null);
  });

  it('picks the latest reached shareable streak', () => {
    assert.equal(shareableStreakReached(0), null);
    assert.equal(shareableStreakReached(6), null);
    assert.equal(shareableStreakReached(7), 7);
    assert.equal(shareableStreakReached(13), 7);
    assert.equal(shareableStreakReached(14), 14);
    assert.equal(shareableStreakReached(29), 14);
    assert.equal(shareableStreakReached(30), 30);
  });

  it('backfills 14-day without inventing lower streaks the player does not have', () => {
    const filled = backfillShareStreakBadges({ streak_7: '2026-09-01' }, 20, '2026-09-12');
    assert.equal(filled.streak_7, '2026-09-01');
    assert.equal(filled.streak_14, '2026-09-12');
    assert.equal(filled.streak_30, undefined);
  });
});

describe('invite copy', () => {
  it('keeps the result share_message contract', () => {
    const snapshot = result(78);
    assert.equal(
      shareMessage(snapshot),
      "I scored 78/100 on Braintino's Focus Snapshot. Entertainment only — not a diagnosis."
    );
    assert.equal(shareBodyForKind({ kind: 'result', result: snapshot }), shareMessage(snapshot));
  });

  it('invite and streak copy include score, disclaimer, and both store URLs', () => {
    const snapshot = result(78);
    const invite = inviteMessage(snapshot);
    const streak = streakInviteMessage(7, snapshot);
    for (const text of [invite, streak, genericInviteMessage()]) {
      assert.match(text, /Entertainment only/i);
      assert.match(text, /not a diagnosis/i);
      assert.ok(text.includes(APP_STORE_URL));
      assert.ok(text.includes(PLAY_STORE_URL));
      assert.equal(CLAIM_WORDS.test(text.replace(/not a diagnosis/gi, '')), false);
    }
    assert.match(invite, /78\/100/);
    assert.match(invite, /Think you can beat it/);
    assert.match(streak, /7-day streak/);
    assert.match(streak, /78\/100/);
  });

  it('streak copy without a snapshot still invites without a fake score', () => {
    const text = streakInviteMessage(30);
    assert.match(text, /30-day streak/);
    assert.doesNotMatch(text, /scored/);
    assert.equal(shareBodyForKind({ kind: 'invite' }), genericInviteMessage());
    assert.equal(shareBodyForKind({ kind: 'streak', streakDays: 14 }), streakInviteMessage(14));
  });
});
