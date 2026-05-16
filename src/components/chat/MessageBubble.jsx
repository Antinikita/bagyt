import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Bot, User as UserIcon, Check, X } from 'lucide-react';
import MarkdownContent from './MarkdownContent';

export default function MessageBubble({
  message,
  editing,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const isPending = message._pending;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
            : 'bg-gray-100 text-gray-600 dark:bg-deep-700 dark:text-gray-300'
        }`}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={`group max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}
      >
        {editing ? (
          <div className="w-full rounded-2xl border border-brand-300 bg-white p-3 dark:border-brand-700 dark:bg-deep-800">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-400 dark:border-deep-700 dark:bg-deep-900 dark:text-white"
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={onCancelEdit}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-deep-700"
              >
                <X className="h-3.5 w-3.5" /> {t('common.cancel')}
              </button>
              <button
                onClick={onSaveEdit}
                className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-2 py-1 text-xs font-medium text-deep-700 hover:bg-brand-400"
              >
                <Check className="h-3.5 w-3.5" /> {t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm ${
                isUser
                  ? 'whitespace-pre-wrap bg-brand-500 text-deep-900 dark:text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-deep-700 dark:text-gray-100'
              } ${isPending ? 'opacity-70' : ''}`}
            >
              {isUser ? (
                // User input is plain text — never rendered as markdown
                // so an attacker-controlled prompt can't pwn the renderer
                // (or display fake formatting that mimics the AI).
                message.message
              ) : (
                <MarkdownContent tone="assistant">{message.message}</MarkdownContent>
              )}
            </div>
            {!isUser && message.status === 'partial' && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                title={t('chats.streamPartialTooltip')}
              >
                {t('chats.streamPartialBadge')}
              </span>
            )}
            <div
              className={`flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                isUser ? 'flex-row-reverse' : ''
              }`}
            >
              {isUser && !isPending && (
                <button
                  onClick={onStartEdit}
                  aria-label={t('common.edit')}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-deep-700 dark:hover:text-gray-200"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
              {!isPending && (
                <button
                  onClick={onDelete}
                  aria-label={t('common.delete')}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
