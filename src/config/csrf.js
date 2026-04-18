import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function getCsrfToken() {
  try {
    await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
    const xsrfToken = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
    if (!xsrfToken) {
      console.error('XSRF-TOKEN not found in cookies');
      return null;
    }
    return decodeURIComponent(xsrfToken);
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}
