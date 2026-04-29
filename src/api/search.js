import axiosClient from './axios-client';

/**
 * Search the calling user's own chat history.
 *
 * @param {string} q
 * @param {'text'|'semantic'|'hybrid'} [mode='hybrid']
 * @param {number} [limit=20]
 * @returns {Promise<{
 *   mode: string,
 *   count: number,
 *   results: Array<{
 *     message_id: number,
 *     chat_id: number,
 *     chat_title: string|null,
 *     role: 'user'|'assistant',
 *     snippet: string,
 *     rank: number,
 *     created_at: string,
 *   }>,
 * }>}
 */
export async function searchChats(q, mode = 'hybrid', limit = 20) {
  const { data } = await axiosClient.get('/search', {
    params: { q, mode, limit },
  });
  return data;
}
