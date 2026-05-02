import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useHealthMetrics, usePostHealthMetrics, useHealthNorms } from '../api/hooks/useHealth';
import { extractApiError } from '../api/axios-client';
import { getDateLocale } from '../lib/locale';
import HealthHeroCard from '../components/health/HealthHeroCard';
import InsightsCard from '../components/health/InsightsCard';
import ComparisonBars from '../components/health/ComparisonBars';
import MetricAreaChart from '../components/charts/MetricAreaChart';

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
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <HealthHeroCard />
      <InsightsCard />
      <TrendsSection />
      <ComparisonBars />
      <ManualEntryDisclosure />
      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
        {t('health.educationalDisclaimer')}
      </p>
    </div>
  );
}

function TrendsSection() {
  const { t } = useTranslation();
  const { data: normsData } = useHealthNorms();
  const norms = normsData?.norms ?? {};

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('health.trends')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('health.last30Days')}</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard label={t('health.types.steps')}>
          <MetricAreaChart type="steps" norm={norms.steps} unitSuffix="" color="#14b8a6" />
        </ChartCard>
        <ChartCard label={t('health.types.heart_rate')}>
          <MetricAreaChart type="heart_rate" norm={norms.heart_rate} unitSuffix={t('health.bpm')} color="#f43f5e" />
        </ChartCard>
        <ChartCard label={t('health.types.sleep_duration')} className="lg:col-span-2">
          <MetricAreaChart type="sleep_duration" norm={norms.sleep_duration} unitSuffix="min" color="#6366f1" />
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

function ManualEntryDisclosure() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.resolvedLanguage);

  const [open, setOpen] = useState(false);
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
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('health.addManually')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('health.addManuallyHint')}
          </p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-gray-400" />
          : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-5 dark:border-deep-700">
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

          <div className="mt-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('health.recentMetrics')}
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
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
          </div>
        </div>
      )}
    </section>
  );
}
