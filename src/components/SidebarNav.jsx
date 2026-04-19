import { useEffect, useState, useCallback } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, MessageSquare, FileText, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { listChats, createChat, deleteChat } from '../api/chats';
import { useNavigate } from 'react-router-dom';

export default function SidebarNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const data = await listChats({ page: 1, perPage: 15 });
      setChats(data.data ?? []);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch, chatId]);

  const handleNew = async () => {
    setCreating(true);
    try {
      const chat = await createChat();
      navigate(`/admin/chats/${chat.id}`);
      fetch();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t('chats.deleteConfirmMsg'))) return;
    try {
      await deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (chatId === String(id)) navigate('/admin/chats');
    } catch {}
  };

  const navItems = [
    { to: '/admin/dashboard', icon: Home, label: t('nav.dashboard'), end: true },
    { to: '/admin/chats', icon: MessageSquare, label: t('nav.chats'), end: true },
    { to: '/admin/anamneses', icon: FileText, label: t('nav.anamneses') },
    { to: '/admin/profile', icon: UserIcon, label: t('nav.profile') },
  ];

  return (
    <div className="flex h-full flex-col">
      <nav className="space-y-1 border-b border-gray-200 p-4 dark:border-deep-700">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-800 dark:bg-deep-700 dark:text-brand-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-deep-700/50'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('chats.recent')}
          </p>
          <button
            onClick={handleNew}
            disabled={creating}
            aria-label={t('chats.newChat')}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-deep-700 dark:hover:text-white disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-deep-700/50" />)}
          </div>
        ) : chats.length === 0 ? (
          <p className="px-1 py-2 text-xs text-gray-500 dark:text-gray-400">{t('chats.noChatsYet')}</p>
        ) : (
          <ul className="space-y-1">
            {chats.map((c) => {
              const active = chatId === String(c.id);
              return (
                <li key={c.id}>
                  <Link
                    to={`/admin/chats/${c.id}`}
                    className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-800 dark:bg-deep-700 dark:text-brand-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-deep-700/50'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="min-w-0 flex-1 truncate">{c.title || t('common.untitled')}</span>
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      aria-label={t('common.delete')}
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
