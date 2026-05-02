import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Loader2 } from 'lucide-react';
import { useSearchChats } from '../api/hooks/useSearch';
import useDebouncedValue from '../lib/useDebouncedValue';
import { extractApiError } from '../api/axios-client';

const MODES = ['hybrid', 'semantic', 'text'];

export default function SearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('hybrid');
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQ = useDebouncedValue(q, 300);
  const query = useSearchChats(debouncedQ, mode, 8);

  const results = query.data?.results ?? [];
  const loading = query.isFetching;
  const error = query.isError ? extractApiError(query.error, 'search.failed') : '';

  // Close popover on outside click.
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const onSelect = (chatId) => {
    setOpen(false);
    setQ('');
    navigate(`/admin/chats/${chatId}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-deep-700 dark:bg-deep-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-brand-900"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {open && (q.trim() || error) && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-deep-700 dark:bg-deep-800">
          {error && (
            <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</div>
          )}
          {!error && !loading && results.length === 0 && debouncedQ.trim() && (
            <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{t('search.empty')}</div>
          )}
          <ul>
            {results.map((r) => (
              <li key={r.message_id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.chat_id)}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-deep-700"
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {r.chat_title || t('common.untitled')}
                  </div>
                  <div className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {r.snippet}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 px-3 py-2 text-[11px] dark:border-deep-700">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showAdvanced ? t('search.hideAdvanced') : t('search.advanced')}
            </button>
            {showAdvanced && (
              <div className="mt-1 flex gap-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      mode === m
                        ? 'bg-brand-500 text-deep-900 dark:text-white'
                        : 'bg-gray-100 text-gray-600 dark:bg-deep-700 dark:text-gray-300'
                    }`}
                  >
                    {t(`search.mode_${m}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
