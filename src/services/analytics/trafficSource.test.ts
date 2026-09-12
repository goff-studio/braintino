import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyTrafficSource,
  getTrafficSource,
  parseConversionPayload,
  rememberTrafficSource,
} from '@/services/analytics/trafficSource';

describe('classifyTrafficSource', () => {
  it('defaults to organic when AppsFlyer fields are missing', () => {
    assert.equal(classifyTrafficSource({}), 'organic');
  });

  it('maps AppsFlyer Organic to organic', () => {
    assert.equal(classifyTrafficSource({ af_status: 'Organic' }), 'organic');
  });

  it('maps AppsFlyer Non-organic to paid', () => {
    assert.equal(classifyTrafficSource({ af_status: 'Non-organic' }), 'paid');
  });

  it('treats a non-organic media_source as paid even without af_status', () => {
    assert.equal(classifyTrafficSource({ media_source: 'googleadwords_int' }), 'paid');
  });

  it('keeps media_source=organic as organic', () => {
    assert.equal(classifyTrafficSource({ media_source: 'organic' }), 'organic');
  });
});

describe('parseConversionPayload', () => {
  it('reads the nested data object', () => {
    const data = parseConversionPayload({
      status: 'success',
      data: { af_status: 'Non-organic', media_source: 'Facebook Ads' },
    });
    assert.equal(classifyTrafficSource(data), 'paid');
  });

  it('parses a JSON-string data field', () => {
    const data = parseConversionPayload({
      data: JSON.stringify({ af_status: 'Organic' }),
    });
    assert.equal(classifyTrafficSource(data), 'organic');
  });

  it('returns {} for unusable payloads', () => {
    assert.deepEqual(parseConversionPayload(null), {});
    assert.deepEqual(parseConversionPayload({ data: 'not-json' }), {});
  });
});

describe('rememberTrafficSource', () => {
  it('caches the last classified source for funnel events', () => {
    rememberTrafficSource('paid');
    assert.equal(getTrafficSource(), 'paid');
    rememberTrafficSource('organic');
    assert.equal(getTrafficSource(), 'organic');
  });
});
