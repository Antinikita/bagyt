import { useTranslation } from 'react-i18next';
import { Footprints, Heart, Moon } from 'lucide-react';
import { useHealthSummary, useHealthNorms } from '../../api/hooks/useHealth';
import { normalizeAgainstNorm, formatNormRange, formatSleep } from '../../lib/health';

const ROW_CONFIG = {
  steps: { icon: Footprints, color: 'bg-brand-500' },
  heart_rate: { icon: Heart, color: 'bg-rose-500' },
  sleep_duration: { icon: Moon, color: 'bg-indigo-500' },
};

function ComparisonRow({ type, value, norm, formatValue, formatNorm }) {
  const { t } = useTranslation();
  const cfg = ROW_CONFIG[type];
  const position = normalizeAgainstNorm(value, norm);

  // Norm zone (the "typical" range) is always the middle 60% of the bar
  // when shown against [low, high] for steps, or [min, max] for ranges.
  // For target-style norms (steps), highlight from low → high. For
  // range-style norms (HR, sleep), low/high == min/max so it's the
  // entire bar — highlight the middle 70%.
  const isTargetStyle = norm?.target != null;
  const zoneStart = isTargetStyle ? 0 : 0.15;
  const zoneEnd = isTargetStyle ? 1 : 0.85;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <cfg.icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {t(`health.types.${type}`)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{formatValue}</span>
          <span className="text-[11px]">{formatNorm}</span>
        </div>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-deep-700">
        {/* Norm zone — tinted band */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 bg-emerald-200/60 dark:bg-emerald-700/40"
          style={{ left: `${zoneStart * 100}%`, right: `${(1 - zoneEnd) * 100}%` }}
        />
        {/* User's marker */}
        {position != null && (
          <div
            aria-hidden="true"
            className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow dark:ring-deep-800 ${cfg.color}`}
            style={{ left: `${position * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

export default function ComparisonBars() {
  const { t } = useTranslation();
  const { data: summary } = useHealthSummary();
  const { data: normsData } = useHealthNorms();
  const norms = normsData?.norms ?? {};
  const userMeta = normsData?.user;

  const rows = [
    {
      type: 'steps',
      value: summary?.steps?.value,
      norm: norms.steps,
      formatValue: summary?.steps?.value != null ? Math.round(summary.steps.value).toLocaleString() : '—',
      formatNorm: norms.steps ? `${(norms.steps.target ?? 0).toLocaleString()} ${t('health.target').toLowerCase()}` : '',
    },
    {
      type: 'heart_rate',
      value: summary?.heart_rate?.value,
      norm: norms.heart_rate,
      formatValue: summary?.heart_rate?.value != null ? `${Math.round(summary.heart_rate.value)} ${t('health.bpm')}` : '—',
      formatNorm: formatNormRange(norms.heart_rate),
    },
    {
      type: 'sleep_duration',
      value: summary?.sleep_duration?.value,
      norm: norms.sleep_duration,
      formatValue: summary?.sleep_duration?.value != null ? formatSleep(summary.sleep_duration.value) : '—',
      formatNorm: norms.sleep_duration
        ? `${Math.round((norms.sleep_duration.min ?? 0) / 60)}–${Math.round((norms.sleep_duration.max ?? 0) / 60)}h`
        : '',
    },
  ];

  if (!normsData) {
    return <div className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-deep-700/40" />;
  }

  const profile = userMeta?.age && userMeta?.sex
    ? t('health.youVs', {
      age: userMeta.age,
      sex: t(`profile.${userMeta.sex}`, { defaultValue: userMeta.sex }),
    })
    : t('health.youVsAdult');

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{profile}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('health.comparisonSubtitle')}
        </p>
      </header>

      <div className="space-y-4">
        {rows.map((r) => (
          <ComparisonRow key={r.type} {...r} />
        ))}
      </div>

      <p className="mt-5 text-[11px] text-gray-400 dark:text-gray-500">
        {t('health.educationalDisclaimer')}
      </p>
    </section>
  );
}
