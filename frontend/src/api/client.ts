import axios, { AxiosError } from 'axios';
import { runtimeConfig } from '../config/runtime';
import type { ApiProblem } from '../types';

// The admin session lives in an HttpOnly cookie set by the backend — never readable by scripts.
export const api = axios.create({
  baseURL: runtimeConfig.apiBase,
  timeout: 20000,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/me');
    if (error.response?.status === 401 && !isLogin && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiProblem | undefined;
    if (data?.errors) {
      const first = Object.entries(data.errors)[0];
      if (first) return `${first[0]}: ${first[1]}`;
    }
    if (data?.detail) return data.detail;
    if (error.response?.status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (error.code === 'ECONNABORTED') return 'The request timed out.';
    if (!error.response) return 'Cannot reach the server.';
  }
  return fallback;
}
