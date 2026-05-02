import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Home } from 'lucide-react';

export default function RouterErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  let title;
  let message;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message ?? t('errors.routeFailed');
  } else if (error instanceof Error) {
    title = t('errors.somethingBroke');
    message = error.message;
  } else {
    title = t('errors.somethingBroke');
    message = t('errors.unknown');
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-deep-700 dark:bg-deep-800">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <Link
          to="/admin/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-deep-700 shadow-pill transition-colors hover:bg-brand-400"
        >
          <Home className="h-4 w-4" />
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  );
}
