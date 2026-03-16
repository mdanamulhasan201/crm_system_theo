import axios from 'axios';
import { isNetworkError, SERVER_UNAVAILABLE_PATH } from './networkError';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
});

/** Prevent multiple redirects when several API calls fail with invalid token at once */
let isRedirectingToLogin = false;

function clearAuthAndRedirectToLogin() {
  if (typeof window === 'undefined' || isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('currentEmployeeId');
    localStorage.removeItem('currentEmployeeData');
  } catch {
    // ignore
  }
  const path = window.location.pathname;
  if (path !== '/login') {
    window.location.replace('/login');
  } else {
    isRedirectingToLogin = false;
  }
}

function isInvalidOrExpiredTokenError(error: any): boolean {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return true;
  const msg =
    typeof error?.response?.data?.message === 'string'
      ? error.response.data.message
      : '';
  if (/invalid or expired token/i.test(msg)) return true;
  return false;
}

axiosClient.interceptors.request.use(
  (config) => {
    // SSR safety check - localStorage only available in browser
    if (typeof window !== 'undefined') {
      const employeeToken = localStorage.getItem('employeeToken');
      const mainToken = localStorage.getItem('token');
      const activeToken = employeeToken || mainToken;

      if (activeToken) {
        config.headers.Authorization = `${activeToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (isNetworkError(error)) {
      (error as { isNetworkError?: boolean }).isNetworkError = true;
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== SERVER_UNAVAILABLE_PATH) {
          window.location.replace(SERVER_UNAVAILABLE_PATH);
        }
      }
      return Promise.reject(error);
    }
    if (isInvalidOrExpiredTokenError(error)) {
      clearAuthAndRedirectToLogin();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
