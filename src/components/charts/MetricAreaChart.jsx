import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { useHealthMetrics } from '../../api/hooks/useHealth';
import { getDateLocale } from '../../lib/locale';

/**
 * Editorial-premium replacement for MetricTrendChart.
 *
 * Visual upgrade: AreaChart with gradient fill instead of a bare line,
 * the user's norm band drawn behind the area as a tinted ReferenceArea,
 * a target line dashed across the chart for steps. Same data contract
 * as before — fetches via useHealthMetrics, takes a `norm` prop from
 * the parent (already cached via useHealthNorms across all charts).
 */
export default function MetricAreaChart({
  type,
  norm,
  days = 30,
  unitSuffix = '',
  color = '#14b8a6',
}) {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.resolvedLanguage);

  const { from, to } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  }, [days]);

  const query = useHealthMetrics({ type, from, to, limit: 100 });
  const rawMetrics = query.data?.metrics ?? [];

  const data = useMemo(() => {
    return [...rawMetrics]
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
      .map((m) => ({
        date: m.recorded_at.slice(0, 10),
        value: m.value,
      }));
  }, [rawMetrics]);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  const allYValues = [
    ...data.map((d) => d.value),
    norm?.min, norm?.max, norm?.low, norm?.high, norm?.target,
  ].filter((n) => Number.isFinite(n));
  const yMin = allYValues.length ? Math.max(0, Math.floor(Math.min(...allYValues) * 0.85)) : 0;
  const yMax = allYValues.length ? Math.ceil(Math.max(...allYValues) * 1.15) : 100;

  const bandLow = norm?.min ?? norm?.low ?? null;
  const bandHigh = norm?.max ?? norm?.high ?? null;
  const targetLine = norm?.target ?? norm?.avg ?? null;
  const gradientId = `area-grad-${type}`;

  if (query.isLoading) {
    return <div className="h-56 animate-pulse rounded-xl bg-gray-100 dark:bg-deep-700/40" />;
  }

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 dark:border-deep-700 dark:text-gray-400">
        {t('health.noTrendData')}
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="80%" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-deep-700" />
          {bandLow !== null && bandHigh !== null && (
            <ReferenceArea
              y1={bandLow}
              y2={bandHigh}
              fill={color}
              fillOpacity={0.06}
              stroke={color}
              strokeOpacity={0.18}
              strokeDasharray="3 3"
              ifOverflow="visible"
              label={{
                value: t('health.normRange'),
                position: 'insideTopRight',
                fontSize: 10,
                fill: color,
                fillOpacity: 0.8,
              }}
            />
          )}
          {targetLine !== null && (
            <ReferenceLine
              y={targetLine}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{ value: t('health.target'), position: 'right', fontSize: 10, fill: color }}
            />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
            width={40}
          />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value) => [`${value}${unitSuffix ? ' ' + unitSuffix : ''}`, t(`health.types.${type}`)]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 2.5, strokeWidth: 0, fill: color }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
