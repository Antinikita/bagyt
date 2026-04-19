import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Sparkles, FileText } from 'lucide-react';

export default function AuthSidePanel() {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const heading = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' },
      };
  const sub = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut', delay: 0.08 },
      };

  const features = [
    { icon: MessageSquare, key: 'streamingChat' },
    { icon: Sparkles, key: 'aiAssistant' },
    { icon: FileText, key: 'anamnesisGeneration' },
  ];

  return (
    <div className="w-full max-w-xl space-y-6 px-4">
      <div>
        <motion.p {...sub} className="t-section mb-3">
          {t('preview.heroTagline')}
        </motion.p>
        <motion.h2 {...heading} className="t-display text-[32px] leading-[1.1] sm:text-[36px]">
          {t('preview.heroHeading')}
        </motion.h2>
        <motion.p {...sub} className="mt-3 text-base text-gray-600 dark:text-gray-300">
          {t('preview.heroSubheading')}
        </motion.p>
      </div>

      <motion.ul {...sub} className="space-y-3">
        {features.map(({ icon: Icon, key }) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/60 p-4 backdrop-blur-sm dark:border-deep-700 dark:bg-deep-800/60"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t(`preview.${key}Title`)}
              </p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                {t(`preview.${key}Desc`)}
              </p>
            </div>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
