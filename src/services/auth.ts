import api from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const payload = {
      password: data.password,
      ...(data.email ? { email: data.email } : {}),
      ...(data.username ? { username: data.username } : {}),
    };
    const response = await api.post('/auth/login', payload);
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    return token ? { token } : null;
  },
};
