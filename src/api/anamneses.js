import axiosClient from './axios-client';

export const ANAMNESIS_FIELDS = [
  'chief_complaint',
  'history_present_illness',
  'past_medical_history',
  'family_history',
  'social_history',
  'allergies',
  'medications',
  'review_of_systems',
];

export async function listAnamneses({ page = 1, perPage = 20 } = {}) {
  const { data } = await axiosClient.get('/anamneses', {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function getAnamnesis(id) {
  const { data } = await axiosClient.get(`/anamneses/${id}`);
  return data.anamnesis ?? data;
}

export async function updateAnamnesis(id, patch) {
  const { data } = await axiosClient.patch(`/anamneses/${id}`, patch);
  return data.anamnesis ?? data;
}

export async function deleteAnamnesis(id) {
  await axiosClient.delete(`/anamneses/${id}`);
}

export async function generateFromChat(chatId, locale) {
  const body = locale ? { locale } : {};
  const { data } = await axiosClient.post(`/chats/${chatId}/anamnesis`, body);
  return data.anamnesis ?? data;
}
