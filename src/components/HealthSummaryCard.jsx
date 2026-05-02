import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Heart, Moon, Footprints } from 'lucide-react';
import { useHealthSummary } from '../api/hooks/useHealth';

const STATUS_STYLES = {
  below: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  above: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  if (!status) return null;
  const tone = STATUS_STYLES[status] ?? STATUS_STYLES.normal;
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      {t(`health.status${status[0].toUpperCase()}${status.slice(1)}`)}
    </span>
  );
}

function StatTile({ icon: Icon, label, value, unit, tint, status }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-deep-700 dark:bg-deep-800">
      <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <StatusBadge status={status} />
        </div>
        <p className="mt-0.5 truncate text-base font-semibold text-gray-900 dark:text-white">
          {value === null || value === undefined ? '—' : value}
          {unit && value !== null && value !== undefined && (
            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function formatSleep(minutes) {
  if (minutes === null || minutes === undefined) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

export default function HealthSummaryCard() {
  const { t } = useTranslation();
  const { data: summary, isLoading: loading, isError: errored } = useHealthSummary();

  // New summary shape: { date, steps: {value,unit,status}|null, heart_rate: ..., sleep_duration: ... }
  const steps = summary?.steps ?? null;
  const heartRate = summary?.heart_rate ?? null;
  const sleep = summary?.sleep_duration ?? null;

  const isEmpty = !loading && !errored && summary && !steps && !heartRate && !sleep;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-deep-700 dark:text-rose-300">
            <Activity className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('health.summaryTitle')}
          </h2>
        </div>
        <Link
          to="/admin/health"
          className="text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {t('health.viewTrends')}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-deep-700/50" />
          ))}
        </div>
      ) : errored ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('health.loadFailed')}</p>
      ) : isEmpty ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center dark:border-deep-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('health.empty')}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('health.connectIos')}</p>
          <Link
            to="/admin/health"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-deep-700 shadow-pill transition-colors hover:bg-brand-400"
          >
            {t('health.addManually')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile
            icon={Footprints}
            label={t('health.steps')}
            value={steps ? Math.round(steps.value).toLocaleString() : null}
            status={steps?.status}
            tint="bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300"
          />
          <StatTile
            icon={Heart}
            label={t('health.avgHeartRate')}
            value={heartRate ? Math.round(heartRate.value) : null}
            unit={t('health.bpm')}
            status={heartRate?.status}
            tint="bg-rose-50 text-rose-700 dark:bg-deep-700 dark:text-rose-300"
          />
          <StatTile
            icon={Moon}
            label={t('health.sleep')}
            value={sleep ? formatSleep(sleep.value) : null}
            status={sleep?.status}
            tint="bg-indigo-50 text-indigo-700 dark:bg-deep-700 dark:text-indigo-300"
          />
        </div>
      )}
    </div>
  );
}
