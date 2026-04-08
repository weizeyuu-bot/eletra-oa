import api from './api';

export interface SystemRole {
  id: number;
  name: string;
  key: string;
  sort: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemRoleRequest {
  name: string;
  key: string;
  sort?: number;
  status?: boolean;
}

export interface UpdateSystemRoleRequest {
  name?: string;
  key?: string;
  sort?: number;
  status?: boolean;
}

export const systemRoleService = {
  async getAll(): Promise<SystemRole[]> {
    const response = await api.get('/system/roles');
    return response.data;
  },

  async create(data: CreateSystemRoleRequest): Promise<SystemRole> {
    const response = await api.post('/system/roles', data);
    return response.data;
  },

  async update(id: number, data: UpdateSystemRoleRequest): Promise<SystemRole> {
    const response = await api.patch(`/system/roles/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<SystemRole> {
    const response = await api.delete(`/system/roles/${id}`);
    return response.data;
  },

  async getMenuIds(id: number): Promise<number[]> {
    const response = await api.get(`/system/roles/${id}/menus`);
    return response.data;
  },

  async updateMenuIds(id: number, menuIds: number[]): Promise<{ roleId: number; menuIds: number[] }> {
    const response = await api.put(`/system/roles/${id}/menus`, { menuIds });
    return response.data;
  },
};
