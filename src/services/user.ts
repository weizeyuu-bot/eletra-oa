import api from './api';
import { User } from '../types';

export interface CreateUserRequest {
  username: string;
  password: string;
  nickname?: string;
  dept?: string;
  phone?: string;
  status?: boolean;
}

export interface UpdateUserRequest {
  password?: string;
  nickname?: string;
  dept?: string;
  phone?: string;
  status?: boolean;
}

export const userService = {
  // 获取所有用户
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // 新增用户
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // 获取单个用户
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // 更新用户
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // 删除用户
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
