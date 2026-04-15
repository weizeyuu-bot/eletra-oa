import axios from 'axios';

let redirectingToLogin = false;

const env = (import.meta as any).env || {};

const resolveApiBaseUrl = () => {
  if (env.VITE_API_URL) {
    return env.VITE_API_URL;
  }

  if (env.VITE_LAN_API_URL) {
    return env.VITE_LAN_API_URL;
  }

  // Override with VITE_API_URL=http://localhost:3002/api during local development.
  // Fallback to backend machine LAN WiFi address when not configured.
  return 'http://10.160.8.42:3002/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !redirectingToLogin) {
        redirectingToLogin = true;
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
