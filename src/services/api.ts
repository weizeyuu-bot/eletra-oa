import axios from 'axios';

const env = (import.meta as any).env || {};

const resolveApiBaseUrl = () => {
  if (env.VITE_API_URL) {
    return env.VITE_API_URL;
  }

  if (env.VITE_LAN_API_URL) {
    return env.VITE_LAN_API_URL;
  }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3002/api';
  }

  return `http://${host}:3002/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
