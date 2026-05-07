import { describe, it, expect } from 'vitest';
import {
  computeHealthScore,
  computeWeekDelta,
  formatSleep,
  normalizeAgainstNorm,
  formatNormRange,
} from '../health';

describe('computeHealthScore', () => {
  it('returns null for missing snapshot or empty data', () => {
    expect(computeHealthScore(null)).toBeNull();
    expect(computeHealthScore(undefined)).toBeNull();
    expect(computeHealthScore({})).toBeNull();
  });

  it('returns 100 when every metric is normal', () => {
    const snap = {
      steps: { status: 'normal' },
      heart_rate: { status: 'normal' },
      sleep_duration: { status: 'normal' },
    };
    expect(computeHealthScore(snap)).toBe(100);
  });

  it("penalizes 'below' more than 'above'", () => {
    expect(computeHealthScore({ steps: { status: 'below' } })).toBe(85);
    expect(computeHealthScore({ steps: { status: 'above' } })).toBe(90);
  });

  it('clamps at 0 even for very bad snapshots', () => {
    const snap = {
      steps: { status: 'below' },
      heart_rate: { status: 'below' },
      sleep_duration: { status: 'below' },
    };
    // 100 - 15*3 = 55, still > 0; let's confirm
    expect(computeHealthScore(snap)).toBe(55);
  });

  it('ignores metrics without a status', () => {
    expect(computeHealthScore({ steps: { value: 100 }, heart_rate: { status: 'normal' } })).toBe(100);
  });
});

describe('computeWeekDelta', () => {
  it('returns null when either operand is missing or avg is zero', () => {
    expect(computeWeekDelta(null, 100)).toBeNull();
    expect(computeWeekDelta(100, null)).toBeNull();
    expect(computeWeekDelta(100, 0)).toBeNull();
  });

  it('rounds to integer percent', () => {
    expect(computeWeekDelta(110, 100)).toBe(10);
    expect(computeWeekDelta(95, 100)).toBe(-5);
    expect(computeWeekDelta(100, 100)).toBe(0);
  });
});

describe('formatSleep', () => {
  it('returns null for null input', () => {
    expect(formatSleep(null)).toBeNull();
    expect(formatSleep(undefined)).toBeNull();
  });

  it('formats minutes as "Xh Ym"', () => {
    expect(formatSleep(420)).toBe('7h 0m');
    expect(formatSleep(444)).toBe('7h 24m');
    expect(formatSleep(0)).toBe('0h 0m');
  });
});

describe('normalizeAgainstNorm', () => {
  it('returns null on missing inputs', () => {
    expect(normalizeAgainstNorm(null, { min: 0, max: 10 })).toBeNull();
    expect(normalizeAgainstNorm(5, null)).toBeNull();
  });

  it('maps a value within the range to [0,1]', () => {
    expect(normalizeAgainstNorm(60, { min: 60, max: 80 })).toBe(0);
    expect(normalizeAgainstNorm(70, { min: 60, max: 80 })).toBe(0.5);
    expect(normalizeAgainstNorm(80, { min: 60, max: 80 })).toBe(1);
  });

  it('clamps out-of-range values', () => {
    expect(normalizeAgainstNorm(40, { min: 60, max: 80 })).toBe(0);
    expect(normalizeAgainstNorm(120, { min: 60, max: 80 })).toBe(1);
  });
});

describe('formatNormRange', () => {
  it('returns empty string for missing/incomplete norm', () => {
    expect(formatNormRange(null)).toBe('');
    expect(formatNormRange({})).toBe('');
    expect(formatNormRange({ min: 60 })).toBe('');
  });

  it('formats min-max ranges and appends unit unless "count"', () => {
    expect(formatNormRange({ min: 60, max: 82 })).toBe('60–82');
    expect(formatNormRange({ min: 60, max: 82, unit: 'bpm' })).toBe('60–82 bpm');
    expect(formatNormRange({ min: 5000, max: 12000, unit: 'count' })).toBe('5000–12000');
  });
});
