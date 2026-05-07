import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Monitor, Trash2, Loader2 } from 'lucide-react';
import { listTokens, revokeToken } from '../../api/auth';
import { extractApiError } from '../../api/axios-client';
import { getDateLocale } from '../../lib/locale';
import Button from '../ui/Button';

const sessionsKey = ['tokens'];

function formatRelative(value, locale) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ActiveSessionsCard() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);
  const qc = useQueryClient();

  const [error, setError] = useState('');

  const tokensQuery = useQuery({
    queryKey: sessionsKey,
    queryFn: listTokens,
    staleTime: 0,
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => revokeToken(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey }),
    onError: (err) => setError(extractApiError(err, 'profile.sessionRevokeFailed')),
  });

  const tokens = tokensQuery.data?.tokens ?? [];

  if (tokensQuery.isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
        <header className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
            <Monitor className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.activeSessions')}
          </h2>
        </header>
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
      </section>
    );
  }

  if (tokensQuery.isError) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
        <header className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
            <Monitor className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('profile.activeSessions')}
          </h2>
        </header>
        <p className="text-sm text-red-700 dark:text-red-300">
          {extractApiError(tokensQuery.error, 'profile.sessionsLoadFailed')}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-deep-700 dark:bg-deep-800">
      <header className="mb-4 flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
          <Monitor className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('profile.activeSessions')}
        </h2>
      </header>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        {t('profile.activeSessionsDesc')}
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {tokens.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.noSessions')}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-deep-700/70">
          {tokens.map((tk) => (
            <li key={tk.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {tk.name || t('profile.tokenName')}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {tk.last_used_at
                    ? `${t('profile.lastUsed')}: ${formatRelative(tk.last_used_at, locale)}`
                    : t('profile.neverUsed')}
                  {' · '}
                  {t('profile.createdOn')}: {formatRelative(tk.created_at, locale) ?? '—'}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setError('');
                  revokeMutation.mutate(tk.id);
                }}
                disabled={revokeMutation.isPending}
                aria-label={t('profile.revokeSession')}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  {t('profile.revokeSession')}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
