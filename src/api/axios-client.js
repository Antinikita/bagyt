import axios from 'axios';
import i18n from '../i18n';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Opt-in idempotency for AI-write endpoints. Caller passes
  // { idempotent: true } in the request config; we attach a fresh UUID.
  // If they want to retry the *same* call deterministically, they can
  // pass an explicit Idempotency-Key header instead.
  if (config.idempotent && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = generateUuid();
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const requestId = response.headers?.['x-request-id'];
    if (requestId && typeof window !== 'undefined') {
      window.__lastRequestId__ = requestId;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const requestId = error.response.headers?.['x-request-id'];
      if (requestId && typeof window !== 'undefined') {
        window.__lastRequestId__ = requestId;
      }
      if (error.response.status === 429) {
        error.isRateLimited = true;
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Pull a user-facing message out of a Laravel error response.
 *
 * Reads (in order):
 *   1. the new structured envelope: { error: { code, message } }
 *   2. Laravel validation errors: { errors: { field: [msg, ...] } }
 *   3. legacy { message } shape (FormRequest fallback)
 *   4. i18n fallback by translation key
 */
export function extractApiError(err, fallbackKey = 'common.somethingWentWrong') {
  if (err?.isRateLimited) {
    return i18n.t('common.rateLimited');
  }

  const data = err?.response?.data;

  if (data?.error?.message) return data.error.message;

  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first.length) return first[0];
    if (typeof first === 'string') return first;
  }

  if (data?.message) return data.message;

  return i18n.t(fallbackKey);
}

function generateUuid() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for older browsers — RFC4122 v4 via Math.random.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default axiosClient;
