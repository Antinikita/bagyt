import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Inbox, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useAnamnesesList } from '../api/hooks/useAnamneses';
import { extractApiError } from '../api/axios-client';
import { getDateLocale } from '../lib/locale';

export default function Anamneses() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);

  const [page, setPage] = useState(1);
  const query = useAnamnesesList({ page, perPage: 20 });

  const items = query.data?.data ?? [];
  const meta = {
    current_page: query.data?.current_page ?? 1,
    last_page: query.data?.last_page ?? 1,
    total: query.data?.total ?? 0,
  };
  const loading = query.isLoading;
  const error = query.isError ? extractApiError(query.error, 'anamneses.failedLoadList') : '';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('anamneses.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('anamneses.subtitle')}
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-deep-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center dark:border-deep-700">
          <Inbox className="h-10 w-10 text-gray-300 dark:text-deep-600" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('anamneses.noneYet')}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('anamneses.generateFromChatHint')}
          </p>
          <Link
            to="/admin/chats"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-semibold text-deep-700 shadow-pill hover:bg-brand-400"
          >
            <Sparkles className="h-4 w-4" />
            {t('nav.chats')}
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/admin/anamneses/${a.id}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm dark:border-deep-700 dark:bg-deep-800 dark:hover:border-brand-700"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {a.chief_complaint || t('anamneses.untitled')}
                    </p>
                    {a.history_present_illness && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {a.history_present_illness}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      {formatDate(a.generated_at || a.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('chats.pageOf', { page: meta.current_page, total: meta.last_page })}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={meta.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> {t('common.previous')}
                </button>
                <button
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
                >
                  {t('common.next')} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
