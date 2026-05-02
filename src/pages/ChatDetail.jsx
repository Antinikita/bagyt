import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Send, RefreshCw, Edit2, Trash2, FileText, Bot, User as UserIcon, Check, X,
} from 'lucide-react';
import {
  useChat,
  useSendMessage,
  useRegenerateMessage,
  useEditMessage,
  useDeleteMessage,
  useRenameChat,
  chatKeys,
} from '../api/hooks/useChats';
import { useGenerateAnamnesis } from '../api/hooks/useAnamneses';
import { streamChatMessage } from '../api/sseStream';
import { extractApiError } from '../api/axios-client';
import Button from '../components/ui/Button';

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  const queryClient = useQueryClient();
  const chatQuery = useChat(chatId, { page: 1, perPage: 100 });
  const sendMutation = useSendMessage(chatId);
  const regenMutation = useRegenerateMessage(chatId);
  const editMutation = useEditMessage(chatId);
  const deleteMsgMutation = useDeleteMessage(chatId);
  const renameMutation = useRenameChat();
  const anamnesisMutation = useGenerateAnamnesis();

  // pendingMessages overlays the server cache for optimistic + in-flight
  // stream rows. Cleared once the server has the same row (post-invalidate).
  const [pendingMessages, setPendingMessages] = useState([]);
  const [error, setError] = useState('');

  const [input, setInput] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const [streamingSending, setStreamingSending] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  const chat = chatQuery.data ? {
    id: chatQuery.data.id,
    title: chatQuery.data.title,
    created_at: chatQuery.data.created_at,
  } : null;
  const persistedMessages = chatQuery.data?.messages?.data ?? [];
  const messages = [...persistedMessages, ...pendingMessages];
  const loading = chatQuery.isLoading;

  const queryError = chatQuery.isError
    ? (chatQuery.error?.response?.status === 404
        ? t('chats.notFound')
        : extractApiError(chatQuery.error, 'chats.failedLoad'))
    : '';
  const displayError = error || queryError;

  const sending = streamingSending || sendMutation.isPending;
  const regenLoading = regenMutation.isPending;
  const generatingAnamnesis = anamnesisMutation.isPending;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, streamingText]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSendStreaming = async (text) => {
    const optimisticUserId = `temp-user-${Date.now()}`;
    setPendingMessages((prev) => [...prev, {
      id: optimisticUserId,
      role: 'user',
      message: text,
      created_at: new Date().toISOString(),
      _pending: true,
    }]);
    setStreamingText('');
    setStreamingSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let userMessageId = null;
    let assistantMessageId = null;
    let assistantStatus = 'complete';
    let finalText = '';

    try {
      await streamChatMessage({
        chatId,
        message: text,
        locale,
        signal: controller.signal,
        onEvent: ({ event, data }) => {
          if (event === 'meta') {
            if (data?.user_message_id) {
              userMessageId = data.user_message_id;
              setPendingMessages((prev) => prev.map((m) =>
                m.id === optimisticUserId ? { ...m, id: userMessageId, _pending: false } : m,
              ));
            }
            if (data?.assistant_message_id) {
              assistantMessageId = data.assistant_message_id;
            }
          } else if (event === 'delta' && data?.text) {
            finalText += data.text;
            setStreamingText(finalText);
          } else if (event === 'final' && data?.answer) {
            finalText = data.answer;
            setStreamingText(finalText);
          } else if (event === 'saved') {
            if (data?.assistant_message_id) {
              assistantMessageId = data.assistant_message_id;
            }
            if (data?.status) {
              assistantStatus = data.status;
            }
          } else if (event === 'error') {
            throw new Error(data?.message || 'Stream error');
          }
        },
      });

      // Server has the row; refetch will replace pending entries.
      // Until the refetch lands, hold a final pending bubble for both rows
      // so the UI doesn't flicker to empty.
      setPendingMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUserId && m.id !== userMessageId),
        userMessageId ? {
          id: userMessageId,
          role: 'user',
          message: text,
          created_at: new Date().toISOString(),
        } : null,
        {
          id: assistantMessageId ?? `temp-assistant-${Date.now()}`,
          role: 'assistant',
          message: finalText,
          status: assistantStatus,
          created_at: new Date().toISOString(),
        },
      ].filter(Boolean));
      setStreamingText('');

      if (assistantStatus === 'partial') {
        setError(t('chats.streamPartial'));
      }

      // Invalidate in the background; once it resolves the persistedMessages
      // include the new rows and we drop them from pendingMessages.
      const result = await queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      setPendingMessages([]);
      void result;
    } catch (err) {
      // On stream error, drop optimistic rows (server has nothing yet).
      setPendingMessages((prev) => prev.filter((m) => m.id !== optimisticUserId && m.id !== userMessageId));
      setError(err.message || t('chats.streamFailed'));
      setStreamingText('');
    } finally {
      setStreamingSending(false);
    }
  };

  const handleSendSync = async (text) => {
    const optimisticUserId = `temp-user-${Date.now()}`;
    setPendingMessages((prev) => [...prev, {
      id: optimisticUserId,
      role: 'user',
      message: text,
      created_at: new Date().toISOString(),
      _pending: true,
    }]);

    try {
      await sendMutation.mutateAsync({ message: text, locale });
      // Mutation's onSuccess invalidated the chat query; clear pending once
      // the next data is in.
      setPendingMessages([]);
    } catch (err) {
      setPendingMessages((prev) => prev.filter((m) => m.id !== optimisticUserId));
      setError(extractApiError(err, 'chats.sendFailed'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setError('');
    if (useStreaming) {
      await handleSendStreaming(text);
    } else {
      await handleSendSync(text);
    }
  };

  const handleRegenerate = async () => {
    setError('');
    try {
      await regenMutation.mutateAsync(locale);
    } catch (err) {
      setError(extractApiError(err, 'chats.regenerateFailed'));
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    const text = editText.trim();
    if (!text) return;
    const messageId = editingId;
    setEditingId(null);
    setEditText('');
    setError('');
    try {
      await editMutation.mutateAsync({ messageId, message: text, locale });
    } catch (err) {
      setError(extractApiError(err, 'chats.editFailed'));
    }
  };

  const handleDeleteMsg = async (id) => {
    setError('');
    try {
      await deleteMsgMutation.mutateAsync(id);
    } catch (err) {
      setError(extractApiError(err, 'chats.deleteFailed'));
    }
  };

  const handleGenerateAnamnesis = async () => {
    setError('');
    try {
      const anamnesis = await anamnesisMutation.mutateAsync({ chatId, locale });
      navigate(`/admin/anamneses/${anamnesis.id}`);
    } catch (err) {
      setError(extractApiError(err, 'anamneses.generateFailed'));
    }
  };

  const startEditTitle = () => {
    setTitleDraft(chat?.title || '');
    setEditingTitle(true);
  };

  const saveTitle = async () => {
    const v = titleDraft.trim();
    if (!v || v === chat?.title) { setEditingTitle(false); return; }
    try {
      await renameMutation.mutateAsync({ id: chatId, title: v });
    } catch (err) {
      setError(extractApiError(err, 'chats.renameFailed'));
    } finally {
      setEditingTitle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">{displayError || t('chats.notFound')}</p>
        <Link to="/admin/chats" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> {t('chats.backToList')}
        </Link>
      </div>
    );
  }

  const canRegenerate = messages.some((m) => m.role === 'assistant');
  const canGenerateAnamnesis = messages.length >= 2;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-deep-700 dark:bg-deep-800">
        <Link
          to="/admin/chats"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-deep-700"
          aria-label={t('chats.backToList')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-semibold text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-400 dark:border-deep-600 dark:bg-deep-700 dark:text-white"
            />
          ) : (
            <button
              onClick={startEditTitle}
              className="truncate text-left text-sm font-semibold text-gray-900 hover:underline dark:text-white"
              title={t('chats.renameTitle')}
            >
              {chat.title || t('common.untitled')}
            </button>
          )}
        </div>
        <button
          onClick={handleGenerateAnamnesis}
          disabled={!canGenerateAnamnesis || generatingAnamnesis}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-deep-700 shadow-pill hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-3.5 w-3.5" />
          {generatingAnamnesis ? t('anamneses.generating') : t('anamneses.generate')}
        </button>
      </header>

      {displayError && (
        <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {displayError}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
            <Bot className="h-10 w-10 opacity-50" />
            <p className="mt-3 text-sm font-medium">{t('chats.emptyChat')}</p>
            <p className="mt-1 text-xs">{t('chats.emptyChatHint')}</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            editing={editingId === msg.id}
            editText={editText}
            onEditTextChange={setEditText}
            onStartEdit={() => startEdit(msg)}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onDelete={() => handleDeleteMsg(msg.id)}
          />
        ))}

        {streamingText && (
          <StreamingBubble text={streamingText} />
        )}

        {canRegenerate && !streamingText && !sending && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleRegenerate}
              disabled={regenLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-deep-700 dark:bg-deep-800 dark:text-gray-200 dark:hover:bg-deep-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${regenLoading ? 'animate-spin' : ''}`} />
              {regenLoading ? t('chats.regenerating') : t('chats.regenerate')}
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-white p-4 dark:border-deep-700 dark:bg-deep-800"
      >
        <div className="mb-2 flex items-center justify-end gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <input
              type="checkbox"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
            />
            {t('chats.streamingEnabled')}
          </label>
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
            }}
            placeholder={t('chats.inputPlaceholder')}
            rows={2}
            maxLength={4000}
            disabled={sending}
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-brand-400 disabled:opacity-50 dark:border-deep-700 dark:bg-deep-900 dark:text-white dark:placeholder-gray-500"
          />
          <Button type="submit" variant="primary" loading={sending} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, editing, editText, onEditTextChange, onStartEdit, onSaveEdit, onCancelEdit, onDelete }) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const isPending = message._pending;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        isUser ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
               : 'bg-gray-100 text-gray-600 dark:bg-deep-700 dark:text-gray-300'
      }`}>
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div className={`group max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
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
              <button onClick={onCancelEdit} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-deep-700">
                <X className="h-3.5 w-3.5" /> {t('common.cancel')}
              </button>
              <button onClick={onSaveEdit} className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-2 py-1 text-xs font-medium text-deep-700 hover:bg-brand-400">
                <Check className="h-3.5 w-3.5" /> {t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
              isUser ? 'bg-brand-500 text-deep-900 dark:text-white'
                     : 'bg-gray-100 text-gray-900 dark:bg-deep-700 dark:text-gray-100'
            } ${isPending ? 'opacity-70' : ''}`}>
              {message.message}
            </div>
            {!isUser && message.status === 'partial' && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                title={t('chats.streamPartialTooltip')}
              >
                {t('chats.streamPartialBadge')}
              </span>
            )}
            <div className={`flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${isUser ? 'flex-row-reverse' : ''}`}>
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

function StreamingBubble({ text }) {
  return (
    <div className="flex gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-deep-700 dark:text-gray-300">
        <Bot className="h-4 w-4" />
      </span>
      <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 dark:bg-deep-700 dark:text-gray-100">
        {text}
        <span className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 bg-current animate-pulse" />
      </div>
    </div>
  );
}
