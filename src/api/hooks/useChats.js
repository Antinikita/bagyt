import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  listChats, getChat, createChat, renameChat, deleteChat,
  sendMessageSync, regenerate, editMessage, deleteMessage,
} from '../chats';

export const chatKeys = {
  all: ['chats'],
  list: (params) => ['chats', params],
  detail: (id, params) => ['chat', id, params ?? null],
};

export function useChatsList({ page = 1, perPage = 20, q = '' } = {}) {
  return useQuery({
    queryKey: chatKeys.list({ page, perPage, q }),
    queryFn: () => listChats({ page, perPage, q }),
    placeholderData: keepPreviousData,
  });
}

export function useChat(id, { page = 1, perPage = 50 } = {}) {
  return useQuery({
    queryKey: chatKeys.detail(id, { page, perPage }),
    queryFn: () => getChat(id, { page, perPage }),
    enabled: Boolean(id),
  });
}

export function useCreateChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title) => createChat(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.all }),
  });
}

export function useRenameChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }) => renameChat(id, title),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: chatKeys.all });
      qc.invalidateQueries({ queryKey: ['chat', id] });
    },
  });
}

export function useDeleteChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteChat(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: chatKeys.all });
      qc.removeQueries({ queryKey: ['chat', id] });
    },
  });
}

export function useSendMessage(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, locale }) => sendMessageSync(chatId, message, locale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', chatId] });
      qc.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useRegenerateMessage(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locale) => regenerate(chatId, locale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });
}

export function useEditMessage(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, message, locale }) => editMessage(chatId, messageId, message, locale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });
}

export function useDeleteMessage(chatId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => deleteMessage(chatId, messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', chatId] });
      qc.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
