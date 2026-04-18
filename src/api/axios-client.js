import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL is not set. Copy .env.example to .env and restart the dev server.');
}

const axiosClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let authErrorHandler = null;

export function registerAuthErrorHandler(cb) {
  authErrorHandler = cb;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? '';
    const isAuthProbe = url.endsWith('/user') || url.endsWith('/login') || url.endsWith('/register');
    if ((status === 401 || status === 419) && !isAuthProbe && authErrorHandler) {
      authErrorHandler();
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
