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
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Create user
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Get one user
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
