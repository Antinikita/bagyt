import { motion, useReducedMotion } from 'framer-motion';
import {
  Heart,
  Moon,
  Footprints,
  Zap,
  User,
  AlertCircle,
  Sparkles,
  Clock,
} from 'lucide-react';

const PATIENT = {
  name: 'Alexander Peterson',
  meta: 'Patient · ID #10284',
  initials: 'AP',
  demographics: [
    { label: 'Gender', value: 'Male' },
    { label: 'Age', value: '34' },
    { label: 'Height', value: '182 cm' },
    { label: 'Weight', value: '78 kg' },
    { label: 'Blood', value: 'O+' },
  ],
};

const COMPLAINTS = [
  {
    text: 'Persistent headache',
    meta: 'Duration: 3 days',
    severity: 'Moderate',
    tone: 'amber',
  },
  {
    text: 'Fatigue and lack of sleep',
    meta: 'Daily, ongoing',
    severity: 'Mild',
    tone: 'emerald',
  },
  {
    text: 'Occasional lower back pain',
    meta: 'Triggered by posture',
    severity: 'Mild',
    tone: 'emerald',
  },
];

const SEVERITY_CLASS = {
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

const METRICS = [
  {
    icon: Heart,
    label: 'Heart rate',
    value: '72',
    unit: 'bpm',
    tint: 'text-red-500 bg-red-50 dark:bg-deep-700',
    stroke: '#ef4444',
    points: [8, 14, 6, 16, 5, 17, 7, 15, 9, 12, 8, 14],
  },
  {
    icon: Moon,
    label: 'Sleep',
    value: '6.5',
    unit: 'h',
    tint: 'text-brand-700 bg-brand-50 dark:bg-deep-700 dark:text-brand-300',
    stroke: '#0abba5',
    points: [13, 12, 14, 13, 11, 10, 12, 13, 11, 12, 13, 12],
  },
  {
    icon: Footprints,
    label: 'Steps',
    value: '8,240',
    unit: '',
    tint: 'text-emerald-600 bg-emerald-50 dark:bg-deep-700',
    stroke: '#10b981',
    points: [17, 15, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4],
  },
  {
    icon: Zap,
    label: 'Stress',
    value: 'Medium',
    unit: '',
    tint: 'text-amber-600 bg-amber-50 dark:bg-deep-700',
    stroke: '#f59e0b',
    points: [14, 10, 13, 8, 12, 9, 11, 8, 13, 10, 12, 11],
  },
];

function Sparkline({ points, stroke }) {
  const w = 72;
  const h = 22;
  const step = w / (points.length - 1);
  const d = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-white/50 bg-white/70 shadow-sm backdrop-blur-xl supports-[not(backdrop-filter:blur(0))]:bg-white dark:border-white/10 dark:bg-deep-800/60 dark:supports-[not(backdrop-filter:blur(0))]:bg-deep-800 ${className}`}
    >
      {children}
    </div>
  );
}

export default function DashboardPreview() {
  const prefersReduced = useReducedMotion();
  const fade = (delay = 0) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: 'easeOut', delay },
        };

  return (
    <div className="space-y-4" aria-label="Patient dashboard preview">
      <motion.div {...fade(0)}>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-pill text-deep-700 shadow-pill font-semibold"
            >
              {PATIENT.initials}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="t-h3 truncate">{PATIENT.name}</h3>
              <p className="t-hint mt-0.5">{PATIENT.meta}</p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
              <User className="h-4 w-4" />
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-5 gap-2">
            {PATIENT.demographics.map((d) => (
              <div
                key={d.label}
                className="rounded-xl border border-gray-200/70 bg-white/60 p-2 text-center dark:border-deep-700 dark:bg-deep-900/60"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {d.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </motion.div>

      <motion.div {...fade(0.06)}>
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </span>
            <h3 className="t-h3">Active complaints</h3>
          </div>
          <ul className="space-y-2">
            {COMPLAINTS.map((c) => (
              <li
                key={c.text}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2 dark:border-deep-700 dark:bg-deep-900/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {c.text}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{c.meta}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_CLASS[c.tone]}`}
                >
                  {c.severity}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              {...fade(0.12 + i * 0.05)}
              className="group rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand supports-[not(backdrop-filter:blur(0))]:bg-white dark:border-white/10 dark:bg-deep-800/60 dark:supports-[not(backdrop-filter:blur(0))]:bg-deep-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${m.tint}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="t-section">{m.label}</p>
                </div>
                <Sparkline points={m.points} stroke={m.stroke} />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {m.value}
                </span>
                {m.unit && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{m.unit}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div {...fade(0.34)}>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="t-h3">Last AI consultation</h3>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />2 h ago
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Recommended 8 hours of sleep and consistent hydration based on the recent headache
                complaints.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
