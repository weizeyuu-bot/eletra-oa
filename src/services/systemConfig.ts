import api from './api';

export interface MenuItem {
  id: number;
  name: string;
  sort: number;
  permission: string;
  component: string;
  status: boolean;
  createdAt: string;
}

export interface DeptItem {
  id: number;
  name: string;
  sort: number;
  status: boolean;
  createdAt: string;
}

export interface PostItem {
  id: number;
  code: string;
  name: string;
  sort: number;
  status: boolean;
  createdAt: string;
}

export interface DictItem {
  id: number;
  name: string;
  type: string;
  remark?: string;
  status: boolean;
  createdAt: string;
}

export interface NoticeItem {
  id: number;
  title: string;
  type: string;
  status: boolean;
  creator: string;
  content?: string;
  isNew?: boolean;
  isRead?: boolean;
  createdAt: string;
}

export const systemConfigService = {
  // menus
  getMenus: async (): Promise<MenuItem[]> => (await api.get('/system/menus')).data,
  createMenu: async (data: Partial<MenuItem>) => (await api.post('/system/menus', data)).data,
  updateMenu: async (id: number, data: Partial<MenuItem>) => (await api.patch(`/system/menus/${id}`, data)).data,
  deleteMenu: async (id: number) => (await api.delete(`/system/menus/${id}`)).data,

  // depts
  getDepts: async (): Promise<DeptItem[]> => (await api.get('/system/depts')).data,
  createDept: async (data: Partial<DeptItem>) => (await api.post('/system/depts', data)).data,
  updateDept: async (id: number, data: Partial<DeptItem>) => (await api.patch(`/system/depts/${id}`, data)).data,
  deleteDept: async (id: number) => (await api.delete(`/system/depts/${id}`)).data,

  // posts
  getPosts: async (): Promise<PostItem[]> => (await api.get('/system/posts')).data,
  createPost: async (data: Partial<PostItem>) => (await api.post('/system/posts', data)).data,
  updatePost: async (id: number, data: Partial<PostItem>) => (await api.patch(`/system/posts/${id}`, data)).data,
  deletePost: async (id: number) => (await api.delete(`/system/posts/${id}`)).data,

  // dicts
  getDicts: async (): Promise<DictItem[]> => (await api.get('/system/dicts')).data,
  createDict: async (data: Partial<DictItem>) => (await api.post('/system/dicts', data)).data,
  updateDict: async (id: number, data: Partial<DictItem>) => (await api.patch(`/system/dicts/${id}`, data)).data,
  deleteDict: async (id: number) => (await api.delete(`/system/dicts/${id}`)).data,

  // notices
  getNotices: async (): Promise<NoticeItem[]> => (await api.get('/system/notices')).data,
  createNotice: async (data: Partial<NoticeItem>) => (await api.post('/system/notices', data)).data,
  updateNotice: async (id: number, data: Partial<NoticeItem>) => (await api.patch(`/system/notices/${id}`, data)).data,
  deleteNotice: async (id: number) => (await api.delete(`/system/notices/${id}`)).data,
};
