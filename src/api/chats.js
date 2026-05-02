import axiosClient from './axios-client';

export async function listChats({ q = '', page = 1, perPage = 20 } = {}) {
  const { data } = await axiosClient.get('/chats', {
    params: { q, page, per_page: perPage },
  });
  return data;
}

export async function createChat(title) {
  const { data } = await axiosClient.post('/chats', title ? { title } : {});
  return data;
}

export async function getChat(id, { page = 1, perPage = 50 } = {}) {
  const { data } = await axiosClient.get(`/chats/${id}`, {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function renameChat(id, title) {
  const { data } = await axiosClient.patch(`/chats/${id}`, { title });
  return data;
}

export async function deleteChat(id) {
  await axiosClient.delete(`/chats/${id}`);
}

export async function sendMessageSync(chatId, message, locale) {
  const body = locale ? { message, locale } : { message };
  const { data } = await axiosClient.post(
    `/chats/${chatId}/messages`,
    body,
    { idempotent: true },
  );
  return data;
}

export async function regenerate(chatId, locale) {
  const body = locale ? { locale } : {};
  const { data } = await axiosClient.post(
    `/chats/${chatId}/regenerate`,
    body,
    { idempotent: true },
  );
  return data;
}

export async function editMessage(chatId, messageId, message, locale) {
  const body = locale ? { message, locale } : { message };
  const { data } = await axiosClient.patch(
    `/chats/${chatId}/messages/${messageId}`,
    body,
    { idempotent: true },
  );
  return data;
}

export async function deleteMessage(chatId, messageId) {
  await axiosClient.delete(`/chats/${chatId}/messages/${messageId}`);
}
