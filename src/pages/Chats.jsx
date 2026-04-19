import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MessageSquare, Trash2, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { listChats, createChat, deleteChat } from '../api/chats';
import { getDateLocale } from '../lib/locale';
import Button from '../components/ui/Button';

export default function Chats() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.resolvedLanguage);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchChats = useCallback(async (searchQuery, pageNum) => {
    setLoading(true);
    setError('');
    try {
      const data = await listChats({ q: searchQuery, page: pageNum, perPage: 20 });
      setChats(data.data ?? []);
      setMeta({
        current_page: data.current_page ?? 1,
        last_page: data.last_page ?? 1,
        total: data.total ?? 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || t('chats.failedLoadList'));
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const handle = setTimeout(() => fetchChats(q, page), q ? 250 : 0);
    return () => clearTimeout(handle);
  }, [q, page, fetchChats]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const chat = await createChat();
      navigate(`/admin/chats/${chat.id}`);
    } catch (err) {
      setError(err.response?.data?.message || t('chats.failedCreate'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      setPendingDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || t('chats.failedDelete'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('chats.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('chats.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} loading={creating}>
          <Plus className="h-4 w-4" />
          {t('chats.newChat')}
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder={t('chats.searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-brand-400 dark:border-deep-700 dark:bg-deep-800 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-deep-800" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center dark:border-deep-700">
          <Inbox className="h-10 w-10 text-gray-300 dark:text-deep-600" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            {q ? t('chats.noResults') : t('chats.noChatsYet')}
          </p>
          {!q && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('chats.createFirst')}
            </p>
          )}
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {chats.map((chat) => (
              <li key={chat.id}>
                <Link
                  to={`/admin/chats/${chat.id}`}
                  className="group relative flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm dark:border-deep-700 dark:bg-deep-800 dark:hover:border-brand-700"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-deep-700 dark:text-brand-300">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1 pr-8">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {chat.title || t('common.untitled')}
                    </p>
                    {chat.last_message && (
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {chat.last_message}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      {formatDate(chat.updated_at || chat.created_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t('chats.deleteAria')}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPendingDeleteId(chat.id); }}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {t('common.previous')}
                </button>
                <button
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
                >
                  {t('common.next')}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {pendingDeleteId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setPendingDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-deep-700 dark:bg-deep-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('chats.deleteConfirmTitle')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {t('chats.deleteConfirmMsg')}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setPendingDeleteId(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-deep-600 dark:bg-deep-700 dark:text-gray-100 dark:hover:bg-deep-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(pendingDeleteId)}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
