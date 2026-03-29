import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, RotateCcw, Download, 
  User, Shield, Menu, Building2, Briefcase, Book, Bell,
  ChevronRight, MoreHorizontal, CheckCircle2, XCircle,
  Key, Lock, Settings2, X, Bold, Italic, Underline, 
  Strikethrough, Quote, Code, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Type, Palette, 
  Eraser, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon,
  Paperclip, Camera, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { systemRoleService, type SystemRole } from '../services/systemRole';
import { userService } from '../services/user';
import { systemConfigService } from '../services/systemConfig';

interface PageProps {
  title: string;
}

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
    {children}
  </th>
);

const SearchBar = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
    {children}
    <div className="flex gap-2 ml-auto">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
        <Search className="w-4 h-4" /> 查询
      </button>
      <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2">
        <RotateCcw className="w-4 h-4" /> 重置
      </button>
    </div>
  </div>
);

const ActionButtons = ({ 
  onAdd, 
  onEdit, 
  onDelete, 
  onExport,
  editDisabled = false,
  deleteDisabled = false
}: { 
  onAdd?: () => void; 
  onEdit?: () => void; 
  onDelete?: () => void; 
  onExport?: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}) => (
  <div className="flex gap-2 mb-4">
    <button 
      onClick={onAdd}
      className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center gap-2"
    >
      <Plus className="w-4 h-4" /> 新增
    </button>
    <button 
      onClick={onEdit}
      disabled={editDisabled}
      className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
        !editDisabled 
        ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
        : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
      }`}
    >
      <Edit2 className="w-4 h-4" /> 修改
    </button>
    <button 
      onClick={onDelete}
      disabled={deleteDisabled}
      className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
        !deleteDisabled 
        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
        : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
      }`}
    >
      <Trash2 className="w-4 h-4" /> 删除
    </button>
    <button 
      onClick={onExport}
      className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-medium hover:bg-orange-100 transition-all flex items-center gap-2 ml-auto"
    >
      <Download className="w-4 h-4" /> 导出
    </button>
  </div>
);

const StatusBadge = ({ status }: { status: boolean }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
  }`}>
    {status ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {status ? '正常' : '停用'}
  </span>
);

const UserModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  mode, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (data: any) => void;
  mode: 'add' | 'edit';
  initialData?: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    dept: '',
    phone: '',
    status: true
  });

  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setShowConfirmPassword(false);
      setFormData({
        username: initialData?.username || '',
        password: '',
        confirmPassword: '',
        nickname: initialData?.nickname || '',
        dept: initialData?.dept || '',
        phone: initialData?.phone || '',
        status: initialData?.status !== undefined ? initialData.status : true
      });
    }
  }, [isOpen, initialData]);

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: '未输入', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Za-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: 1, text: '弱', color: 'bg-red-400' };
    if (score <= 2) return { level: 2, text: '中', color: 'bg-yellow-400' };
    if (score <= 3) return { level: 3, text: '良好', color: 'bg-blue-500' };
    return { level: 4, text: '强', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(formData.password);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? '新增用户' : '修改用户'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">用户账号</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="请输入用户账号"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">登录密码</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={mode === 'add' ? '请输入登录密码' : '不修改请留空'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all`}
                    style={{ width: `${strength.level * 25}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">密码强度: {strength.text}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">确认密码</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={mode === 'add' ? '请再次输入登录密码' : '修改密码时请再次确认'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">用户昵称</label>
              <input 
                type="text" 
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="请输入用户昵称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">部门</label>
              <select 
                value={formData.dept}
                onChange={(e) => setFormData({...formData, dept: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">请选择部门</option>
                <option value="研发部">研发部</option>
                <option value="市场部">市场部</option>
                <option value="财务部">财务部</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">手机号码</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="请输入手机号码"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">状态</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  checked={formData.status}
                  onChange={() => setFormData({...formData, status: true})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-600">正常</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  checked={!formData.status}
                  onChange={() => setFormData({...formData, status: false})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-600">停用</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all">取消</button>
          <button onClick={() => onConfirm(formData)} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">确定</button>
        </div>
      </motion.div>
    </div>
  );
};

// 1. 用户管理
export const UserManagement = ({ 
  title, 
  users, 
  setUsers 
}: PageProps & { 
  users: any[]; 
  setUsers: React.Dispatch<React.SetStateAction<any[]>> 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const user = users.find(u => u.id === selectedIds[0]);
      if (user) handleEdit(user);
    }
  };

  const handleDelete = (id: string | number) => {
    if (window.confirm('确定要删除该用户吗？')) {
      userService.delete(String(id)).then(() => {
        setUsers(users.filter(u => u.id !== id));
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      }).catch(() => {
        alert('删除失败');
      });
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个用户吗？`)) {
      Promise.all(selectedIds.map((id) => userService.delete(String(id)))).then(() => {
        setUsers(users.filter(u => !selectedIds.includes(u.id)));
        setSelectedIds([]);
      }).catch(() => {
        alert('批量删除失败');
      });
    }
  };

  const handleConfirm = async (data: any) => {
    const passwordRule = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    const hasPasswordInput = !!data.password?.trim() || !!data.confirmPassword?.trim();

    if (modalMode === 'add' && !data.password?.trim()) {
      alert('请输入登录密码');
      return;
    }

    if (modalMode === 'add' && !data.confirmPassword?.trim()) {
      alert('请确认登录密码');
      return;
    }

    if ((modalMode === 'add' || hasPasswordInput) && data.password !== data.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    if ((modalMode === 'add' || hasPasswordInput) && !passwordRule.test(data.password || '')) {
      alert('密码至少6位，且需包含字母和数字');
      return;
    }

    const submitData = { ...data };
    delete submitData.confirmPassword;
    if (modalMode === 'edit' && !submitData.password?.trim()) {
      delete submitData.password;
    }

    if (modalMode === 'add') {
      try {
        const created = await userService.create({
          username: submitData.username,
          password: submitData.password,
          nickname: submitData.nickname,
          dept: submitData.dept,
          phone: submitData.phone,
          status: submitData.status,
        });
        const newUser = {
          id: created.id,
          username: created.username,
          nickname: created.nickname || created.firstName || '',
          dept: created.dept || '',
          phone: created.phone || '',
          status: created.status === 'ACTIVE' || created.status === true,
          createTime: new Date(created.createdAt).toLocaleString(),
        };
        setUsers([...users, newUser]);
      } catch (error) {
        console.error(error);
        const message = (error as any)?.response?.data?.message;
        alert(typeof message === 'string' ? `新增用户失败：${message}` : '新增用户失败，请检查后端服务是否可用');
        return;
      }
    } else {
      try {
        await userService.update(String(selectedUser.id), {
          password: submitData.password,
          nickname: submitData.nickname,
          dept: submitData.dept,
          phone: submitData.phone,
          status: submitData.status,
        });
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...submitData } : u));
      } catch (error) {
        console.error(error);
        alert('修改用户失败');
        return;
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">管理系统用户信息、分配部门及状态维护</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">用户名称</label>
          <input type="text" placeholder="请输入用户名称" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">手机号码</label>
          <input type="text" placeholder="请输入手机号码" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">状态</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">所有</option>
            <option value="1">正常</option>
            <option value="0">停用</option>
          </select>
        </div>
      </SearchBar>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <ActionButtons 
            onAdd={handleAdd}
            onEdit={handleHeaderEdit}
            onDelete={handleBatchDelete}
            editDisabled={selectedIds.length !== 1}
            deleteDisabled={selectedIds.length === 0}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(users.map(u => u.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>用户账号</TableHeader>
                <TableHeader>用户昵称</TableHeader>
                <TableHeader>部门</TableHeader>
                <TableHeader>手机号码</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, user.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.nickname}</td>
                  <td className="px-6 py-4 text-gray-600">{user.dept}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{user.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                      <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> 重置
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        mode={modalMode}
        initialData={selectedUser}
      />
    </div>
  );
};

// 2. 角色管理
export const RoleManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRole | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    sort: 0,
    status: true,
  });

  const loadRoles = async () => {
    try {
      const data = await systemRoleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error('加载角色失败', error);
      alert('加载角色失败，请确认后端已登录并可用');
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ name: '', key: '', sort: 0, status: true });
    setIsModalOpen(true);
  };

  const handleEdit = (role: SystemRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      key: role.key,
      sort: role.sort,
      status: role.status,
    });
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const role = roles.find(r => r.id === selectedIds[0]);
      if (role) handleEdit(role);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该角色吗？')) {
      await systemRoleService.delete(id);
      await loadRoles();
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个角色吗？`)) {
      await Promise.all(selectedIds.map((id) => systemRoleService.delete(id)));
      await loadRoles();
      setSelectedIds([]);
    }
  };

  const handleConfirm = async () => {
    if (!formData.name.trim() || !formData.key.trim()) {
      alert('请填写角色名称和权限字符');
      return;
    }

    try {
      if (editingRole) {
        await systemRoleService.update(editingRole.id, {
          name: formData.name,
          key: formData.key,
          sort: formData.sort,
          status: formData.status,
        });
      } else {
        await systemRoleService.create({
          name: formData.name,
          key: formData.key,
          sort: formData.sort,
          status: formData.status,
        });
      }
      alert('保存成功');
      setIsModalOpen(false);
      await loadRoles();
    } catch (error) {
      console.error('保存角色失败', error);
      alert('保存失败，请检查权限字符是否重复');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">管理系统角色权限、菜单分配及数据范围</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">角色名称</label>
          <input type="text" placeholder="请输入角色名称" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">权限字符</label>
          <input type="text" placeholder="请输入权限字符" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">状态</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">所有</option>
            <option value="1">正常</option>
            <option value="0">停用</option>
          </select>
        </div>
      </SearchBar>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <ActionButtons 
            onAdd={handleAdd} 
            onEdit={handleHeaderEdit} 
            onDelete={handleBatchDelete}
            editDisabled={selectedIds.length !== 1}
            deleteDisabled={selectedIds.length === 0}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === roles.length && roles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(roles.map(r => r.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>角色名称</TableHeader>
                <TableHeader>权限字符</TableHeader>
                <TableHeader>显示顺序</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, role.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== role.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 text-gray-600">{role.key}</td>
                  <td className="px-6 py-4 text-gray-600">{role.sort}</td>
                  <td className="px-6 py-4"><StatusBadge status={role.status} /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(role.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(role)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button 
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> 菜单权限
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Role Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingRole ? '修改角色' : '新增角色'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">角色名称</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入角色名称" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">权限字符</label>
                <input type="text" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入权限字符" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">显示顺序</label>
                <input type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: Number(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入显示顺序" />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">取消</button>
              <button onClick={handleConfirm} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">确定</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 3. 菜单管理
export const MenuManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menus, setMenus] = useState<any[]>([]);

  const loadMenus = async () => {
    try {
      const data = await systemConfigService.getMenus();
      setMenus(data.map((m) => ({ ...m, createTime: new Date(m.createdAt).toLocaleString() })));
    } catch (error) {
      console.error('加载菜单失败:', error);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt('请输入菜单名称');
    if (!name) return;
    const permission = window.prompt('请输入权限标识', 'system:menu:list') || '';
    const component = window.prompt('请输入组件路径', 'system/menu/index') || '';
    const sortValue = window.prompt('请输入排序', '1') || '1';

    try {
      await systemConfigService.createMenu({
        name,
        permission,
        component,
        sort: Number(sortValue) || 1,
        status: true,
      });
      await loadMenus();
    } catch (error) {
      console.error('新增菜单失败:', error);
      alert('新增菜单失败');
    }
  };

  const handleEdit = async (menu: any) => {
    const name = window.prompt('请输入菜单名称', menu.name);
    if (!name) return;
    const permission = window.prompt('请输入权限标识', menu.permission) || menu.permission;
    const component = window.prompt('请输入组件路径', menu.component) || menu.component;
    const sortValue = window.prompt('请输入排序', String(menu.sort)) || String(menu.sort);

    try {
      await systemConfigService.updateMenu(menu.id, {
        name,
        permission,
        component,
        sort: Number(sortValue) || menu.sort,
      });
      await loadMenus();
    } catch (error) {
      console.error('修改菜单失败:', error);
      alert('修改菜单失败');
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const menu = menus.find(m => m.id === selectedIds[0]);
      if (menu) handleEdit(menu);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该菜单吗？')) return;
    try {
      await systemConfigService.deleteMenu(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadMenus();
    } catch (error) {
      console.error('删除菜单失败:', error);
      alert('删除菜单失败');
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个菜单吗？`))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteMenu(id)));
      setSelectedIds([]);
      await loadMenus();
    } catch (error) {
      console.error('批量删除菜单失败:', error);
      alert('批量删除菜单失败');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">配置系统菜单、按钮权限及路由信息</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="flex gap-2">
            <ActionButtons 
              onAdd={handleAdd} 
              onEdit={handleHeaderEdit} 
              onDelete={handleBatchDelete}
              editDisabled={selectedIds.length !== 1}
              deleteDisabled={selectedIds.length === 0}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === menus.length && menus.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(menus.map(m => m.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>菜单名称</TableHeader>
                <TableHeader>排序</TableHeader>
                <TableHeader>权限标识</TableHeader>
                <TableHeader>组件路径</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {menus.map((menu) => (
                <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(menu.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, menu.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== menu.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    {menu.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{menu.sort}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm font-mono">{menu.permission}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{menu.component}</td>
                  <td className="px-6 py-4"><StatusBadge status={menu.status} /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{menu.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(menu)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> 新增
                      </button>
                      <button 
                        onClick={() => handleDelete(menu.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Menu Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingMenu ? '修改菜单' : '新增菜单'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">菜单名称</label>
                <input type="text" defaultValue={editingMenu?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入菜单名称" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">组件路径</label>
                <input type="text" defaultValue={editingMenu?.component} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入组件路径" />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">取消</button>
              <button onClick={() => { alert('保存成功'); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">确定</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 4. 部门管理
export const DeptManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [depts, setDepts] = useState<any[]>([]);

  const loadDepts = async () => {
    try {
      const data = await systemConfigService.getDepts();
      setDepts(data.map((d) => ({ ...d, createTime: new Date(d.createdAt).toLocaleString() })));
    } catch (error) {
      console.error('加载部门失败:', error);
    }
  };

  useEffect(() => {
    loadDepts();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt('请输入部门名称');
    if (!name) return;
    const sortValue = window.prompt('请输入排序', '1') || '1';

    try {
      await systemConfigService.createDept({
        name,
        sort: Number(sortValue) || 1,
        status: true,
      });
      await loadDepts();
    } catch (error) {
      console.error('新增部门失败:', error);
      alert('新增部门失败');
    }
  };

  const handleEdit = async (dept: any) => {
    const name = window.prompt('请输入部门名称', dept.name);
    if (!name) return;
    const sortValue = window.prompt('请输入排序', String(dept.sort)) || String(dept.sort);

    try {
      await systemConfigService.updateDept(dept.id, {
        name,
        sort: Number(sortValue) || dept.sort,
      });
      await loadDepts();
    } catch (error) {
      console.error('修改部门失败:', error);
      alert('修改部门失败');
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const dept = depts.find(d => d.id === selectedIds[0]);
      if (dept) handleEdit(dept);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该部门吗？')) return;
    try {
      await systemConfigService.deleteDept(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadDepts();
    } catch (error) {
      console.error('删除部门失败:', error);
      alert('删除部门失败');
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个部门吗？`))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteDept(id)));
      setSelectedIds([]);
      await loadDepts();
    } catch (error) {
      console.error('批量删除部门失败:', error);
      alert('批量删除部门失败');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">维护组织架构、部门层级及状态</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <ActionButtons 
            onAdd={handleAdd} 
            onEdit={handleHeaderEdit} 
            onDelete={handleBatchDelete}
            editDisabled={selectedIds.length !== 1}
            deleteDisabled={selectedIds.length === 0}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === depts.length && depts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(depts.map(d => d.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>部门名称</TableHeader>
                <TableHeader>排序</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {depts.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(dept.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, dept.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== dept.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{dept.sort}</td>
                  <td className="px-6 py-4"><StatusBadge status={dept.status} /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{dept.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(dept)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> 新增
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Dept Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingDept ? '修改部门' : '新增部门'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">部门名称</label>
                <input type="text" defaultValue={editingDept?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入部门名称" />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">取消</button>
              <button onClick={() => { alert('保存成功'); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">确定</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 5. 岗位管理
export const PostManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const loadPosts = async () => {
    try {
      const data = await systemConfigService.getPosts();
      setPosts(data.map((p) => ({ ...p, createTime: new Date(p.createdAt).toLocaleString() })));
    } catch (error) {
      console.error('加载岗位失败:', error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt('请输入岗位名称');
    if (!name) return;
    const code = window.prompt('请输入岗位编码', '') || '';
    const sortValue = window.prompt('请输入排序', '1') || '1';

    try {
      await systemConfigService.createPost({
        name,
        code,
        sort: Number(sortValue) || 1,
        status: true,
      });
      await loadPosts();
    } catch (error) {
      console.error('新增岗位失败:', error);
      alert('新增岗位失败');
    }
  };

  const handleEdit = async (post: any) => {
    const name = window.prompt('请输入岗位名称', post.name);
    if (!name) return;
    const code = window.prompt('请输入岗位编码', post.code) || post.code;
    const sortValue = window.prompt('请输入排序', String(post.sort)) || String(post.sort);

    try {
      await systemConfigService.updatePost(post.id, {
        name,
        code,
        sort: Number(sortValue) || post.sort,
      });
      await loadPosts();
    } catch (error) {
      console.error('修改岗位失败:', error);
      alert('修改岗位失败');
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const post = posts.find(p => p.id === selectedIds[0]);
      if (post) handleEdit(post);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该岗位吗？')) return;
    try {
      await systemConfigService.deletePost(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadPosts();
    } catch (error) {
      console.error('删除岗位失败:', error);
      alert('删除岗位失败');
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个岗位吗？`))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deletePost(id)));
      setSelectedIds([]);
      await loadPosts();
    } catch (error) {
      console.error('批量删除岗位失败:', error);
      alert('批量删除岗位失败');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">管理公司岗位信息、编码及排序</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">岗位编码</label>
          <input type="text" placeholder="请输入岗位编码" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">岗位名称</label>
          <input type="text" placeholder="请输入岗位名称" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">状态</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">所有</option>
            <option value="1">正常</option>
            <option value="0">停用</option>
          </select>
        </div>
      </SearchBar>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <ActionButtons 
            onAdd={handleAdd} 
            onEdit={handleHeaderEdit} 
            onDelete={handleBatchDelete}
            editDisabled={selectedIds.length !== 1}
            deleteDisabled={selectedIds.length === 0}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === posts.length && posts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(posts.map(p => p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>岗位编码</TableHeader>
                <TableHeader>岗位名称</TableHeader>
                <TableHeader>显示顺序</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, post.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== post.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{post.code}</td>
                  <td className="px-6 py-4 text-gray-600">{post.name}</td>
                  <td className="px-6 py-4 text-gray-600">{post.sort}</td>
                  <td className="px-6 py-4"><StatusBadge status={post.status} /></td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{post.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(post)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Post Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingPost ? '修改岗位' : '新增岗位'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">岗位名称</label>
                <input type="text" defaultValue={editingPost?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入岗位名称" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">岗位编码</label>
                <input type="text" defaultValue={editingPost?.code} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入岗位编码" />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">取消</button>
              <button onClick={() => { alert('保存成功'); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">确定</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 6. 字典管理
export const DictManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDict, setEditingDict] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dicts, setDicts] = useState<any[]>([]);

  const loadDicts = async () => {
    try {
      const data = await systemConfigService.getDicts();
      setDicts(data.map((d) => ({ ...d, createTime: new Date(d.createdAt).toLocaleString() })));
    } catch (error) {
      console.error('加载字典失败:', error);
    }
  };

  useEffect(() => {
    loadDicts();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt('请输入字典名称');
    if (!name) return;
    const type = window.prompt('请输入字典类型', 'sys_dict_type') || 'sys_dict_type';
    const remark = window.prompt('请输入备注', '') || '';

    try {
      await systemConfigService.createDict({
        name,
        type,
        remark,
        status: true,
      });
      await loadDicts();
    } catch (error) {
      console.error('新增字典失败:', error);
      alert('新增字典失败');
    }
  };

  const handleEdit = async (dict: any) => {
    const name = window.prompt('请输入字典名称', dict.name);
    if (!name) return;
    const type = window.prompt('请输入字典类型', dict.type) || dict.type;
    const remark = window.prompt('请输入备注', dict.remark || '') || '';

    try {
      await systemConfigService.updateDict(dict.id, {
        name,
        type,
        remark,
      });
      await loadDicts();
    } catch (error) {
      console.error('修改字典失败:', error);
      alert('修改字典失败');
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const dict = dicts.find(d => d.id === selectedIds[0]);
      if (dict) handleEdit(dict);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该字典吗？')) return;
    try {
      await systemConfigService.deleteDict(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadDicts();
    } catch (error) {
      console.error('删除字典失败:', error);
      alert('删除字典失败');
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个字典吗？`))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteDict(id)));
      setSelectedIds([]);
      await loadDicts();
    } catch (error) {
      console.error('批量删除字典失败:', error);
      alert('批量删除字典失败');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">维护系统通用数据字典、枚举值及配置</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">字典名称</label>
          <input type="text" placeholder="请输入字典名称" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">字典类型</label>
          <input type="text" placeholder="请输入字典类型" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">状态</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">所有</option>
            <option value="1">正常</option>
            <option value="0">停用</option>
          </select>
        </div>
      </SearchBar>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <ActionButtons 
            onAdd={handleAdd} 
            onEdit={handleHeaderEdit} 
            onDelete={handleBatchDelete}
            editDisabled={selectedIds.length !== 1}
            deleteDisabled={selectedIds.length === 0}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === dicts.length && dicts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(dicts.map(d => d.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>字典名称</TableHeader>
                <TableHeader>字典类型</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>备注</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dicts.map((dict) => (
                <tr key={dict.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(dict.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, dict.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== dict.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{dict.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm font-mono">{dict.type}</td>
                  <td className="px-6 py-4"><StatusBadge status={dict.status} /></td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{dict.remark}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{dict.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(dict)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button 
                        className={`font-medium text-sm flex items-center gap-1 ${
                          dict.type === 'cost_center' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                        disabled={dict.type === 'cost_center'}
                        onClick={() => {
                          if (dict.type !== 'cost_center') {
                            alert('跳转到字典数据管理: ' + dict.name);
                          }
                        }}
                      >
                        <Book className="w-3.5 h-3.5" /> 字典数据
                      </button>
                      <button 
                        onClick={() => handleDelete(dict.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Dict Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingDict ? '修改字典' : '新增字典'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">字典名称</label>
                <input type="text" defaultValue={editingDict?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入字典名称" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">字典类型</label>
                <input type="text" defaultValue={editingDict?.type} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入字典类型" />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">取消</button>
              <button onClick={() => { alert('保存成功'); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">确定</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 7. 通知公告管理
const NoticeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  mode, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (data: any) => void;
  mode: 'add' | 'edit';
  initialData?: any;
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || '通知');
  const [status, setStatus] = useState(initialData?.status !== undefined ? initialData.status : true);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setType(initialData?.type || '通知');
      setStatus(initialData?.status !== undefined ? initialData.status : true);
      if (editorRef.current) {
        if (initialData?.content && initialData.content !== '提示') {
          editorRef.current.innerHTML = initialData.content;
          setIsPlaceholder(false);
        } else {
          editorRef.current.innerHTML = '提示';
          setIsPlaceholder(true);
        }
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const execCommand = (command: string, value?: string) => {
    if (isPlaceholder && editorRef.current) {
      editorRef.current.innerHTML = '';
      setIsPlaceholder(false);
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleEditorFocus = () => {
    if (isPlaceholder && editorRef.current) {
      editorRef.current.innerHTML = '';
      setIsPlaceholder(false);
    }
  };

  const handleEditorBlur = () => {
    if (editorRef.current && (editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<br>')) {
      editorRef.current.innerHTML = '提示';
      setIsPlaceholder(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const link = `<a href="#" class="text-blue-600 underline" onclick="event.preventDefault(); alert('正在下载附件: ${file.name}');">[附件: ${file.name}]</a>&nbsp;`;
      if (isPlaceholder && editorRef.current) {
        editorRef.current.innerHTML = '';
        setIsPlaceholder(false);
      }
      document.execCommand('insertHTML', false, link);
      if (editorRef.current) editorRef.current.focus();
    }
    if (e.target) e.target.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = `<img src="${event.target?.result}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />&nbsp;`;
        if (isPlaceholder && editorRef.current) {
          editorRef.current.innerHTML = '';
          setIsPlaceholder(false);
        }
        document.execCommand('insertHTML', false, img);
        if (editorRef.current) editorRef.current.focus();
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleConfirm = () => {
    onConfirm({
      title,
      type,
      status,
      content: isPlaceholder ? '' : (editorRef.current?.innerHTML || '')
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? '添加公告' : '修改公告'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span className="text-red-500">*</span> 公告标题
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入公告标题" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span className="text-red-500">*</span> 类型
              </label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
              >
                <option value="">请选择类型</option>
                <option value="通知">通知</option>
                <option value="公告">公告</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">状态</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="notice-status" 
                    checked={status}
                    onChange={() => setStatus(true)}
                    className="peer sr-only" 
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-500 transition-all" />
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">正常</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="notice-status" 
                    checked={!status}
                    onChange={() => setStatus(false)}
                    className="peer sr-only" 
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-500 transition-all" />
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">关闭</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">内容</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="bg-gray-50/50 p-2 border-b border-gray-200 flex flex-wrap gap-1">
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Bold className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Italic className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Underline className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('strikeThrough'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Strikethrough className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'blockquote'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Quote className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'pre'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Code className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><ListOrdered className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><List className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><AlignLeft className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><AlignCenter className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <select 
                    onChange={(e) => execCommand('fontSize', e.target.value)}
                    className="bg-transparent text-xs font-medium text-gray-600 focus:outline-none cursor-pointer"
                  >
                    <option value="3">14px</option>
                    <option value="4">16px</option>
                    <option value="5">18px</option>
                  </select>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <select 
                    onChange={(e) => execCommand('formatBlock', e.target.value)}
                    className="bg-transparent text-xs font-medium text-gray-600 focus:outline-none cursor-pointer"
                  >
                    <option value="p">文本</option>
                    <option value="h1">标题1</option>
                    <option value="h2">标题2</option>
                  </select>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const color = prompt('请输入颜色值 (如: #ff0000)', '#3b82f6');
                    if (color) execCommand('foreColor', color);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Type className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const color = prompt('请输入背景颜色 (如: #ffff00)', '#dbeafe');
                    if (color) execCommand('hiliteColor', color);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Palette className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><AlignRight className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Eraser className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const url = prompt('请输入链接地址');
                    if (url) execCommand('createLink', url);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><LinkIcon className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const url = prompt('请输入图片地址');
                    if (url) execCommand('insertImage', url);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><ImageIcon className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    imageInputRef.current?.click();
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600" title="上传截图/图片"><Camera className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600" title="上传附件"><Paperclip className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    alert('视频插入功能开发中');
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><VideoIcon className="w-4 h-4" /></button>
                </div>
              </div>
              {/* Hidden Inputs */}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
              {/* Editor Area */}
              <div 
                ref={editorRef}
                className={`p-4 min-h-[240px] bg-white text-sm focus:outline-none ${isPlaceholder ? 'text-gray-300' : 'text-gray-600'}`} 
                contentEditable
                onFocus={handleEditorFocus}
                onBlur={handleEditorBlur}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            确定
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const NoticeManagement = ({ title, notices, setNotices, onMarkAsRead, onOpenNotice }: { title: string; notices: any[]; setNotices: (n: any[]) => void; onMarkAsRead: (id: number) => void; onOpenNotice: (notice: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadNotices = async () => {
    try {
      const data = await systemConfigService.getNotices();
      setNotices(data.map((n) => ({
        ...n,
        createTime: new Date(n.createdAt).toLocaleString(),
        isRead: n.isRead ?? false,
        isNew: n.isNew ?? false,
      })));
    } catch (error) {
      console.error('加载公告失败:', error);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedNotice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (notice: any) => {
    setModalMode('edit');
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const handleConfirm = async (data: any) => {
    try {
      if (modalMode === 'add') {
        await systemConfigService.createNotice({
          ...data,
          creator: 'admin',
          isNew: true,
          isRead: false,
        });
      } else if (selectedNotice) {
        await systemConfigService.updateNotice(selectedNotice.id, data);
      }
      setIsModalOpen(false);
      await loadNotices();
    } catch (error) {
      console.error('保存公告失败:', error);
      alert('保存公告失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该公告吗？')) return;
    try {
      await systemConfigService.deleteNotice(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadNotices();
    } catch (error) {
      console.error('删除公告失败:', error);
      alert('删除公告失败');
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 条公告吗？`))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteNotice(id)));
      setSelectedIds([]);
      await loadNotices();
    } catch (error) {
      console.error('批量删除公告失败:', error);
      alert('批量删除公告失败');
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const notice = notices.find(n => n.id === selectedIds[0]);
      if (notice) handleEdit(notice);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">发布及管理系统内部通知、公告及新闻</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">公告标题</label>
          <input type="text" placeholder="请输入公告标题" className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">公告类型</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">所有</option>
            <option value="1">通知</option>
            <option value="2">公告</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">状态</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">所有</option>
            <option value="1">正常</option>
            <option value="0">停用</option>
          </select>
        </div>
      </SearchBar>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> 新增
            </button>
            <button 
              onClick={handleHeaderEdit}
              disabled={selectedIds.length !== 1}
              className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedIds.length === 1 
                ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
              }`}
            >
              <Edit2 className="w-4 h-4" /> 修改
            </button>
            <button 
              onClick={handleBatchDelete}
              disabled={selectedIds.length === 0}
              className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedIds.length > 0
                  ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 className="w-4 h-4" /> 删除
            </button>
            <button className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-medium hover:bg-orange-100 transition-all flex items-center gap-2 ml-auto">
              <Download className="w-4 h-4" /> 导出
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TableHeader>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedIds.length === notices.length && notices.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(notices.map(n => n.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>公告标题</TableHeader>
                <TableHeader>公告类型</TableHeader>
                <TableHeader>状态</TableHeader>
                <TableHeader>创建者</TableHeader>
                <TableHeader>创建时间</TableHeader>
                <TableHeader>操作</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(notice.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, notice.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== notice.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => {
                        onMarkAsRead(notice.id);
                        onOpenNotice(notice);
                      }}
                    >
                      {notice.isNew && !notice.isRead && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded flex items-center justify-center animate-pulse shrink-0">
                          NEW
                        </span>
                      )}
                      {notice.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      notice.type === '通知' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {notice.type}
                    </span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={notice.status} /></td>
                  <td className="px-6 py-4 text-gray-600">{notice.creator}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{notice.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(notice)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 修改
                      </button>
                      <button 
                        onClick={() => handleDelete(notice.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NoticeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirm}
        mode={modalMode}
        initialData={selectedNotice}
      />
    </div>
  );
};
