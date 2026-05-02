import { useTranslation } from 'react-i18next';
import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Footprints, Heart, Moon } from 'lucide-react';
import { computeHealthScore, formatSleep } from '../../lib/health';
import { useHealthSummary } from '../../api/hooks/useHealth';

const STATUS_TONE = {
  below: 'text-amber-700 dark:text-amber-300',
  normal: 'text-emerald-700 dark:text-emerald-300',
  above: 'text-sky-700 dark:text-sky-300',
};

const STATUS_DOT = {
  below: 'bg-amber-500',
  normal: 'bg-emerald-500',
  above: 'bg-sky-500',
};

function StatLine({ icon: Icon, label, value, unit, status, t }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 last:border-b-0 dark:border-deep-700/60">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-500 dark:bg-deep-700 dark:text-gray-300">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="truncate text-sm text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {value ?? '—'}
          {unit && value != null && (
            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">{unit}</span>
          )}
        </span>
        {status && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${STATUS_TONE[status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {t(`health.status${status[0].toUpperCase()}${status.slice(1)}`)}
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score, t }) {
  if (score == null) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-gray-200 dark:border-deep-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">—</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {t('health.healthScore')}
          </p>
        </div>
      </div>
    );
  }

  const data = [{ name: 'score', value: score, fill: '#14b8a6' }];

  return (
    <div className="relative h-32 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="75%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: 'rgba(148, 163, 184, 0.18)' }}
            dataKey="value"
            cornerRadius={8}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{score}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {t('health.scoreOf', { total: 100 })}
        </p>
      </div>
    </div>
  );
}

export default function HealthHeroCard() {
  const { t, i18n } = useTranslation();
  const { data: summary, isLoading } = useHealthSummary();

  const today = new Date().toLocaleDateString(i18n.resolvedLanguage, {
    month: 'long', day: 'numeric',
  });

  const steps = summary?.steps ?? null;
  const heartRate = summary?.heart_rate ?? null;
  const sleep = summary?.sleep_duration ?? null;
  const score = computeHealthScore(summary);

  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-deep-700/40" />;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-brand-50/40 p-6 shadow-sm dark:border-deep-700 dark:from-deep-800 dark:to-deep-900">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-800/20" />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
          {t('health.summaryTitle')}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {today}
        </h1>

        <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <ScoreRing score={score} t={t} />
          <div className="min-w-0 flex-1">
            <StatLine
              icon={Footprints}
              label={t('health.steps')}
              value={steps ? Math.round(steps.value).toLocaleString() : null}
              status={steps?.status}
              t={t}
            />
            <StatLine
              icon={Heart}
              label={t('health.avgHeartRate')}
              value={heartRate ? Math.round(heartRate.value) : null}
              unit={t('health.bpm')}
              status={heartRate?.status}
              t={t}
            />
            <StatLine
              icon={Moon}
              label={t('health.sleep')}
              value={sleep ? formatSleep(sleep.value) : null}
              status={sleep?.status}
              t={t}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
