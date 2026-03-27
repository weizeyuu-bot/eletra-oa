import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, RotateCcw, Download, 
  User, Shield, Menu, Building2, Briefcase, Book, Bell,
  ChevronRight, MoreHorizontal, CheckCircle2, XCircle,
  Key, Lock, Settings2, X, Bold, Italic, Underline, 
  Strikethrough, Quote, Code, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Type, Palette, 
  Eraser, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon,
  Paperclip, Camera
} from 'lucide-react';
import { motion } from 'motion/react';

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
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    dept: '',
    phone: '',
    status: true
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: initialData?.username || '',
        nickname: initialData?.nickname || '',
        dept: initialData?.dept || '',
        phone: initialData?.phone || '',
        status: initialData?.status !== undefined ? initialData.status : true
      });
    }
  }, [isOpen, initialData]);

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该用户吗？')) {
      setUsers(users.filter(u => u.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个用户吗？`)) {
      setUsers(users.filter(u => !selectedIds.includes(u.id)));
      setSelectedIds([]);
    }
  };

  const handleConfirm = (data: any) => {
    if (modalMode === 'add') {
      const newUser = {
        ...data,
        id: Math.max(0, ...users.map(u => u.id)) + 1,
        createTime: new Date().toLocaleString()
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
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
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [roles, setRoles] = useState([
    { id: 1, name: '超级管理员', key: 'admin', sort: 1, status: true, createTime: '2026-01-01 12:00:00' },
    { id: 2, name: '普通角色', key: 'common', sort: 2, status: true, createTime: '2026-01-01 12:00:00' },
  ]);

  const handleAdd = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const role = roles.find(r => r.id === selectedIds[0]);
      if (role) handleEdit(role);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该角色吗？')) {
      setRoles(roles.filter(r => r.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个角色吗？`)) {
      setRoles(roles.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
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
                  <td className="px-6 py-4 text-gray-500 text-sm">{role.createTime}</td>
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
                <input type="text" defaultValue={editingRole?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入角色名称" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">权限字符</label>
                <input type="text" defaultValue={editingRole?.key} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="请输入权限字符" />
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

// 3. 菜单管理
export const MenuManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menus, setMenus] = useState([
    { id: 1, name: '系统管理', sort: 1, permission: 'system', component: 'Layout', status: true, createTime: '2026-01-01 12:00:00' },
    { id: 2, name: '用户管理', sort: 1, permission: 'system:user:list', component: 'system/user/index', status: true, createTime: '2026-01-01 12:00:00' },
    { id: 3, name: '角色管理', sort: 2, permission: 'system:role:list', component: 'system/role/index', status: true, createTime: '2026-01-01 12:00:00' },
  ]);

  const handleAdd = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEdit = (menu: any) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const menu = menus.find(m => m.id === selectedIds[0]);
      if (menu) handleEdit(menu);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该菜单吗？')) {
      setMenus(menus.filter(m => m.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个菜单吗？`)) {
      setMenus(menus.filter(m => !selectedIds.includes(m.id)));
      setSelectedIds([]);
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
  const [depts, setDepts] = useState([
    { id: 1, name: '总公司', sort: 1, status: true, createTime: '2026-01-01 12:00:00' },
    { id: 2, name: '研发部', sort: 1, status: true, createTime: '2026-01-01 12:00:00' },
    { id: 3, name: '市场部', sort: 2, status: true, createTime: '2026-01-01 12:00:00' },
  ]);

  const handleAdd = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dept: any) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const dept = depts.find(d => d.id === selectedIds[0]);
      if (dept) handleEdit(dept);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该部门吗？')) {
      setDepts(depts.filter(d => d.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个部门吗？`)) {
      setDepts(depts.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
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
  const [posts, setPosts] = useState([
    { id: 1, code: 'ceo', name: '董事长', sort: 1, status: true, createTime: '2026-01-01 12:00:00' },
    { id: 2, code: 'se', name: '软件工程师', sort: 2, status: true, createTime: '2026-01-01 12:00:00' },
    { id: 3, code: 'hr', name: '人事专员', sort: 3, status: true, createTime: '2026-01-01 12:00:00' },
  ]);

  const handleAdd = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const post = posts.find(p => p.id === selectedIds[0]);
      if (post) handleEdit(post);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该岗位吗？')) {
      setPosts(posts.filter(p => p.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个岗位吗？`)) {
      setPosts(posts.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
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
  const [dicts, setDicts] = useState([
    { id: 1, name: '出差事由', type: 'travel_reason', status: true, remark: '出差申请事由列表', createTime: '2026-01-01 12:00:00' },
    { id: 2, name: '成本中心', type: 'cost_center', status: true, remark: '部门成本中心代码', createTime: '2026-01-01 12:00:00' },
    { id: 3, name: '通知类型', type: 'sys_notice_type', status: true, remark: '通知公告类型', createTime: '2026-01-01 12:00:00' },
  ]);

  const handleAdd = () => {
    setEditingDict(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dict: any) => {
    setEditingDict(dict);
    setIsModalOpen(true);
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const dict = dicts.find(d => d.id === selectedIds[0]);
      if (dict) handleEdit(dict);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该字典吗？')) {
      setDicts(dicts.filter(d => d.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedIds.length} 个字典吗？`)) {
      setDicts(dicts.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
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

  const handleConfirm = (data: any) => {
    if (modalMode === 'add') {
      const newNotice = {
        ...data,
        id: notices.length + 1,
        creator: 'admin',
        createTime: new Date().toLocaleString(),
        isNew: true
      };
      setNotices([newNotice, ...notices]);
    } else {
      setNotices(notices.map(n => n.id === selectedNotice.id ? { ...n, ...data } : n));
    }
    setIsModalOpen(false);
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
            <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center gap-2">
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
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1">
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
