import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import i18n from '@/i18n';
import { APP_LOCALES, resolveAppLocale } from '@/i18n/locales';
import { assessmentBandId } from '@/i18n/copy';
import { de } from '@/i18n/resources/de';
import { en } from '@/i18n/resources/en';
import { es } from '@/i18n/resources/es';
import { fr } from '@/i18n/resources/fr';
import { pt } from '@/i18n/resources/pt';
import { inviteMessage, genericInviteMessage, streakInviteMessage } from '@/game/engines/invite';
import { shareMessage } from '@/game/engines/assessment';
import type { AssessmentResult } from '@/types/assessment';

const RESOURCES = { en, es, pt, de, fr } as const;

function leafKeys(value: unknown, prefix = ''): string[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      leafKeys(child, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [prefix];
}

function snapshot(score = 78): AssessmentResult {
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

describe('resolveAppLocale', () => {
  it('honors an explicit override', () => {
    assert.equal(resolveAppLocale('de', 'en'), 'de');
    assert.equal(resolveAppLocale('pt', 'fr'), 'pt');
  });

  it('maps device language codes onto supported locales', () => {
    assert.equal(resolveAppLocale('system', 'es-MX'), 'es');
    assert.equal(resolveAppLocale('system', 'pt-BR'), 'pt');
    assert.equal(resolveAppLocale('system', 'de-DE'), 'de');
    assert.equal(resolveAppLocale('system', 'fr-CA'), 'fr');
    assert.equal(resolveAppLocale('system', 'en-GB'), 'en');
    assert.equal(resolveAppLocale('system', 'ja'), 'en');
    assert.equal(resolveAppLocale('system', null), 'en');
  });
});

describe('translation catalogs', () => {
  it('keeps the same keys in every locale', () => {
    const expected = leafKeys(en).sort();
    for (const locale of APP_LOCALES) {
      assert.deepEqual(leafKeys(RESOURCES[locale]).sort(), expected, locale);
    }
  });

  it('keeps entertainment-only disclaimers in every locale', async () => {
    for (const locale of APP_LOCALES) {
      await i18n.changeLanguage(locale);
      const disclaimer = i18n.t('assessment.disclaimer');
      const share = i18n.t('assessment.shareMessage', { score: 80 });
      const invite = i18n.t('invite.generic');
      for (const text of [disclaimer, share, invite]) {
        assert.match(text, /entertainment|entretenimiento|entretenimento|unterhaltung|divertissement/i);
        assert.match(
          text,
          /not a (medical|diagnostic)|no es (una prueba|un diagnóstico)|não é um (teste|diagnóstico)|kein(e)? (medizin|diagnos)|pas un (test|diagnostic)/i
        );
      }
    }
    await i18n.changeLanguage('en');
  });
});

describe('assessment band ids', () => {
  it('maps scores onto entertainment-only bands', () => {
    assert.equal(assessmentBandId(90), 'peak');
    assert.equal(assessmentBandId(70), 'clear');
    assert.equal(assessmentBandId(55), 'solid');
    assert.equal(assessmentBandId(40), 'starting');
  });
});

describe('localized invite copy', () => {
  it('keeps the English share_message contract', async () => {
    await i18n.changeLanguage('en');
    const result = snapshot(78);
    assert.equal(
      shareMessage(result),
      "I scored 78/100 on Braintino's Focus Snapshot. Entertainment only — not a diagnosis."
    );
    assert.match(inviteMessage(result), /Think you can beat it/);
    assert.match(streakInviteMessage(7, result), /7-day streak/);
    assert.match(genericInviteMessage(), /Entertainment only/);
  });

  it('switches invite copy when the locale changes', async () => {
    await i18n.changeLanguage('es');
    const text = inviteMessage(snapshot(78));
    assert.match(text, /78\/100/);
    assert.match(text, /Solo entretenimiento/i);
    assert.doesNotMatch(text, /Think you can beat it/);
    await i18n.changeLanguage('en');
  });
});
