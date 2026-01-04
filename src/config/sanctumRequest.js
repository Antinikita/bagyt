import axiosClient from '../api/axios-client'
import { getCsrfToken } from './csrf'
export const sanctumRequest = async (method, url, data = {}, config = {}) => {
     const csrfToken = await getCsrfToken();
const response = await axiosClient({
    method,
    url,
    data,
    headers: {
        'X-XSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
      },
    ...config,
    withCredentials: true,
  });
return response;
}; 