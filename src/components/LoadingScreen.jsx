import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-deep-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    </div>
  );
}
