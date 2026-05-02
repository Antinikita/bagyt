import { useTranslation } from 'react-i18next';

/**
 * Loading spinner. Two modes:
 * - fullscreen=true (default) for root-level auth bootstrapping
 * - fullscreen=false for in-layout Suspense fallbacks (sits inside <main>,
 *   doesn't double-stack 100vh on top of the header)
 */
export default function LoadingScreen({ fullscreen = true }) {
  const { t } = useTranslation();
  const wrapperClass = fullscreen
    ? 'flex h-full min-h-[60vh] items-center justify-center bg-gray-50 dark:bg-deep-900'
    : 'flex min-h-[40vh] items-center justify-center';
  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    </div>
  );
}
