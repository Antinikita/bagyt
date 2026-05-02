import { useTranslation } from 'react-i18next';
import { Lightbulb, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { computeWeekDelta } from '../../lib/health';
import { useHealthSummary, useHealthMetrics } from '../../api/hooks/useHealth';

/**
 * Compact list of derived insights about the user's recent health data.
 *
 * Insights are generated from:
 *  - today's value vs the user's norm range  (status: below/normal/above)
 *  - today's value vs the 7-day rolling average  (week-over-week delta)
 *  - 7-day average stability for "steady" framing
 *
 * Limited to 3 most useful messages, sorted with concerning ones first.
 * Empty when there's no data — the parent decides whether to render the
 * card at all or to show an empty placeholder.
 */
export default function InsightsCard() {
  const { t } = useTranslation();
  const { data: summary } = useHealthSummary();

  // 7-day window for week-over-week deltas. Cheap because TanStack Query
  // dedupes with the chart's identical request.
  const from = new Date();
  from.setDate(from.getDate() - 6);
  const to = new Date();
  const stepsQuery = useHealthMetrics({
    type: 'steps',
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    limit: 30,
  });
  const sleepQuery = useHealthMetrics({
    type: 'sleep_duration',
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    limit: 30,
  });
  const hrQuery = useHealthMetrics({
    type: 'heart_rate',
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    limit: 30,
  });

  const insights = buildInsights({
    summary,
    stepsSeries: stepsQuery.data?.metrics ?? [],
    hrSeries: hrQuery.data?.metrics ?? [],
    sleepSeries: sleepQuery.data?.metrics ?? [],
    t,
  });

  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <Lightbulb className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('health.insights')}
        </h2>
      </header>

      <ul className="space-y-2.5">
        {insights.map((ins, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${ins.tint}`}>
              <ins.icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              {ins.text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function buildInsights({ summary, stepsSeries, hrSeries, sleepSeries, t }) {
  const out = [];
  if (!summary) return out;

  const seriesAvg = (rows) => {
    if (!rows.length) return null;
    const sum = rows.reduce((acc, r) => acc + r.value, 0);
    return sum / rows.length;
  };

  const stepsAvg = seriesAvg(stepsSeries);
  const stepsDelta = summary.steps ? computeWeekDelta(summary.steps.value, stepsAvg) : null;

  const sleepAvg = seriesAvg(sleepSeries);
  const sleepDelta = summary.sleep_duration ? computeWeekDelta(summary.sleep_duration.value, sleepAvg) : null;

  const hrAvg = seriesAvg(hrSeries);

  // Status-driven insights first — concerning > positive > neutral.
  const order = ['below', 'above', 'normal'];

  for (const type of ['sleep_duration', 'steps', 'heart_rate']) {
    const m = summary[type];
    if (!m?.status) continue;
    const labelKey = `health.types.${type}`;
    if (m.status === 'below') {
      out.push({
        priority: order.indexOf('below'),
        icon: TrendingDown,
        tint: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        text: t('health.insightBelow', { metric: t(labelKey) }),
      });
    } else if (m.status === 'above') {
      out.push({
        priority: order.indexOf('above'),
        icon: TrendingUp,
        tint: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        text: t('health.insightAbove', { metric: t(labelKey) }),
      });
    } else if (m.status === 'normal') {
      out.push({
        priority: order.indexOf('normal'),
        icon: Minus,
        tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        text: t('health.insightNormal', { metric: t(labelKey) }),
      });
    }
  }

  // Week-over-week delta for steps if we have 3+ days of data.
  if (stepsDelta != null && stepsSeries.length >= 3 && Math.abs(stepsDelta) >= 5) {
    out.push({
      priority: stepsDelta < 0 ? 0.5 : 1.5,
      icon: stepsDelta < 0 ? TrendingDown : TrendingUp,
      tint: stepsDelta < 0
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      text: t('health.insightStepsWeek', { delta: Math.abs(stepsDelta), dir: stepsDelta < 0 ? t('health.trendDown') : t('health.trendUp') }),
    });
  }

  if (sleepDelta != null && sleepSeries.length >= 3 && Math.abs(sleepDelta) >= 5) {
    out.push({
      priority: sleepDelta < 0 ? 0.5 : 1.5,
      icon: sleepDelta < 0 ? TrendingDown : TrendingUp,
      tint: sleepDelta < 0
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      text: t('health.insightSleepWeek', { delta: Math.abs(sleepDelta), dir: sleepDelta < 0 ? t('health.trendDown') : t('health.trendUp') }),
    });
  }

  if (hrAvg != null && hrSeries.length >= 5 && summary.heart_rate?.status === 'normal') {
    out.push({
      priority: 2,
      icon: Minus,
      tint: 'bg-gray-50 text-gray-600 dark:bg-deep-700 dark:text-gray-300',
      text: t('health.insightHrSteady'),
    });
  }

  out.sort((a, b) => a.priority - b.priority);
  return out.slice(0, 3);
}
