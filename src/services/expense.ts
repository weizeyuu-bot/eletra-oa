import api from './api';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types';

export const expenseService = {
  // 获取所有费用
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses');
    return response.data;
  },

  // 获取单个费用
  getById: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // 创建费用
  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // 更新费用
  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data;
  },

  // 删除费用
  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
