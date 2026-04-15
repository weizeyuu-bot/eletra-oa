import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n';
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

const DEPT_RESEARCH = '\u7814\u53d1\u90e8';
const DEPT_MARKETING = '\u5e02\u573a\u90e8';
const DEPT_FINANCE = '\u8d22\u52a1\u90e8';
const NOTICE_TYPE_NOTICE = '\u901a\u77e5';
const NOTICE_TYPE_ANNOUNCEMENT = '\u516c\u544a';

interface PageProps {
  title: string;
}

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
    {children}
  </th>
);

const SearchBar = ({ children }: { children: React.ReactNode }) => {
  const { t } = useI18n();
  return (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
    {children}
    <div className="flex gap-2 ml-auto">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
          <Search className="w-4 h-4" /> {t('search')}
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> {t('reset')}
        </button>
    </div>
  </div>
  );
};

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
}) => {
  const { t } = useI18n();
  return (
    <div className="flex gap-2 mb-4">
    <button 
      onClick={onAdd}
      className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center gap-2"
    >
      <Plus className="w-4 h-4" /> {t('add')}
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
      <Edit2 className="w-4 h-4" /> {t('edit')}
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
      <Trash2 className="w-4 h-4" /> {t('remove')}
    </button>
    <button 
      onClick={onExport}
      className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-medium hover:bg-orange-100 transition-all flex items-center gap-2 ml-auto"
    >
      <Download className="w-4 h-4" /> {t('export')}
    </button>
    </div>
  );
};

const StatusBadge = ({ status }: { status: boolean }) => {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
    }`}>
      {status ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status ? t('statusNormal') : t('statusDisabled')}
    </span>
  );

};

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
    const { t } = useI18n();
    if (!password) return { level: 0, text: t('passwordStrengthNone'), color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Za-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: 1, text: t('passwordStrengthWeak'), color: 'bg-red-400' };
    if (score <= 2) return { level: 2, text: t('passwordStrengthMedium'), color: 'bg-yellow-400' };
    if (score <= 3) return { level: 3, text: t('passwordStrengthGood'), color: 'bg-blue-500' };
    return { level: 4, text: t('passwordStrengthStrong'), color: 'bg-green-500' };
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
            {mode === 'add' ? t('userAddTitle') : t('userEditTitle')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('userAccount')}</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={t('userAccountPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('userPassword')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={mode === 'add' ? t('userPasswordPlaceholder') : t('userPasswordPlaceholderEmpty')}
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
                <p className="text-xs text-gray-500">{t('passwordRequireMsg')}: {strength.text}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('userConfirmPassword')}</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={mode === 'add' ? t('userPasswordPlaceholder') : t('userPasswordPlaceholderEmpty')}
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
              <label className="text-sm font-semibold text-gray-700">{t('userNickname')}</label>
              <input 
                type="text" 
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={t('userNicknamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('userDept')}</label>
              <select 
                value={formData.dept}
                onChange={(e) => setFormData({...formData, dept: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">{t('userSelectDept')}</option>
                <option value={DEPT_RESEARCH}>{t('deptResearch')}</option>
                <option value={DEPT_MARKETING}>{t('deptMarketing')}</option>
                <option value={DEPT_FINANCE}>{t('deptFinance')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('userPhone')}</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={t('userPhonePlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">{t('userDept')}</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  checked={formData.status}
                  onChange={() => setFormData({...formData, status: true})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-600">{t('statusNormal')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  checked={!formData.status}
                  onChange={() => setFormData({...formData, status: false})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="text-sm font-medium text-gray-600">{t('statusDisabled')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all">{t('cancel')}</button>
          <button onClick={() => onConfirm(formData)} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">{t('confirm')}</button>
        </div>
      </motion.div>
    </div>
  );
};

// 1. User management
export const UserManagement = ({ 
  title, 
  users, 
  setUsers 
}: PageProps & { 
  users: any[]; 
  setUsers: React.Dispatch<React.SetStateAction<any[]>> 
}) => {
  const { t } = useI18n();
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
    if (window.confirm(t('confirmDeleteUser'))) {
      userService.delete(String(id)).then(() => {
        setUsers(users.filter(u => u.id !== id));
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      }).catch(() => {
        alert(t('remove'));
      });
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0 && window.confirm(t('confirmBatchDeleteUsers').replace('{count}', String(selectedIds.length)))) {
      Promise.all(selectedIds.map((id) => userService.delete(String(id)))).then(() => {
        setUsers(users.filter(u => !selectedIds.includes(u.id)));
        setSelectedIds([]);
      }).catch(() => {
        alert(t('remove') + ' failed');
      });
    }
  };

  const handleConfirm = async (data: any) => {
    const passwordRule = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    const hasPasswordInput = !!data.password?.trim() || !!data.confirmPassword?.trim();

    if (modalMode === 'add' && !data.password?.trim()) {
      alert(t('userPasswordPlaceholder'));
      return;
    }

    if (modalMode === 'add' && !data.confirmPassword?.trim()) {
      alert(t('userConfirmPassword'));
      return;
    }

    if ((modalMode === 'add' || hasPasswordInput) && data.password !== data.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if ((modalMode === 'add' || hasPasswordInput) && !passwordRule.test(data.password || '')) {
      alert(t('passwordRequireMsg'));
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
        alert(typeof message === 'string' ? t('userAddFailedPrefix') + message : t('userAddFailedGeneric'));
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
        alert(t('userEditFailed'));
        return;
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{t('roleManageDescription')}</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('userNickname')}</label>
          <input type="text" placeholder={t('userNicknamePlaceholder')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('userPhone')}</label>
          <input type="text" placeholder={t('userPhonePlaceholder')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('userDept')}</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">{t('all')}</option>
            <option value="1">{t('statusNormal')}</option>
            <option value="0">{t('statusDisabled')}</option>
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
                <TableHeader>{t('userAccount')}</TableHeader>
                <TableHeader>{t('userNickname')}</TableHeader>
                <TableHeader>{t('userDept')}</TableHeader>
                <TableHeader>{t('userPhone')}</TableHeader>
                <TableHeader>{t('statusNormal')}</TableHeader>
                <TableHeader>{t('expenseTableCreatedAt')}</TableHeader>
                <TableHeader>{t('expenseTableActions')}</TableHeader>
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
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
                      </button>
                      <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> {t('reset') ?? 'Reset'}
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

// 2. Role management
export const RoleManagement = ({ title }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRole | null>(null);
  const [permissionRole, setPermissionRole] = useState<SystemRole | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [menus, setMenus] = useState<Array<{ id: number; name: string; permission: string }>>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [filters, setFilters] = useState({ name: '', key: '', status: '' as '' | '1' | '0' });
  const [appliedFilters, setAppliedFilters] = useState({ name: '', key: '', status: '' as '' | '1' | '0' });
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    sort: 0,
    status: true,
  });

  const { t } = useI18n();

  const protectedRoleKeys = new Set(['sys:admin', 'super:admin']);

  const roleTemplates = [
    { name: t('roleTemplateSysAdmin'), key: 'sys:admin' },
    { name: t('roleTemplateApprover'), key: 'workflow:approver' },
    { name: t('roleTemplateFinance'), key: 'finance:operator' },
    { name: t('roleTemplateHr'), key: 'hr:operator' },
  ];

  const loadRoles = async () => {
    try {
      const data = await systemRoleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error(t('roleNotFound'), error);
      alert(t('roleNotFound'));
    }
  };

  const loadMenus = async () => {
    try {
      const data = await systemConfigService.getMenus();
      setMenus(data.map((m) => ({ id: m.id, name: m.name, permission: m.permission })));
    } catch (error) {
      console.error(t('noMenusToAssign'), error);
    }
  };

  useEffect(() => {
    loadRoles();
    loadMenus();
  }, []);

  const filteredRoles = useMemo(() => {
    const byName = appliedFilters.name.trim().toLowerCase();
    const byKey = appliedFilters.key.trim().toLowerCase();

    return roles.filter((role) => {
      const matchName = !byName || role.name.toLowerCase().includes(byName);
      const matchKey = !byKey || role.key.toLowerCase().includes(byKey);
      const matchStatus =
        appliedFilters.status === ''
          ? true
          : appliedFilters.status === '1'
          ? role.status
          : !role.status;
      return matchName && matchKey && matchStatus;
    });
  }, [roles, appliedFilters]);

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
    if (window.confirm(t('confirmDeleteUser'))) {
      await systemRoleService.delete(id);
      await loadRoles();
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length > 0 && window.confirm(t('confirmBatchDeleteUsers').replace('{count}', String(selectedIds.length)))) {
      const deletableIds = selectedIds.filter((id) => {
        const role = roles.find((r) => r.id === id);
        return role && !protectedRoleKeys.has(role.key);
      });

      if (deletableIds.length === 0) {
        alert(t('builtin') + ' - operation not allowed');
        return;
      }

      await Promise.all(deletableIds.map((id) => systemRoleService.delete(id)));
      await loadRoles();
      setSelectedIds([]);
    }
  };

  const handleConfirm = async () => {
    const normalizedName = formData.name.trim();
    const normalizedKey = formData.key.trim().toLowerCase();

    if (!normalizedName || !normalizedKey) {
      alert(t('roleName') + ' & ' + t('roleKey'));
      return;
    }

    if (normalizedName.length < 2 || normalizedName.length > 30) {
      alert(t('roleName') + ' length must be 2-30');
      return;
    }

    if (!/^[a-z][a-z0-9:_-]{2,49}$/.test(normalizedKey)) {
      alert(t('roleKey') + ' invalid, example: sys:admin, workflow:approver');
      return;
    }

    try {
      if (editingRole) {
        await systemRoleService.update(editingRole.id, {
          name: normalizedName,
          key: normalizedKey,
          sort: formData.sort,
          status: formData.status,
        });
      } else {
        await systemRoleService.create({
          name: normalizedName,
          key: normalizedKey,
          sort: formData.sort,
          status: formData.status,
        });
      }
      alert(t('roleSaveSuccess'));
      setIsModalOpen(false);
      await loadRoles();
    } catch (error) {
      console.error(t('roleSaveFailed') + ':', error);
      alert(t('roleSaveFailedDuplicate'));
    }
  };

  const handleSearch = () => {
    setAppliedFilters({ ...filters, name: filters.name.trim(), key: filters.key.trim() });
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    const empty = { name: '', key: '', status: '' as '' | '1' | '0' };
    setFilters(empty);
    setAppliedFilters(empty);
    setSelectedIds([]);
  };

  const handleOpenPermissions = async (role: SystemRole) => {
    try {
      const ids = await systemRoleService.getMenuIds(role.id);
      setPermissionRole(role);
      setSelectedMenuIds(ids);
      setIsPermissionModalOpen(true);
    } catch (error) {
      console.error(t('loadRoleMenuPermissionsFailed') + ':', error);
      alert(t('loadRoleMenuPermissionsFailed'));
    }
  };

  const handleSavePermissions = async () => {
    if (!permissionRole) return;

    setIsSavingPermissions(true);
    try {
      await systemRoleService.updateMenuIds(permissionRole.id, selectedMenuIds);
      alert(t('saveSuccess'));
      setIsPermissionModalOpen(false);
      setPermissionRole(null);
      setSelectedMenuIds([]);
    } catch (error) {
      console.error(t('saveRoleMenuPermissionsFailed') + ':', error);
      alert(t('saveRoleMenuPermissionsFailed'));
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{t('roleManageDescription')}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('roleName')}</label>
          <input
            type="text"
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t('roleNamePlaceholder')}
            className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('roleKey')}</label>
          <input
            type="text"
            value={filters.key}
            onChange={(e) => setFilters((prev) => ({ ...prev, key: e.target.value }))}
            placeholder={t('roleKeyPlaceholder')}
            className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('status')}</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as '' | '1' | '0' }))}
            className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">{t('all')}</option>
            <option value="1">{t('statusNormal')}</option>
            <option value="0">{t('statusDisabled')}</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> {t('search')}
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> {t('reset')}
          </button>
        </div>
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
                    checked={selectedIds.length === filteredRoles.length && filteredRoles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredRoles.map(r => r.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHeader>
                <TableHeader>{t('roleName')}</TableHeader>
                <TableHeader>{t('roleKey')}</TableHeader>
                <TableHeader>{t('roleOrder')}</TableHeader>
                <TableHeader>{t('status')}</TableHeader>
                <TableHeader>{t('createdAt')}</TableHeader>
                <TableHeader>{t('actions')}</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRoles.map((role) => (
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
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{role.name}</span>
                      {protectedRoleKeys.has(role.key) && (
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                          {t('builtin')}
                        </span>
                      )}
                    </div>
                  </td>
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
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
                      </button>
                      <button 
                        onClick={() => handleDelete(role.id)}
                        disabled={protectedRoleKeys.has(role.key)}
                        className={`font-medium text-sm flex items-center gap-1 ${
                          protectedRoleKeys.has(role.key)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
                      </button>
                      <button
                        onClick={() => handleOpenPermissions(role)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" /> {t('menuPermission') ?? t('menuPermissionTitle')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                    {t('roleNotFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Role Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingRole ? t('roleEditTitle') : t('roleAddTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('roleName')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('roleNamePlaceholder')} />
              </div>
              {!editingRole && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{t('roleTemplates')}</label>
                  <div className="flex flex-wrap gap-2">
                    {roleTemplates.map((tpl) => (
                      <button
                        key={tpl.key}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, name: tpl.name, key: tpl.key }))}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100"
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('roleKey')}</label>
                <input
                  type="text"
                  value={formData.key}
                  disabled={!!editingRole && protectedRoleKeys.has(editingRole.key)}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder={t('roleKeyInputPlaceholder')}
                />
                <p className="text-xs text-gray-400">{t('roleKeyHint')}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('roleOrder')}</label>
                <input type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: Number(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('roleOrderPlaceholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('status')}</label>
                <select
                  value={formData.status ? '1' : '0'}
                  disabled={!!editingRole && protectedRoleKeys.has(editingRole.key)}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value === '1' })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="1">{t('statusNormal')}</option>
                  <option value="0">{t('statusDisabled')}</option>
                </select>
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleConfirm} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">{t('confirm')}</button>
            </div>
          </motion.div>
        </div>
      )}

      {isPermissionModalOpen && permissionRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t('menuPermissionTitle').replace('{name}', permissionRole.name)}</h3>
              <button
                onClick={() => {
                  setIsPermissionModalOpen(false);
                  setPermissionRole(null);
                  setSelectedMenuIds([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {menus.length === 0 ? (
                <p className="text-sm text-gray-400">{t('noMenusToAssign')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {menus.map((menu) => (
                    <label key={menu.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMenuIds.includes(menu.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMenuIds((prev) => [...new Set([...prev, menu.id])]);
                          } else {
                            setSelectedMenuIds((prev) => prev.filter((id) => id !== menu.id));
                          }
                        }}
                        className="mt-1 rounded border-gray-300"
                      />
                      <span className="text-sm">
                        <span className="block text-gray-800 font-medium">{menu.name}</span>
                        <span className="block text-gray-400 text-xs">{menu.permission}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">{t('selectedMenuCount').replace('{count}', String(selectedMenuIds.length))}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsPermissionModalOpen(false);
                    setPermissionRole(null);
                    setSelectedMenuIds([]);
                  }}
                  className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSavingPermissions ? t('savingPermissions') : t('savePermissions')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 3. Menu management
export const MenuManagement = ({ title }: PageProps) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menus, setMenus] = useState<any[]>([]);

  const loadMenus = async () => {
    try {
      const data = await systemConfigService.getMenus();
      setMenus(data.map((m) => ({ ...m, createTime: new Date(m.createdAt).toLocaleString() })));
    } catch (error) {
      console.error(t('menuLoadFailed') + ':', error);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt(t('promptEnterMenuName'));
    if (!name) return;
    const permission = window.prompt(t('promptEnterPermission'), 'system:menu:list') || '';
    const component = window.prompt(t('promptEnterComponent'), 'system/menu/index') || '';
    const sortValue = window.prompt(t('promptEnterSort'), '1') || '1';

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
      console.error(t('menuAddFailed') + ':', error);
      alert(t('menuAddFailed'));
    }
  };

  const handleEdit = async (menu: any) => {
    const name = window.prompt(t('promptEnterMenuName'), menu.name);
    if (!name) return;
    const permission = window.prompt(t('promptEnterPermission'), menu.permission) || menu.permission;
    const component = window.prompt(t('promptEnterComponent'), menu.component) || menu.component;
    const sortValue = window.prompt(t('promptEnterSort'), String(menu.sort)) || String(menu.sort);

    try {
      await systemConfigService.updateMenu(menu.id, {
        name,
        permission,
        component,
        sort: Number(sortValue) || menu.sort,
      });
      await loadMenus();
    } catch (error) {
      console.error(t('menuEditFailed') + ':', error);
      alert(t('menuEditFailed'));
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const menu = menus.find(m => m.id === selectedIds[0]);
      if (menu) handleEdit(menu);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('menuDeleteConfirm'))) return;
    try {
      await systemConfigService.deleteMenu(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadMenus();
    } catch (error) {
      console.error(t('menuDeleteFailed') + ':', error);
      alert(t('menuDeleteFailed'));
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(t('menuBatchDeleteConfirm').replace('{count}', String(selectedIds.length))))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteMenu(id)));
      setSelectedIds([]);
      await loadMenus();
    } catch (error) {
      console.error(t('menuBatchDeleteFailed') + ':', error);
      alert(t('menuBatchDeleteFailed'));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{t('menuManageDescription')}</p>
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
                <TableHeader>{t('menuName')}</TableHeader>
                <TableHeader>{t('sort')}</TableHeader>
                <TableHeader>{t('permissionIdentifier')}</TableHeader>
                <TableHeader>{t('componentPath')}</TableHeader>
                <TableHeader>{t('status')}</TableHeader>
                <TableHeader>{t('createdAt')}</TableHeader>
                <TableHeader>{t('actions')}</TableHeader>
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
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> {t('add')}
                      </button>
                      <button 
                        onClick={() => handleDelete(menu.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
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
              <h3 className="text-xl font-bold text-gray-900">{editingMenu ? t('menuEditTitle') : t('menuAddTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('menuName')}</label>
                <input type="text" defaultValue={editingMenu?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('menuNamePlaceholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('componentPath')}</label>
                <input type="text" defaultValue={editingMenu?.component} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('menuComponentPlaceholder')} />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={() => { alert(t('saveSuccess')); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">{t('confirm')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 4. Department management
export const DeptManagement = ({ title }: PageProps) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [depts, setDepts] = useState<any[]>([]);

  const loadDepts = async () => {
    try {
      const data = await systemConfigService.getDepts();
      setDepts(data.map((d) => ({ ...d, createTime: new Date(d.createdAt).toLocaleString() })));
    } catch (error) {
      console.error(t('deptLoadFailed') + ':', error);
    }
  };

  useEffect(() => {
    loadDepts();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt(t('promptEnterDeptName'));
    if (!name) return;
    const sortValue = window.prompt(t('promptEnterDeptSort'), '1') || '1';

    try {
      await systemConfigService.createDept({
        name,
        sort: Number(sortValue) || 1,
        status: true,
      });
      await loadDepts();
    } catch (error) {
      console.error(t('deptAddFailed') + ':', error);
      alert(t('deptAddFailed'));
    }
  };

  const handleEdit = async (dept: any) => {
    const name = window.prompt(t('promptEnterDeptName'), dept.name);
    if (!name) return;
    const sortValue = window.prompt(t('promptEnterDeptSort'), String(dept.sort)) || String(dept.sort);

    try {
      await systemConfigService.updateDept(dept.id, {
        name,
        sort: Number(sortValue) || dept.sort,
      });
      await loadDepts();
    } catch (error) {
      console.error(t('deptEditFailed') + ':', error);
      alert(t('deptEditFailed'));
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const dept = depts.find(d => d.id === selectedIds[0]);
      if (dept) handleEdit(dept);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('deptDeleteConfirm') ?? t('deptDeleteFailed') ?? t('deptDeleteFailed'))) return;
    try {
      await systemConfigService.deleteDept(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadDepts();
    } catch (error) {
      console.error(t('deptDeleteFailed') + ':', error);
      alert(t('deptDeleteFailed'));
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(t('deptBatchDeleteConfirm').replace('{count}', String(selectedIds.length))))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteDept(id)));
      setSelectedIds([]);
      await loadDepts();
    } catch (error) {
      console.error(t('deptBatchDeleteConfirm') + ':', error);
      alert(t('deptBatchDeleteConfirm'));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{t('deptManageDescription')}</p>
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
                <TableHeader>{t('deptName')}</TableHeader>
                <TableHeader>{t('sort')}</TableHeader>
                <TableHeader>{t('status')}</TableHeader>
                <TableHeader>{t('createdAt')}</TableHeader>
                <TableHeader>{t('actions')}</TableHeader>
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
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> {t('add')}
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
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
              <h3 className="text-xl font-bold text-gray-900">{editingDept ? t('deptEditTitle') : t('deptAddTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('deptName')}</label>
                <input type="text" defaultValue={editingDept?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('promptEnterDeptName')} />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={() => { alert(t('saveSuccess')); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">{t('confirm')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 5. Post management
export const PostManagement = ({ title }: PageProps) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const loadPosts = async () => {
    try {
      const data = await systemConfigService.getPosts();
      setPosts(data.map((p) => ({ ...p, createTime: new Date(p.createdAt).toLocaleString() })));
    } catch (error) {
      console.error(t('postLoadFailed') + ':', error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAdd = async () => {
    const name = window.prompt(t('promptEnterPostName'));
    if (!name) return;
    const code = window.prompt(t('promptEnterPostCode'), '') || '';
    const sortValue = window.prompt(t('promptEnterSort'), '1') || '1';

    try {
      await systemConfigService.createPost({
        name,
        code,
        sort: Number(sortValue) || 1,
        status: true,
      });
      await loadPosts();
    } catch (error) {
      console.error(t('postAddFailed') + ':', error);
      alert(t('postAddFailed'));
    }
  };

  const handleEdit = async (post: any) => {
    const name = window.prompt(t('promptEnterPostName'), post.name);
    if (!name) return;
    const code = window.prompt(t('promptEnterPostCode'), post.code) || post.code;
    const sortValue = window.prompt(t('promptEnterSort'), String(post.sort)) || String(post.sort);

    try {
      await systemConfigService.updatePost(post.id, {
        name,
        code,
        sort: Number(sortValue) || post.sort,
      });
      await loadPosts();
    } catch (error) {
      console.error(t('postEditFailed') + ':', error);
      alert(t('postEditFailed'));
    }
  };

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const post = posts.find(p => p.id === selectedIds[0]);
      if (post) handleEdit(post);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('postDeleteConfirm'))) return;
    try {
      await systemConfigService.deletePost(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadPosts();
    } catch (error) {
      console.error(t('postDeleteFailed') + ':', error);
      alert(t('postDeleteFailed'));
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(t('postBatchDeleteConfirm').replace('{count}', String(selectedIds.length))))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deletePost(id)));
      setSelectedIds([]);
      await loadPosts();
    } catch (error) {
      console.error(t('postBatchDeleteFailed') + ':', error);
      alert(t('postBatchDeleteFailed'));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{t('postManageDescription')}</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('postCode')}</label>
          <input type="text" placeholder={t('promptEnterPostCode')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('postName')}</label>
          <input type="text" placeholder={t('promptEnterPostName')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('status')}</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">{t('all')}</option>
            <option value="1">{t('statusNormal')}</option>
            <option value="0">{t('statusDisabled')}</option>
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
                <TableHeader>{t('postCode')}</TableHeader>
                <TableHeader>{t('postName')}</TableHeader>
                <TableHeader>{t('displayOrder')}</TableHeader>
                <TableHeader>{t('status')}</TableHeader>
                <TableHeader>{t('createdAt')}</TableHeader>
                <TableHeader>{t('actions')}</TableHeader>
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
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
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
              <h3 className="text-xl font-bold text-gray-900">{editingPost ? t('postEditTitle') : t('postAddTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('postName')}</label>
                <input type="text" defaultValue={editingPost?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('promptEnterPostName')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('postCode')}</label>
                <input type="text" defaultValue={editingPost?.code} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('promptEnterPostCode')} />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={() => { alert(t('saveSuccess')); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">{t('confirm')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 6. Dictionary management
export const DictManagement = ({ title }: PageProps) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDict, setEditingDict] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dicts, setDicts] = useState<any[]>([]);
  const [dictForm, setDictForm] = useState({ name: '', type: '', remark: '', status: true });

  const loadDicts = async () => {
    try {
      const data = await systemConfigService.getDicts();
      setDicts(data.map((d) => ({ ...d, createTime: new Date(d.createdAt).toLocaleString() })));
    } catch (error) {
      console.error(t('dictLoadFailed') + ':', error);
    }
  };

  useEffect(() => {
    loadDicts();
  }, []);

  const uniqueTypes = useMemo(() => Array.from(new Set(dicts.map(d => d.type))).filter(Boolean), [dicts]);

  const handleAdd = async () => {
    setEditingDict(null);
    setDictForm({ name: '', type: '', remark: '', status: true });
    setIsModalOpen(true);
  };

  const handleEdit = async (dict: any) => {
    setEditingDict(dict);
    setDictForm({ name: dict.name || '', type: dict.type || '', remark: dict.remark || '', status: dict.status !== undefined ? dict.status : true });
    setIsModalOpen(true);
  };

  const TYPE_ALIASES: Record<string, string> = {
    expense_category: t('expenseCategory'),
    payment_method: t('paymentMethod'),
    cost_center: t('costCenter'),
  };

  const humanizeType = (t: string) => {
    if (!t) return '';
    return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Dropdown state for dictionary type selection in modal
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');
  const typeWrapperRef = useRef<HTMLDivElement | null>(null);

  const filteredTypes = useMemo(() => {
    const q = typeSearch.trim().toLowerCase();
    return uniqueTypes.filter(t => !q || t.toLowerCase().includes(q));
  }, [uniqueTypes, typeSearch]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (typeWrapperRef.current && !typeWrapperRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleHeaderEdit = () => {
    if (selectedIds.length === 1) {
      const dict = dicts.find(d => d.id === selectedIds[0]);
      if (dict) handleEdit(dict);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('dictDeleteConfirm'))) return;
    try {
      await systemConfigService.deleteDict(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadDicts();
    } catch (error) {
      console.error(t('dictDeleteFailed') + ':', error);
      alert(t('dictDeleteFailed'));
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(t('dictBatchDeleteConfirm').replace('{count}', String(selectedIds.length))))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteDict(id)));
      setSelectedIds([]);
      await loadDicts();
    } catch (error) {
      console.error(t('dictBatchDeleteFailed') + ':', error);
      alert(t('dictBatchDeleteFailed'));
    }
  };

  const handleModalConfirm = async () => {
    try {
      if (editingDict) {
        await systemConfigService.updateDict(editingDict.id, {
          name: dictForm.name,
          type: dictForm.type,
          remark: dictForm.remark,
          status: dictForm.status,
        });
      } else {
        await systemConfigService.createDict({
          name: dictForm.name,
          type: dictForm.type || 'sys_dict_type',
          remark: dictForm.remark,
          status: dictForm.status,
        });
      }
      setIsModalOpen(false);
      await loadDicts();
    } catch (error) {
      console.error(t('dictSaveFailed') + ':', error);
      alert(t('dictSaveFailed'));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{t('dictManageDescription')}</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('dictName')}</label>
          <input type="text" placeholder={t('promptEnterDictName')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('dictType')}</label>
          <input list="dict-types-filter" type="text" placeholder={t('dictTypePlaceholder')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          <datalist id="dict-types-filter">
            {uniqueTypes.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('status')}</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">{t('all')}</option>
            <option value="1">{t('statusNormal')}</option>
            <option value="0">{t('statusDisabled')}</option>
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
                <TableHeader>{t('dictName')}</TableHeader>
                <TableHeader>{t('dictType')}</TableHeader>
                <TableHeader>{t('status')}</TableHeader>
                <TableHeader>{t('remark')}</TableHeader>
                <TableHeader>{t('createdAt')}</TableHeader>
                <TableHeader>{t('actions')}</TableHeader>
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
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{TYPE_ALIASES[dict.type] || humanizeType(dict.type)}</div>
                    <div className="text-xs text-gray-500 font-mono">{dict.type}</div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={dict.status} /></td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{dict.remark}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{dict.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(dict)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
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
                            alert(t('dictDataManageRedirect').replace('{name}', dict.name));
                          }
                        }}
                      >
                        <Book className="w-3.5 h-3.5" /> {t('dictData')}
                      </button>
                      <button 
                        onClick={() => handleDelete(dict.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
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
              <h3 className="text-xl font-bold text-gray-900">{editingDict ? t('dictEditTitle') : t('dictAddTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('dictName')}</label>
                <input type="text" value={dictForm.name} onChange={(e) => setDictForm({...dictForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('promptEnterDictName')} />
              </div>
              <div className="space-y-2" ref={typeWrapperRef}>
                <label className="text-sm font-semibold text-gray-700">{t('dictType')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={typeSearch || dictForm.type}
                    onChange={(e) => { setTypeSearch(e.target.value); setTypeDropdownOpen(true); }}
                    onFocus={() => { setTypeDropdownOpen(true); setTypeSearch(''); }}
                    placeholder={t('dictTypePlaceholder')}
                    className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button type="button" onClick={() => { setTypeDropdownOpen(v => !v); setTypeSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none">
                      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {typeDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-auto">
                      <div className="px-3 py-2 border-b border-gray-50">
                        <input value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder={t('filterType')} />
                      </div>
                      <ul>
                        {filteredTypes.length === 0 && (
                          <li className="px-4 py-2 text-sm text-gray-500">{t('dictNoMatchedType')}</li>
                        )}
                        {filteredTypes.map((t) => (
                          <li key={t} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col" onClick={() => { setDictForm({...dictForm, type: t}); setTypeDropdownOpen(false); setTypeSearch(''); }}>
                            <div className="text-sm text-gray-900">{TYPE_ALIASES[t] || humanizeType(t)}</div>
                            <div className="text-xs text-gray-500 font-mono">{t}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('remark')}</label>
                <input type="text" value={dictForm.remark} onChange={(e) => setDictForm({...dictForm, remark: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={t('promptEnterDictRemark')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('status')}</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" checked={dictForm.status} onChange={() => setDictForm({...dictForm, status: true})} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="text-sm font-medium text-gray-600">{t('statusNormal')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" checked={!dictForm.status} onChange={() => setDictForm({...dictForm, status: false})} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="text-sm font-medium text-gray-600">{t('statusDisabled')}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleModalConfirm} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100">{t('confirm')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// 7. Notice management
const NoticeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  mode, 
  initialData,
  isSaving
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (data: any) => void;
  mode: 'add' | 'edit';
  initialData?: any;
  isSaving?: boolean;
}) => {
  const { t } = useI18n();
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || NOTICE_TYPE_NOTICE);
  const [status, setStatus] = useState(initialData?.status !== undefined ? initialData.status : true);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setType(initialData?.type || NOTICE_TYPE_NOTICE);
      setStatus(initialData?.status !== undefined ? initialData.status : true);
      if (editorRef.current) {
        if (initialData?.content && initialData.content !== t('noticeEditorPlaceholder')) {
          editorRef.current.innerHTML = initialData.content;
          setIsPlaceholder(false);
        } else {
          editorRef.current.innerHTML = t('noticeEditorPlaceholder');
          setIsPlaceholder(true);
        }
      }
    }
  }, [isOpen, initialData, t]);

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
      editorRef.current.innerHTML = t('noticeEditorPlaceholder');
      setIsPlaceholder(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const downloadMsg = t('attachmentDownloading').replace('{name}', file.name);
      const link = `<a href="#" class="text-blue-600 underline" onclick="event.preventDefault(); alert('${downloadMsg}');">[${t('attachment')}: ${file.name}]</a>&nbsp;`;
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
            {mode === 'add' ? t('noticeAddTitle') : t('noticeEditTitle')}
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
                <span className="text-red-500">*</span> {t('noticeTitle')}
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('promptEnterNoticeTitle')} 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span className="text-red-500">*</span> {t('type')}
              </label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
              >
                <option value="">{t('pleaseSelectType')}</option>
                <option value={NOTICE_TYPE_NOTICE}>{t('noticeTypeNotice')}</option>
                <option value={NOTICE_TYPE_ANNOUNCEMENT}>{t('noticeTypeAnnouncement')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">{t('status')}</label>
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
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{t('statusNormal')}</span>
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
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{t('closed')}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('content')}</label>
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
                    <option value="p">{t('text')}</option>
                    <option value="h1">{t('heading1')}</option>
                    <option value="h2">{t('heading2')}</option>
                  </select>
                </div>
                <div className="flex gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const color = prompt(t('promptEnterColor'), '#3b82f6');
                    if (color) execCommand('foreColor', color);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Type className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const color = prompt(t('promptEnterBgColor'), '#dbeafe');
                    if (color) execCommand('hiliteColor', color);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Palette className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><AlignRight className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><Eraser className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const url = prompt(t('promptEnterUrl'));
                    if (url) execCommand('createLink', url);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><LinkIcon className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    const url = prompt(t('promptEnterImageUrl'));
                    if (url) execCommand('insertImage', url);
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"><ImageIcon className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    imageInputRef.current?.click();
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600" title={t('uploadScreenshotImage')}><Camera className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }} className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600" title={t('uploadAttachment')}><Paperclip className="w-4 h-4" /></button>
                  <button type="button" onMouseDown={(e) => {
                    e.preventDefault();
                    alert(t('videoInsertInProgress'));
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
            disabled={isSaving}
            className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isSaving}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : null}
            {t('confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const NoticeManagement = ({ title, notices, setNotices, onMarkAsRead, onOpenNotice }: { title: string; notices: any[]; setNotices: (n: any[]) => void; onMarkAsRead: (id: number) => void; onOpenNotice: (notice: any) => void }) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [savingNotice, setSavingNotice] = useState(false);

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
      console.error(t('noticeLoadFailed') + ':', error);
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
    setSavingNotice(true);
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
    } catch (error: any) {
      console.error(t('noticeSaveFailed') + ':', error);
      const resp = error?.response?.data;
      const msg = resp?.message || error?.message || t('noticeSaveFailed');
      if (resp) {
        alert(`${t('noticeSaveFailedPrefix')}${msg}\n\n${JSON.stringify(resp, null, 2)}`);
      } else {
        alert(msg);
      }
    } finally {
      setSavingNotice(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('noticeDeleteConfirm'))) return;
    try {
      await systemConfigService.deleteNotice(id);
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      await loadNotices();
    } catch (error) {
      console.error(t('noticeDeleteFailed') + ':', error);
      alert(t('noticeDeleteFailed'));
    }
  };

  const handleBatchDelete = async () => {
    if (!(selectedIds.length > 0 && window.confirm(t('noticeBatchDeleteConfirm').replace('{count}', String(selectedIds.length))))) return;
    try {
      await Promise.all(selectedIds.map((id) => systemConfigService.deleteNotice(id)));
      setSelectedIds([]);
      await loadNotices();
    } catch (error) {
      console.error(t('noticeBatchDeleteFailed') + ':', error);
      alert(t('noticeBatchDeleteFailed'));
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
        <p className="text-gray-500 mt-1">{t('noticeManageDescription')}</p>
      </div>

      <SearchBar>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('noticeTitle')}</label>
          <input type="text" placeholder={t('promptEnterNoticeTitle')} className="w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('noticeType')}</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">{t('all')}</option>
            <option value="1">{t('noticeTypeNotice')}</option>
            <option value="2">{t('noticeTypeAnnouncement')}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('status')}</label>
          <select className="w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">{t('all')}</option>
            <option value="1">{t('statusNormal')}</option>
            <option value="0">{t('statusDisabled')}</option>
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
              <Plus className="w-4 h-4" /> {t('add')}
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
              <Edit2 className="w-4 h-4" /> {t('edit')}
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
              <Trash2 className="w-4 h-4" /> {t('remove')}
            </button>
            <button className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg font-medium hover:bg-orange-100 transition-all flex items-center gap-2 ml-auto">
              <Download className="w-4 h-4" /> {t('export')}
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
                <TableHeader>{t('noticeTitle')}</TableHeader>
                <TableHeader>{t('noticeType')}</TableHeader>
                <TableHeader>{t('status')}</TableHeader>
                <TableHeader>{t('creator')}</TableHeader>
                <TableHeader>{t('createdAt')}</TableHeader>
                <TableHeader>{t('actions')}</TableHeader>
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
                      notice.type === NOTICE_TYPE_NOTICE ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {notice.type === NOTICE_TYPE_NOTICE ? t('noticeTypeNotice') : notice.type === NOTICE_TYPE_ANNOUNCEMENT ? t('noticeTypeAnnouncement') : notice.type}
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
                        <Edit2 className="w-3.5 h-3.5" /> {t('edit')}
                      </button>
                      <button 
                        onClick={() => handleDelete(notice.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('remove')}
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
        isSaving={savingNotice}
      />
    </div>
  );
};
