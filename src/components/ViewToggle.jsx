import { motion } from 'framer-motion';

const OPTIONS = [
  { value: 'chat', label: 'Chat' },
  { value: 'dashboard', label: 'Dashboard' },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Preview view"
      className="
        inline-flex items-center gap-0 rounded-full border border-gray-200/70 bg-white/70 p-1
        shadow-[0_4px_12px_-4px_rgba(16,54,72,0.12)] backdrop-blur-md
        dark:border-white/10 dark:bg-deep-800/60
      "
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative z-[1] inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
              active
                ? 'text-deep-700'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId="viewTogglePill"
                aria-hidden="true"
                className="absolute inset-0 -z-[1] rounded-full bg-grad-pill shadow-pill"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
