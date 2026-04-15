import api from './api';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types';

export const expenseService = {
  // Get all expenses
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses');
    return response.data;
  },

  // Get one expense
  getById: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // Update expense
  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
