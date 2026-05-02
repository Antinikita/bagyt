/**
 * Pure helpers for the health UI. No imports from React or Recharts —
 * easy to unit-test and reuse across components.
 */

const STATUS_PENALTY = { below: 15, above: 10 };

/**
 * Health score 0-100. 100 base, minus penalties when a metric falls
 * outside the user's age/sex norm. Anything not 'normal' shaves points;
 * 'below' (e.g., not enough sleep) costs more than 'above'.
 */
export function computeHealthScore(snapshot) {
  if (!snapshot) return null;
  const types = ['steps', 'heart_rate', 'sleep_duration'];
  const scored = types.filter((t) => snapshot[t]?.status);
  if (scored.length === 0) return null;

  const penalty = scored.reduce(
    (sum, t) => sum + (STATUS_PENALTY[snapshot[t].status] ?? 0),
    0,
  );
  return Math.max(0, 100 - penalty);
}

/**
 * Week-over-week percentage delta. Returns null when the avg or value
 * is missing so callers can render an em-dash instead of 'NaN%'.
 */
export function computeWeekDelta(value, avg7d) {
  if (value == null || avg7d == null || avg7d === 0) return null;
  return Math.round(((value - avg7d) / avg7d) * 100);
}

/** "7h 24m" from minutes. Null-safe. */
export function formatSleep(minutes) {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

/**
 * Maps a value into a 0-1 scale relative to the user's norm range.
 * Used by ComparisonBars to position the user's marker on a bar.
 *
 * For range-style norms (heart_rate, sleep): clamps to [min, max].
 * For target-style norms (steps): scales against [low, high].
 */
export function normalizeAgainstNorm(value, norm) {
  if (value == null || !norm) return null;

  const lo = norm.min ?? norm.low ?? 0;
  const hi = norm.max ?? norm.high ?? norm.target ?? lo + 1;
  const span = hi - lo;
  if (span <= 0) return 0.5;

  return Math.max(0, Math.min(1, (value - lo) / span));
}

/**
 * Human-readable summary of the user's norm range.
 *   steps:     "5000–12000"
 *   heart:     "60–82 bpm"
 *   sleep:     "420–540 min"
 */
export function formatNormRange(norm) {
  if (!norm) return '';
  const lo = norm.min ?? norm.low;
  const hi = norm.max ?? norm.high;
  if (lo == null || hi == null) return '';
  const unitTxt = norm.unit && norm.unit !== 'count' ? ` ${norm.unit}` : '';
  return `${Math.round(lo)}–${Math.round(hi)}${unitTxt}`;
}
