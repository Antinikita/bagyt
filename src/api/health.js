import axiosClient from './axios-client';

/**
 * @returns {Promise<{
 *   date: string,
 *   steps: number|null,
 *   avg_heart_rate: number|null,
 *   sleep_minutes: number|null,
 * }>}
 */
export async function getHealthSummary(date = null) {
  const params = date ? { date } : {};
  const { data } = await axiosClient.get('/health/summary', { params });
  return data;
}

/**
 * @param {Array<{
 *   type: string,
 *   value: number,
 *   unit: string,
 *   recorded_at: string,
 *   source?: string,
 *   metadata?: Record<string, unknown>,
 * }>} metrics
 */
export async function postHealthMetrics(metrics) {
  const { data } = await axiosClient.post(
    '/health/metrics',
    { metrics },
    { idempotent: true },
  );
  return data;
}

export async function listHealthMetrics({ type, from, to, limit = 100 } = {}) {
  const { data } = await axiosClient.get('/health/metrics', {
    params: { type, from, to, limit },
  });
  return data;
}

/**
 * @returns {Promise<{
 *   user: { age: number|null, sex: string|null },
 *   norms: Record<string, {
 *     min?: number, max?: number, avg?: number,
 *     low?: number, target?: number, high?: number,
 *     unit: string, label: string,
 *   }>,
 * }>}
 */
export async function getHealthNorms() {
  const { data } = await axiosClient.get('/health/norms');
  return data;
}
