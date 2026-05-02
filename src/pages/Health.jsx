import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Plus, Loader2, TrendingUp } from 'lucide-react';
import { useHealthMetrics, usePostHealthMetrics, useHealthNorms } from '../api/hooks/useHealth';
import { extractApiError } from '../api/axios-client';
import { getDateLocale } from '../lib/locale';
import MetricTrendChart from '../components/charts/MetricTrendChart';

const TYPE_OPTIONS = [
  { value: 'steps', unit: 'count' },
  { value: 'heart_rate', unit: 'bpm' },
  { value: 'sleep_duration', unit: 'minutes' },
];

function nowLocalISOString() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Health() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.resolvedLanguage);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [type, setType] = useState('steps');
  const [value, setValue] = useState('');
  const [recordedAt, setRecordedAt] = useState(nowLocalISOString());

  const selectedType = TYPE_OPTIONS.find((o) => o.value === type) ?? TYPE_OPTIONS[0];

  const metricsQuery = useHealthMetrics({ limit: 50 });
  const postMutation = usePostHealthMetrics();

  const metrics = metricsQuery.data?.metrics ?? [];
  const loading = metricsQuery.isLoading;
  const submitting = postMutation.isPending;
  const queryError = metricsQuery.isError
    ? extractApiError(metricsQuery.error, 'health.loadFailed')
    : '';
  const displayError = error || queryError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      setError(t('health.invalidValue'));
      return;
    }
    try {
      await postMutation.mutateAsync([{
        type,
        value: numeric,
        unit: selectedType.unit,
        recorded_at: new Date(recordedAt).toISOString(),
        source: 'manual',
      }]);
      setSuccess(t('health.submitOk'));
      setValue('');
    } catch (err) {
      setError(extractApiError(err, 'health.submitFailed'));
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-deep-700 dark:text-rose-300">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('health.pageTitle')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('health.pageSubtitle')}</p>
        </div>
      </header>

      <TrendsSection />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('health.manualEntry')}
        </h2>

        {displayError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {displayError}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
              {t('health.type')}
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-deep-700 dark:bg-deep-800 dark:text-white"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(`health.types.${o.value}`)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
              {t('health.value')} <span className="text-gray-400">({selectedType.unit})</span>
            </span>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-deep-700 dark:bg-deep-800 dark:text-white"
            />
          </label>
          <label className="text-sm sm:col-span-1">
            <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
              {t('health.recordedAt')}
            </span>
            <input
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-deep-700 dark:bg-deep-800 dark:text-white"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-deep-700 shadow-pill transition-colors hover:bg-brand-400 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t('health.add')}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('health.recentMetrics')}
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-deep-700/50" />
            ))}
          </div>
        ) : metrics.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('health.noMetricsYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-2">{t('health.type')}</th>
                  <th className="px-2 py-2">{t('health.value')}</th>
                  <th className="px-2 py-2">{t('health.recordedAt')}</th>
                  <th className="px-2 py-2">{t('health.source')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-deep-700">
                {metrics.map((m, i) => (
                  <tr key={`${m.recorded_at}-${i}`} className="text-gray-800 dark:text-gray-200">
                    <td className="px-2 py-2">
                      {t(`health.types.${m.type}`, { defaultValue: m.type })}
                    </td>
                    <td className="px-2 py-2">
                      {m.value}
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{m.unit}</span>
                    </td>
                    <td className="px-2 py-2 text-gray-600 dark:text-gray-400">
                      {new Date(m.recorded_at).toLocaleString(dateLocale, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-2 py-2 text-gray-500 dark:text-gray-400">{m.source ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function TrendsSection() {
  const { t } = useTranslation();
  const { data: normsData } = useHealthNorms();
  const norms = normsData?.norms ?? {};
  const userMeta = normsData?.user;

  const ageSexLabel = userMeta?.age && userMeta?.sex
    ? `${userMeta.age} ${t(`profile.${userMeta.sex}`, { defaultValue: userMeta.sex })}`
    : '';

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('health.trends')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('health.last30Days')}
              {ageSexLabel && ` · ${t('health.normFor', { profile: ageSexLabel })}`}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard label={t('health.types.steps')}>
          <MetricTrendChart type="steps" norm={norms.steps} unitSuffix={t('health.steps').toLowerCase()} />
        </ChartCard>
        <ChartCard label={t('health.types.heart_rate')}>
          <MetricTrendChart
            type="heart_rate"
            norm={norms.heart_rate}
            unitSuffix={t('health.bpm')}
            color="#f43f5e"
          />
        </ChartCard>
        <ChartCard label={t('health.types.sleep_duration')} className="lg:col-span-2">
          <MetricTrendChart
            type="sleep_duration"
            norm={norms.sleep_duration}
            unitSuffix="min"
            color="#6366f1"
          />
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ label, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50/40 p-4 dark:border-deep-700 dark:bg-deep-700/30 ${className}`}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      {children}
    </div>
  );
}
