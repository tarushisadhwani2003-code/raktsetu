import axios from 'axios';

/**
 * Axios instance for the RaktSetu API.
 * In development Vite forwards /api to the Express server; in production the same server serves both.
 * Set VITE_API_URL only if the API lives on another domain.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 20000,
});

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (error?.request && !error?.response)
    return 'Cannot reach the RaktSetu server. Check your connection and try again.';
  return fallback;
}

/** Field-level validation errors returned by the API: { email: 'Enter a valid email address.' } */
export const getFieldErrors = (error) => error?.response?.data?.errors ?? {};
