import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react';

export default function ChatHeader({
  chat,
  onRename,
  onGenerateAnamnesis,
  canGenerateAnamnesis,
  generatingAnamnesis,
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(chat?.title || '');
    setEditing(true);
  };

  const saveTitle = async () => {
    const v = draft.trim();
    if (!v || v === chat?.title) {
      setEditing(false);
      return;
    }
    try {
      await onRename(v);
    } finally {
      setEditing(false);
    }
  };

  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-deep-700 dark:bg-deep-800/80">
      <Link
        to="/admin/chats"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-deep-700"
        aria-label={t('chats.backToList')}
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-full rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-400 dark:border-deep-600 dark:bg-deep-700 dark:text-white"
          />
        ) : (
          <button
            onClick={startEdit}
            className="block max-w-full truncate rounded-full px-3 py-1.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-deep-700"
            title={t('chats.renameTitle')}
          >
            {chat.title || t('common.untitled')}
          </button>
        )}
      </div>
      <button
        onClick={onGenerateAnamnesis}
        disabled={!canGenerateAnamnesis || generatingAnamnesis}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-deep-700 shadow-pill hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileText className="h-3.5 w-3.5" />
        {generatingAnamnesis ? t('anamneses.generating') : t('anamneses.generate')}
      </button>
    </header>
  );
}
