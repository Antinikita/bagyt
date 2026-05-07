import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Bot, Loader2 } from 'lucide-react';
import {
  useChat,
  useRegenerateMessage,
  useEditMessage,
  useDeleteMessage,
  useRenameChat,
} from '../api/hooks/useChats';
import { useGenerateAnamnesis } from '../api/hooks/useAnamneses';
import { streamChatMessage } from '../api/sseStream';
import { extractApiError } from '../api/axios-client';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import StreamingBubble from '../components/chat/StreamingBubble';
import MessageInput from '../components/chat/MessageInput';

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  const queryClient = useQueryClient();
  const chatQuery = useChat(chatId, { page: 1, perPage: 100 });
  const regenMutation = useRegenerateMessage(chatId);
  const editMutation = useEditMessage(chatId);
  const deleteMsgMutation = useDeleteMessage(chatId);
  const renameMutation = useRenameChat();
  const anamnesisMutation = useGenerateAnamnesis();

  // pendingMessages overlays the server cache for optimistic + in-flight
  // stream rows. Cleared once the server has the same row (post-invalidate).
  const [pendingMessages, setPendingMessages] = useState([]);
  const [error, setError] = useState('');

  const [streamingText, setStreamingText] = useState('');
  const [streamingSending, setStreamingSending] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  const chat = chatQuery.data
    ? { id: chatQuery.data.id, title: chatQuery.data.title, created_at: chatQuery.data.created_at }
    : null;
  const persistedMessages = chatQuery.data?.messages?.data ?? [];
  const messages = [...persistedMessages, ...pendingMessages];
  const loading = chatQuery.isLoading;

  const queryError = chatQuery.isError
    ? chatQuery.error?.response?.status === 404
      ? t('chats.notFound')
      : extractApiError(chatQuery.error, 'chats.failedLoad')
    : '';
  const displayError = error || queryError;

  const sending = streamingSending;
  const regenLoading = regenMutation.isPending;
  const generatingAnamnesis = anamnesisMutation.isPending;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, streamingText]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSendStreaming = async (text) => {
    const optimisticUserId = `temp-user-${Date.now()}`;
    setPendingMessages((prev) => [
      ...prev,
      { id: optimisticUserId, role: 'user', message: text, created_at: new Date().toISOString(), _pending: true },
    ]);
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
              setPendingMessages((prev) =>
                prev.map((m) => (m.id === optimisticUserId ? { ...m, id: userMessageId, _pending: false } : m)),
              );
            }
            if (data?.assistant_message_id) assistantMessageId = data.assistant_message_id;
          } else if (event === 'delta' && data?.text) {
            finalText += data.text;
            setStreamingText(finalText);
          } else if (event === 'final' && data?.answer) {
            finalText = data.answer;
            setStreamingText(finalText);
          } else if (event === 'saved') {
            if (data?.assistant_message_id) assistantMessageId = data.assistant_message_id;
            if (data?.status) assistantStatus = data.status;
          } else if (event === 'error') {
            const streamErr = new Error(data?.message || 'Stream error');
            if (data?.code) streamErr.code = data.code;
            throw streamErr;
          }
        },
      });

      // Server has the row; refetch will replace pending entries.
      // Hold final pending bubbles until the refetch lands so the UI doesn't flicker to empty.
      setPendingMessages((prev) =>
        [
          ...prev.filter((m) => m.id !== optimisticUserId && m.id !== userMessageId),
          userMessageId
            ? { id: userMessageId, role: 'user', message: text, created_at: new Date().toISOString() }
            : null,
          {
            id: assistantMessageId ?? `temp-assistant-${Date.now()}`,
            role: 'assistant',
            message: finalText,
            status: assistantStatus,
            created_at: new Date().toISOString(),
          },
        ].filter(Boolean),
      );
      setStreamingText('');

      if (assistantStatus === 'partial') setError(t('chats.streamPartial'));

      await queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      setPendingMessages([]);
    } catch (err) {
      // On stream error, drop optimistic rows (server has nothing yet).
      setPendingMessages((prev) => prev.filter((m) => m.id !== optimisticUserId && m.id !== userMessageId));
      // extractApiError handles err.code === 'AI_UPSTREAM_FAILED' by
      // returning the dedicated "AI service is down" copy, no matter
      // whether the failure came from the HTTP layer (502 from
      // /messages/stream) or from a mid-stream `error` event.
      setError(extractApiError(err, 'chats.streamFailed'));
      setStreamingText('');
    } finally {
      setStreamingSending(false);
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

  const handleRename = async (title) => {
    try {
      await renameMutation.mutateAsync({ id: chatId, title });
    } catch (err) {
      setError(extractApiError(err, 'chats.renameFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500 dark:text-brand-400" style={{ willChange: 'transform' }} />
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
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <div className="flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-deep-700 dark:bg-deep-800">
        <ChatHeader
          chat={chat}
          onRename={handleRename}
          onGenerateAnamnesis={handleGenerateAnamnesis}
          canGenerateAnamnesis={canGenerateAnamnesis}
          generatingAnamnesis={generatingAnamnesis}
        />

        {displayError && (
          <div className="mx-4 mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
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

          {streamingText && <StreamingBubble text={streamingText} />}

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

        <MessageInput onSubmit={handleSendStreaming} sending={sending} />
      </div>
    </div>
  );
}
