import api from './api';
import { Workflow, CreateWorkflowRequest } from '../types';

export const workflowService = {
  // Get all workflows
  getAll: async (): Promise<Workflow[]> => {
    const response = await api.get('/workflows');
    return response.data;
  },

  // Get one workflow
  getById: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  // Create workflow
  create: async (data: CreateWorkflowRequest): Promise<Workflow> => {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  // Delete workflow
  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`);
  },
};
