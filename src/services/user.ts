import api from './api';
import { User } from '../types';

export const userService = {
  // 获取所有用户
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // 获取单个用户
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};
