import { useTranslation } from 'react-i18next';

export function scorePassword(pw) {
  if (!pw) return 0;
  const length = pw.length;
  const classes =
    (/[a-z]/.test(pw) ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);

  if (length < 6) return 1;
  if (length < 8 || classes < 2) return 2;
  if (length < 12 || classes < 3) return 3;
  return 4;
}

const STRENGTH_KEYS = ['empty', 'weak', 'fair', 'good', 'strong'];
const BAR_CLASSES = [
  '',
  'bg-red-500 dark:bg-red-500',
  'bg-amber-500 dark:bg-amber-400',
  'bg-lime-500 dark:bg-lime-400',
  'bg-emerald-500 dark:bg-emerald-400',
];
const TEXT_CLASSES = [
  'text-gray-500 dark:text-gray-400',
  'text-red-600 dark:text-red-400',
  'text-amber-700 dark:text-amber-400',
  'text-lime-700 dark:text-lime-400',
  'text-emerald-700 dark:text-emerald-400',
];

export default function PasswordStrengthMeter({ password, id }) {
  const { t } = useTranslation();
  const score = scorePassword(password);
  const label = t(`strength.${STRENGTH_KEYS[score]}`);

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-labelledby={id}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
              i <= score ? BAR_CLASSES[score] : 'bg-gray-200 dark:bg-gray-800'
            }`}
          />
        ))}
      </div>
      <p id={id} className={`mt-1 text-xs ${TEXT_CLASSES[score]}`}>
        {label}
      </p>
    </div>
  );
}
