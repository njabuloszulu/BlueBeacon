import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const rawApi = axios.create({ baseURL, withCredentials: true });

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';

    if (status && status >= 400) {
      void import('./auditService.js').then(({ AuditService }) =>
        AuditService.logFailure({ url, status, message: String(msg) })
      );
    }

    if (status === 401 && !original?._retry && !original?.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        const { data } = await rawApi.post('/auth/refresh');
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        }
      } catch {
        setAccessToken(null);
      }
    }

    if (status && status >= 400 && !original?.skipErrorToast) {
      toast.error(typeof msg === 'string' ? msg : 'Request failed');
    }

    return Promise.reject(error);
  }
);
