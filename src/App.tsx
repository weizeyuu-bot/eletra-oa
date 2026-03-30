import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Grid,
  Star,
  Library,
  Users,
  Layers,
  Puzzle,
  Search,
  RotateCcw,
  Home,
  Plus,
  ChevronDown,
  X,
  PlusCircle,
  Trash2,
  Calendar,
  FileText,
  CreditCard,
  ShoppingCart,
  Briefcase,
  GraduationCap,
  Stamp,
  MessageSquare,
  Users2,
  Contact2,
  ShieldCheck,
  Bell,
  ArrowRight,
  ArrowLeft,
  Send,
  UserPlus,
  Building2,
  ChevronRight,
  Plane,
  BarChart3,
  Filter,
  Download,
  MoreHorizontal,
  Settings2,
  Workflow,
  Wallet,
  Package,
  Paperclip,
  Smile,
  Phone,
  Video,
  Sparkles,
  Maximize2,
  History,
  User,
  Clock,
  Languages,
  LayoutGrid,
  List,
  Edit2,
  Lock,
  Book,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Login } from './components/Login';
import { 
  UserManagement, RoleManagement, MenuManagement, 
  DeptManagement, PostManagement, DictManagement, 
  NoticeManagement 
} from './components/SystemManagement';
import { authService } from './services/auth';
import { userService } from './services/user';

// --- Types ---
type Notice = {
  id: number;
  title: string;
  type: string;
  status: boolean;
  creator: string;
  createTime: string;
  content: string;
  isNew?: boolean;
  isRead?: boolean;
};

type WorkflowStatus = '待审批' | '已通过' | '已驳回' | '待阅' | '草稿';

type WorkflowTab = 'pending' | 'submitted' | 'processed';

type TravelRequestDetail = {
  name: string;
  costCenter: string;
  reason: string;
  description: string;
  firstTravel: string;
  rg: string;
  cpf: string;
  birthDate: string;
  segments: { from: string; to: string; dateTime: string; transport: string }[];
  needBaggage: boolean;
  baggageQty: number;
  needHotel: boolean;
  hotelCity: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  hotelCost: string;
  needAdvance: boolean;
  currency: string;
  amount: string;
  bank: string;
  agency: string;
  account: string;
  pix: string;
  needVehicle: boolean;
  driver: string;
  coDriver: string;
  pickupLocation: string;
  pickupTime: string;
  returnLocation: string;
  returnTime: string;
};

type WorkflowRequest = {
  id: string;
  type: string;
  applicant: string;
  dept: string;
  createTime: string;
  status: WorkflowStatus;
  currentNode: string;
  approver: string;
  summary: string;
  travelDetail?: TravelRequestDetail;
};

type ChatItem = {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  type: 'group' | 'direct';
  avatar: string;
  userAccount?: string;
  signature?: string;
};

const createDefaultTravelDetail = (applicant: string, dept: string): TravelRequestDetail => ({
  name: applicant,
  costCenter: dept || 'FISCAL ELETRA',
  reason: '业务洽谈 (Negócios)',
  description: 'Alinhar processos operacionais, padronizar rotinas, fortalecer a comunicação entre as equipes e garantir a uniformidade na execução das atividades.',
  firstTravel: '否 (NÃO)',
  rg: '1815674-6',
  cpf: '832.776.332-68',
  birthDate: '1986/01/25',
  segments: [
    { from: 'MANAUS', to: 'CEARA', dateTime: '2026-03-08 08:25', transport: '飞机 (AÉREO)' },
    { from: 'CEARA', to: 'MANAUS', dateTime: '2026-03-20 14:20', transport: '飞机 (AÉREO)' },
  ],
  needBaggage: true,
  baggageQty: 2,
  needHotel: true,
  hotelCity: '-',
  hotelName: '-',
  checkIn: '-',
  checkOut: '-',
  hotelCost: '-',
  needAdvance: true,
  currency: 'BRL',
  amount: '1,320.00',
  bank: 'Itaú Unibanco',
  agency: '9651',
  account: '03756-7',
  pix: '83277633268',
  needVehicle: true,
  driver: applicant,
  coDriver: '-',
  pickupLocation: '-',
  pickupTime: '-',
  returnLocation: '-',
  returnTime: '-',
});

type Page = 'workbench' | 'apps' | 'apps-hr' | 'apps-finance' | 'apps-supply' | 'apps-hr-travel' | 'apps-hr-leave' | 'apps-hr-training' | 'apps-hr-stamp' | 'apps-finance-reimbursement' | 'apps-finance-payment' | 'apps-finance-invoice' | 'apps-supply-procurement' | 'apps-supply-requisition' | 'contacts' | 'chat' | 'approvals' | 'travel-request' | 'reports' | 'reports-hr' | 'reports-finance' | 'reports-supply' | 'reports-hr-travel' | 'reports-hr-attendance' | 'reports-finance-expense' | 'reports-supply-procurement' | 'workflow-config' | 'sys-mgmt' | 'sys-user' | 'sys-role' | 'sys-menu' | 'sys-dept' | 'sys-post' | 'sys-dict' | 'sys-notice';

// --- Mock Data ---
const INITIAL_NOTICES: Notice[] = [
  { id: 1, title: '关于2026年春节放假安排的通知', type: '通知', status: true, creator: 'admin', createTime: '2026-01-15 10:00:00', content: '新版本内容' },
  { id: 2, title: '系统维护升级公告', type: '公告', status: true, creator: 'admin', createTime: '2026-02-20 18:00:00', content: '系统维护升级公告内容' },
  { id: 3, title: '新员工入职培训指南', type: '通知', status: false, creator: 'admin', createTime: '2026-03-01 09:00:00', content: '新员工入职培训指南内容' },
];

const INITIAL_WORKFLOW_REQUESTS: WorkflowRequest[] = [
  {
    id: 'TR20260327001',
    type: '出差申请',
    applicant: '张三',
    dept: '市场部',
    createTime: '2026-03-27 09:20:00',
    status: '待审批',
    currentNode: '财务审批',
    approver: '李明',
    summary: '前往圣保罗拜访客户并进行业务洽谈',
    travelDetail: createDefaultTravelDetail('张三', '市场部'),
  },
  {
    id: 'SE20260326003',
    type: '用印申请',
    applicant: '王五',
    dept: '行政部',
    createTime: '2026-03-26 15:30:00',
    status: '待审批',
    currentNode: '行政审批',
    approver: '赵六',
    summary: '供应商合同文件盖章',
  },
  {
    id: 'RB20260325008',
    type: '报销申请',
    applicant: '管理员',
    dept: '研发部',
    createTime: '2026-03-25 11:40:00',
    status: '已通过',
    currentNode: '归档',
    approver: '李明',
    summary: '差旅报销 1320 BRL',
  },
  {
    id: 'PA20260324002',
    type: '付款申请',
    applicant: '李四',
    dept: '财务部',
    createTime: '2026-03-24 13:10:00',
    status: '已驳回',
    currentNode: '财务复核',
    approver: '管理员',
    summary: '供应商货款支付申请',
  },
];

const INITIAL_CHATS: ChatItem[] = [
  { id: 1, name: '项目协作群', lastMsg: '王严严：报销单已提交，请查收', time: '14:20', unread: 2, type: 'group', avatar: '项', signature: '报销节点处理中' },
  { id: 2, name: '李明 (财务)', lastMsg: '好的，收到', time: '10:05', unread: 0, type: 'direct', avatar: '李', userAccount: 'lisi', signature: '我在出差' },
  { id: 3, name: '供应链管理群', lastMsg: '张三：采购申请已通过', time: '昨天', unread: 0, type: 'group', avatar: '供', signature: '采购流程同步中' },
  { id: 4, name: '王五 (行政)', lastMsg: '用印申请已审批', time: '昨天', unread: 1, type: 'direct', avatar: '王', userAccount: 'wangwu', signature: '请假中' },
];

const CHAT_SIGNATURE_PRESETS = ['我在出差', '请假中', '开会中', '外出办事', '居家办公'];
const CHAT_SIGNATURES_STORAGE_KEY = 'eletra-chat-signatures';
const ONLINE_USERS_STORAGE_KEY = 'eletra-online-users';
const USER_AVATAR_STORAGE_PREFIX = 'eletra-user-avatar-';
const USER_STATUS_STORAGE_PREFIX = 'eletra-user-status-';

const normalizeAccount = (value?: string) => String(value || '').trim().toLowerCase();

const getOnlineUsersFromStorage = (): string[] => {
  try {
    const raw = window.localStorage.getItem(ONLINE_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeAccount(String(item))).filter(Boolean);
  } catch {
    return [];
  }
};

const saveOnlineUsersToStorage = (users: string[]) => {
  try {
    window.localStorage.setItem(ONLINE_USERS_STORAGE_KEY, JSON.stringify(Array.from(new Set(users))));
  } catch {
    // Ignore storage write failures.
  }
};

const markUserOnline = (username?: string) => {
  const normalized = normalizeAccount(username);
  if (!normalized) return;
  const users = getOnlineUsersFromStorage();
  if (!users.includes(normalized)) {
    saveOnlineUsersToStorage([...users, normalized]);
  }
};

const markUserOffline = (username?: string) => {
  const normalized = normalizeAccount(username);
  if (!normalized) return;
  const users = getOnlineUsersFromStorage();
  saveOnlineUsersToStorage(users.filter((item) => item !== normalized));
};

const getSignaturesFromStorage = (): Record<number, string> => {
  try {
    const raw = window.localStorage.getItem(CHAT_SIGNATURES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.entries(parsed || {}).reduce((acc, [key, value]) => {
      const id = Number(key);
      if (!Number.isNaN(id)) {
        acc[id] = String(value || '').trim() || '状态未设置';
      }
      return acc;
    }, {} as Record<number, string>);
  } catch {
    return {};
  }
};

const saveSignaturesToStorage = (signatures: Record<number, string>) => {
  try {
    window.localStorage.setItem(CHAT_SIGNATURES_STORAGE_KEY, JSON.stringify(signatures));
  } catch {
    // Ignore storage write failures.
  }
};

const getUserAvatarFromStorage = (username?: string): string => {
  const normalized = normalizeAccount(username);
  if (!normalized) return '';
  try {
    return window.localStorage.getItem(`${USER_AVATAR_STORAGE_PREFIX}${normalized}`) || '';
  } catch {
    return '';
  }
};

const saveUserAvatarToStorage = (username: string | undefined, avatarDataUrl: string) => {
  const normalized = normalizeAccount(username);
  if (!normalized) throw new Error('用户名无效，无法保存头像');
  try {
    window.localStorage.setItem(`${USER_AVATAR_STORAGE_PREFIX}${normalized}`, avatarDataUrl);
  } catch (e) {
    throw new Error('localStorage写入失败');
  }
};

const getUserStatusFromStorage = (username?: string): string => {
  const normalized = normalizeAccount(username);
  if (!normalized) return '状态未设置';
  try {
    const value = window.localStorage.getItem(`${USER_STATUS_STORAGE_PREFIX}${normalized}`) || '';
    return value.trim() || '状态未设置';
  } catch {
    return '状态未设置';
  }
};

const saveUserStatusToStorage = (username: string | undefined, statusText: string) => {
  const normalized = normalizeAccount(username);
  if (!normalized) return;
  try {
    window.localStorage.setItem(`${USER_STATUS_STORAGE_PREFIX}${normalized}`, statusText.trim() || '状态未设置');
  } catch {
    // Ignore storage write failures.
  }
};

const getChatTimeRank = (time: string) => {
  const now = new Date();
  const hhmm = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (hhmm) {
    const date = new Date(now);
    date.setHours(Number(hhmm[1]), Number(hhmm[2]), 0, 0);
    return date.getTime();
  }

  if (time.includes('昨天')) {
    return now.getTime() - 24 * 60 * 60 * 1000;
  }

  const parsed = Date.parse(time.replace(/\//g, '-'));
  return Number.isNaN(parsed) ? 0 : parsed;
};

// 简单 BMP (24-bit, 未压缩) 解析为 DataURL 的实现，用作浏览器无法直接解码 BMP 的回退方案。
const parseBmpArrayBufferToDataUrl = (buffer: ArrayBuffer): string => {
  const dv = new DataView(buffer);
  // BMP signature
  if (dv.getUint16(0, true) !== 0x4D42) throw new Error('不是有效的 BMP 文件');
  const fileSize = dv.getUint32(2, true);
  const pixelDataOffset = dv.getUint32(10, true);
  const dibHeaderSize = dv.getUint32(14, true);
  const width = dv.getInt32(18, true);
  const height = dv.getInt32(22, true);
  const planes = dv.getUint16(26, true);
  const bpp = dv.getUint16(28, true);
  const compression = dv.getUint32(30, true);
  if (bpp !== 24 || compression !== 0) throw new Error('仅支持 24-bit 未压缩 BMP');

  const rowSize = Math.floor((bpp * width + 31) / 32) * 4;
  const imageSize = rowSize * Math.abs(height);
  const pixelArray = new Uint8ClampedArray(width * Math.abs(height) * 4);

  const isBottomUp = height > 0;
  const absHeight = Math.abs(height);

  for (let y = 0; y < absHeight; y++) {
    const srcY = isBottomUp ? (absHeight - 1 - y) : y;
    const rowStart = pixelDataOffset + srcY * rowSize;
    for (let x = 0; x < width; x++) {
      const pxStart = rowStart + x * 3;
      const b = dv.getUint8(pxStart);
      const g = dv.getUint8(pxStart + 1);
      const r = dv.getUint8(pxStart + 2);
      const dstIdx = (y * width + x) * 4;
      pixelArray[dstIdx] = r;
      pixelArray[dstIdx + 1] = g;
      pixelArray[dstIdx + 2] = b;
      pixelArray[dstIdx + 3] = 255;
    }
  }

  // 绘制到 canvas 转为 dataURL
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = absHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布上下文');
  const imgData = new ImageData(pixelArray, width, absHeight);
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
};

const sortChatsByUnreadAndTime = (items: ChatItem[]) => {
  return [...items].sort((a, b) => {
    const unreadDelta = Number(b.unread > 0) - Number(a.unread > 0);
    if (unreadDelta !== 0) {
      return unreadDelta;
    }
    return getChatTimeRank(b.time) - getChatTimeRank(a.time);
  });
};

const ORG_STRUCTURE = [
  { name: '总经办', count: 5, children: [] },
  { name: '研发中心', count: 42, children: ['前端组', '后端组', '移动端'] },
  { name: '市场部', count: 18, children: ['品牌组', '渠道组'] },
  { name: '财务部', count: 8, children: [] },
];

// --- Components ---

const Sidebar = ({ activePage, setActivePage }: { activePage: Page; setActivePage: (p: Page) => void }) => {
  const [isAppsExpanded, setIsAppsExpanded] = useState(true);
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  const [isSysExpanded, setIsSysExpanded] = useState(false);
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(false);
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>([]);

  const toggleSubItem = (id: string) => {
    setExpandedSubItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const menuItems = [
    { id: 'workbench', icon: LayoutDashboard, label: '门户首页' },
    { id: 'approvals', icon: ShieldCheck, label: '流程待办' },
    { 
      id: 'apps', 
      icon: Grid, 
      label: '单据申请',
      subItems: [
        { 
          id: 'apps-hr', 
          label: '人力与行政管理', 
          icon: Users,
          children: [
            { id: 'apps-hr-travel', label: '出差申请' },
            { id: 'apps-hr-leave', label: '请假申请' },
            { id: 'apps-hr-training', label: '培训申请' },
            { id: 'apps-hr-stamp', label: '用印申请' },
          ]
        },
        { 
          id: 'apps-finance', 
          label: '财务管理', 
          icon: Wallet,
          children: [
            { id: 'apps-finance-reimbursement', label: '报销申请' },
            { id: 'apps-finance-payment', label: '付款申请' },
            { id: 'apps-finance-invoice', label: '发票申请' },
          ]
        },
        { 
          id: 'apps-supply', 
          label: '供应链管理', 
          icon: Package,
          children: [
            { id: 'apps-supply-procurement', label: '采购申请' },
            { id: 'apps-supply-requisition', label: '领用申请' },
          ]
        },
      ]
    },
    { id: 'chat', icon: MessageSquare, label: '在线沟通' },
    { 
      id: 'reports', 
      icon: BarChart3, 
      label: '报表中心',
      subItems: [
        { 
          id: 'reports-hr', 
          label: '人力行政报表', 
          icon: Users,
          children: [
            { id: 'reports-hr-travel', label: '出差申请查询表' },
            { id: 'reports-hr-attendance', label: '考勤月度汇总表' },
          ]
        },
        { 
          id: 'reports-finance', 
          label: '财务报表', 
          icon: Wallet,
          children: [
            { id: 'reports-finance-expense', label: '费用报销统计表' },
          ]
        },
        { 
          id: 'reports-supply', 
          label: '供应链报表', 
          icon: Package,
          children: [
            { id: 'reports-supply-procurement', label: '采购执行明细表' },
          ]
        },
      ]
    },
    { 
      id: 'sys', 
      icon: Settings2, 
      label: '系统管理',
      subItems: [
        { id: 'sys-user', label: '用户管理' },
        { id: 'sys-role', label: '角色管理', icon: ShieldCheck },
        { id: 'sys-menu', label: '菜单管理', icon: Grid },
        { id: 'sys-dept', label: '部门管理', icon: Building2 },
        { id: 'sys-post', label: '岗位管理', icon: Briefcase },
        { id: 'sys-dict', label: '字典管理', icon: Library },
        { id: 'sys-notice', label: '通知公告管理', icon: Bell },
      ]
    },
    { 
      id: 'workflow-config', 
      icon: Workflow, 
      label: '流程配置',
      subItems: [
        { id: 'workflow-travel', label: '出差申请流程' },
        { id: 'workflow-expense', label: '费用报销流程' },
        { id: 'workflow-seal', label: '用印申请流程' },
        { id: 'workflow-procurement', label: '采购申请流程' },
      ]
    },
    { id: 'contacts', icon: Contact2, label: '通讯录' },
    { id: 'fav', icon: Star, label: '我的收藏' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">E</div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">eletra</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.subItems) {
                  if (item.id === 'apps') setIsAppsExpanded(!isAppsExpanded);
                  if (item.id === 'reports') setIsReportsExpanded(!isReportsExpanded);
                  if (item.id === 'sys') setIsSysExpanded(!isSysExpanded);
                  if (item.id === 'workflow-config') setIsWorkflowExpanded(!isWorkflowExpanded);
                  setActivePage(item.id as Page);
                } else {
                  setActivePage(item.id as Page);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activePage === item.id || (item.subItems && activePage.startsWith(item.id + '-')) || (item.id === 'sys' && activePage.startsWith('sys-'))
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activePage === item.id || (item.subItems && activePage.startsWith(item.id + '-')) || (item.id === 'sys' && activePage.startsWith('sys-')) ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.subItems && (
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  (item.id === 'apps' && isAppsExpanded) || 
                  (item.id === 'reports' && isReportsExpanded) || 
                  (item.id === 'sys' && isSysExpanded) ||
                  (item.id === 'workflow-config' && isWorkflowExpanded)
                  ? 'rotate-90' : ''
                }`} />
              )}
            </button>
            
            {item.subItems && (
              (item.id === 'apps' && isAppsExpanded) || 
              (item.id === 'reports' && isReportsExpanded) || 
              (item.id === 'sys' && isSysExpanded) ||
              (item.id === 'workflow-config' && isWorkflowExpanded)
            ) && (
              <div className="mt-1 ml-4 pl-4 border-l border-gray-100 space-y-1">
                {item.subItems.map((sub: any) => (
                  <div key={sub.id}>
                    <button
                      onClick={() => {
                        if (sub.children) {
                          toggleSubItem(sub.id);
                        } else {
                          setActivePage(sub.id as Page);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all ${
                        activePage === sub.id || (sub.children && activePage.startsWith(sub.id + '-'))
                          ? 'text-blue-600 font-medium bg-blue-50/50'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {sub.icon && <sub.icon className="w-4 h-4" />}
                        <span>{sub.label}</span>
                      </div>
                      {sub.children && (
                        <ChevronRight className={`w-3 h-3 transition-transform ${expandedSubItems.includes(sub.id) ? 'rotate-90' : ''}`} />
                      )}
                    </button>
                    
                    {sub.children && expandedSubItems.includes(sub.id) && (
                      <div className="mt-1 ml-4 pl-4 border-l border-gray-100 space-y-1">
                        {sub.children.map((child: any) => (
                          <button
                            key={child.id}
                            onClick={() => setActivePage(child.id as Page)}
                            className={`w-full flex items-center gap-3 px-4 py-1.5 rounded-lg text-[13px] transition-all ${
                              activePage === child.id
                                ? 'text-blue-600 font-medium bg-blue-50/30'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                            }`}
                          >
                            <div className="w-1 h-1 bg-current rounded-full opacity-40 shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-lg text-sm">
          <Library className="w-4 h-4" />
          帮助中心
        </button>
      </div>
    </aside>
  );
};

const Header = ({ user, onLogout, onGoHome, onUpdateAvatar, onUpdateStatus, onBellClick, onError, chats }: { user: any; onLogout: () => void; onGoHome: () => void; onUpdateAvatar: (avatarDataUrl: string) => void; onUpdateStatus: (statusText: string) => void; onBellClick?: () => void; onError: (err: { title: string; message: string } | null) => void; chats: ChatItem[] }) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [customStatus, setCustomStatus] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError({ title: '格式错误', message: '请选择图片文件' });
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onError({ title: '文件过大', message: '头像图片不能超过 2MB' });
      e.target.value = '';
      return;
    }
    // 先用 createObjectURL 验证图片在浏览器中是否能被正确解码
    const objectUrl = URL.createObjectURL(file);
    const imgTest = new Image();
    let validated = false;
    const clean = () => {
      try { URL.revokeObjectURL(objectUrl); } catch {}
    };
    imgTest.onload = () => {
      validated = true;
      clean();
      // 验证通过，再把文件读取为 data URL 存储
        const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        if (!result) {
          onError({ title: '读取失败', message: '图片读取失败，请重试' });
          return;
        }
        try {
          onUpdateAvatar(result);
        } catch (err) {
          onError({ title: '保存失败', message: '头像保存失败，请重试或更换图片' });
        }
      };
      reader.onerror = (ev) => {
        console.error('FileReader.onerror', { file, ev });
        onError({ title: '读取失败', message: `图片读取失败（文件：${file.name}），请重试` });
      };
      reader.readAsDataURL(file);
    };
    imgTest.onerror = () => {
      clean();
      console.error('头像验证失败，img.onerror', { file });
      // 如果是 BMP，尝试用内置解析器解析为 PNG（回退方案）
      const isBmp = file.type === 'image/bmp' || /\.bmp$/i.test(file.name);
      if (isBmp) {
        const abReader = new FileReader();
        abReader.onload = () => {
          try {
            const arrayBuffer = abReader.result as ArrayBuffer;
            const dataUrl = parseBmpArrayBufferToDataUrl(arrayBuffer);
            try { onUpdateAvatar(dataUrl); } catch (e) { onError({ title: '解析失败', message: 'BMP 解析失败，请转换为 PNG/JPEG' }); }
            return;
          } catch (err) {
            console.error('BMP 解析失败', err);
            onError({ title: 'BMP 解析失败', message: '图片无法加载或 BMP 格式不支持，请转换为 PNG/JPEG' });
            return;
          }
        };
        abReader.onerror = (ev) => {
          console.error('ArrayBuffer 读取失败', { ev, file });
          onError({ title: '读取失败', message: `图片读取失败（文件：${file.name}），请重试或转换为 PNG/JPEG` });
        };
        abReader.readAsArrayBuffer(file);
        return;
      }

      onError({ title: '加载失败', message: `图片内容无法加载（文件：${file.name}，类型：${file.type}，大小：${file.size} 字节）` });
    };
    imgTest.src = objectUrl;
    e.target.value = '';
  };

  const avatarFallbackText = (user?.username || 'U').slice(0, 1).toUpperCase();
  const statusText = (user?.statusSignature || '状态未设置').trim() || '状态未设置';

  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        statusMenuRef.current?.contains(e.target as Node) ||
        statusButtonRef.current?.contains(e.target as Node)
      ) return;
      setShowStatusMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStatusMenu]);

  const applyStatus = (value: string) => {
    const normalized = value.trim() || '状态未设置';
    onUpdateStatus(normalized);
    setShowStatusMenu(false);
    setCustomStatus('');
  };

  // 基于传入的 `chats` 计算未读总数（保证实时与 App 状态一致）
  const totalOnlineUnread = Array.isArray(chats) ? chats.reduce((sum, chat) => sum + (chat.unread || 0), 0) : 0;
  const onlineUnreadBadge = totalOnlineUnread > 99 ? '99+' : (totalOnlineUnread > 0 ? String(totalOnlineUnread) : '');

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索流程、公告、同事..."
            className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 mr-2">
            <Languages className="w-3.5 h-3.5 text-gray-400" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="text-blue-600 cursor-pointer">中</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">EN</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">PT</span>
            </div>
          </div>
          <div className="relative">
            <button
              className="relative focus:outline-none"
              title="在线沟通未读"
              onClick={onBellClick}
            >
              <Bell className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
              {onlineUnreadBadge && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow">
                  {onlineUnreadBadge}
                </span>
              )}
            </button>
          </div>
          <button onClick={onGoHome} title="返回门户首页" className="p-0.5 rounded hover:bg-gray-50 hover:text-blue-600 transition-colors">
            <Home className="w-5 h-5" />
          </button>
        </div>
      <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
        <button
          onClick={() => avatarInputRef.current?.click()}
          title="点击更换头像"
          className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium text-sm overflow-hidden border border-orange-200 hover:opacity-90 transition-opacity"
        >
          {user?.avatar ? (
              <img
              src={user.avatar}
              alt="用户头像"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                try { img.removeAttribute('src'); } catch {}
                try {
                  onUpdateAvatar('');
                } catch {}
                onError({ title: '头像加载失败', message: '头像加载失败，已恢复为默认头像' });
              }}
            />
          ) : (
            avatarFallbackText
          )}
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div className="flex flex-col relative">
          <span className="text-sm font-medium text-gray-700">{user?.nickname || '王严严'}</span>
          <div className="flex items-center gap-2">
            <button
              ref={statusButtonRef}
              onClick={() => setShowStatusMenu((prev) => !prev)}
              className="max-w-[120px] text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 truncate hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
              title="设置个性化签名状态"
            >
              {statusText}
            </button>
            <button onClick={onLogout} className="text-[10px] text-gray-400 hover:text-red-500 text-left transition-colors">退出登录</button>
          </div>
          {showStatusMenu && (
            <div ref={statusMenuRef} className="absolute top-11 right-0 z-30 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-3">
              <div className="text-[11px] text-gray-500 mb-2">个性化签名状态</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {CHAT_SIGNATURE_PRESETS.map((item) => (
                  <button
                    key={item}
                    onClick={() => applyStatus(item)}
                    className="px-2 py-1 text-[11px] rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-gray-500 mb-1">自定义状态</div>
              <div className="flex items-center gap-2">
                <input
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="例如：外出客户拜访"
                  className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={() => applyStatus(customStatus)}
                  className="h-8 px-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
};

const Workbench = ({ 
  onOpenForm, 
  onOpenApps, 
  onOpenApprovals,
  setActivePage, 
  notices, 
  onMarkAsRead, 
  onOpenNotice,
  currentUser,
  workflowRequests,
  chats,
  onOpenChat,
}: { 
  onOpenForm: () => void; 
  onOpenApps: () => void; 
  onOpenApprovals: (tab: WorkflowTab) => void;
  setActivePage: (p: Page) => void; 
  notices: Notice[]; 
  onMarkAsRead: (id: number) => void; 
  onOpenNotice: (notice: Notice) => void;
  currentUser: any;
  workflowRequests: WorkflowRequest[];
  chats: ChatItem[];
  onOpenChat: (chatId: number) => void;
}) => {
  const currentDisplayName = currentUser?.nickname || currentUser?.username || '管理员';
  const pendingCount = workflowRequests.filter(item => item.status === '待审批').length;
  const draftCount = workflowRequests.filter(item => item.status === '草稿').length;
  const unreadCount = workflowRequests.filter(item => item.status === '待阅').length;
  const submittedCount = workflowRequests.filter(item => item.applicant === currentDisplayName).length;
  const sortedChats = sortChatsByUnreadAndTime(chats);
  const onlineChats = sortedChats.slice(0, 2);
  const totalOnlineUnread = chats.reduce((sum, chat) => sum + chat.unread, 0);
  const onlineUnreadBadge = totalOnlineUnread > 99 ? '99+' : String(totalOnlineUnread);
  const quickWorkflowApps = [
    { name: '出差申请', icon: Plane, color: 'bg-blue-500', action: () => setActivePage('apps-hr-travel') },
    { name: '报销申请', icon: FileText, color: 'bg-orange-500', action: () => setActivePage('apps-finance-reimbursement') },
    { name: '请假申请', icon: Calendar, color: 'bg-sky-500', action: () => setActivePage('apps-hr-leave') },
    { name: '用印申请', icon: Stamp, color: 'bg-green-500', action: () => setActivePage('apps-hr-stamp') },
    { name: '付款申请', icon: CreditCard, color: 'bg-indigo-600', action: () => setActivePage('apps-finance-payment') },
    { name: '采购申请', icon: ShoppingCart, color: 'bg-purple-500', action: () => setActivePage('apps-supply-procurement') },
  ];
  const handleOpenOnlineChat = () => {
    const target = sortedChats.find(chat => chat.unread > 0) || sortedChats[0];
    if (target) {
      onOpenChat(target.id);
      return;
    }
    setActivePage('chat');
  };
  const noticePageSize = 10;
  const activeNotices = notices.filter(n => n.status);
  const totalNoticePages = Math.max(1, Math.ceil(activeNotices.length / noticePageSize));
  const [noticePage, setNoticePage] = useState(1);

  useEffect(() => {
    setNoticePage(prev => Math.min(prev, totalNoticePages));
  }, [totalNoticePages]);

  const pagedNotices = activeNotices.slice((noticePage - 1) * noticePageSize, noticePage * noticePageSize);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">下午好，<span className="text-blue-600">{currentUser?.nickname || '王严严'}</span></h1>
        <div className="text-sm text-gray-400">2026年3月26日 星期四</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: News & Pending */}
        <div className="lg:col-span-8 space-y-8">
          {/* News & Announcements */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-gray-800">新闻公告</h3>
              </div>
              <button 
                onClick={() => setActivePage('sys-notice')}
                className="text-gray-400 text-sm hover:text-blue-600 flex items-center gap-1"
              >
                更多 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {pagedNotices.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    onMarkAsRead(item.id);
                    onOpenNotice(item);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.type === '通知' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isNew && !item.isRead && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded flex items-center justify-center animate-pulse shrink-0">
                          NEW
                        </span>
                      )}
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors truncate">{item.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{item.createTime.split(' ')[0]}</span>
                </div>
              ))}

              {activeNotices.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-8">暂无公告数据</div>
              )}

              {activeNotices.length > 0 && (
                <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>共 {activeNotices.length} 条，第 {noticePage}/{totalNoticePages} 页</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNoticePage(prev => Math.max(1, prev - 1))}
                      disabled={noticePage === 1}
                      className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-600"
                    >
                      上一页
                    </button>
                    {Array.from({ length: totalNoticePages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setNoticePage(page)}
                        className={`px-2 py-1 rounded border ${noticePage === page ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-gray-200 hover:text-blue-600'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setNoticePage(prev => Math.min(totalNoticePages, prev + 1))}
                      disabled={noticePage === totalNoticePages}
                      className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-600"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">流程待办</h3>
              </div>
              <div className="flex gap-4">
                <span className="text-blue-600 text-sm font-bold border-b-2 border-blue-600 pb-1 cursor-pointer">待处理</span>
                <span className="text-gray-400 text-sm hover:text-gray-600 cursor-pointer">已处理</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '待审批', count: pendingCount, color: 'bg-blue-50 text-blue-600', action: () => onOpenApprovals('pending') },
                { label: '待填写', count: draftCount, color: 'bg-orange-50 text-orange-600', action: onOpenApps },
                { label: '待阅', count: unreadCount, color: 'bg-purple-50 text-purple-600', action: () => onOpenApprovals('processed') },
                { label: '我发起的', count: submittedCount, color: 'bg-green-50 text-green-600', action: () => onOpenApprovals('submitted') },
              ].map((task) => (
                <div key={task.label} onClick={task.action} className={`p-6 rounded-2xl ${task.color} text-center space-y-2 cursor-pointer hover:scale-105 transition-transform`}>
                  <div className="text-3xl font-bold">{task.count}</div>
                  <div className="text-xs opacity-80 font-medium">{task.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Quick Actions & Communication */}
        <div className="lg:col-span-4 space-y-8">
          {/* New Workflow (Quick Access) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">常用流程申请</h3>
              </div>
              <button
                onClick={onOpenApps}
                title="查看更多流程"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {quickWorkflowApps.map((app) => (
                <div key={app.name} onClick={app.action} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm`}>
                    <app.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] text-gray-600 font-medium">{app.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Online Communication */}
          <div onClick={handleOpenOnlineChat} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm cursor-pointer">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  在线沟通
                  {totalOnlineUnread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center font-bold">
                      {onlineUnreadBadge}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleOpenOnlineChat(); }} title="发消息" className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleOpenOnlineChat(); }} title="建群组" className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                  <Users2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {onlineChats.map((chat) => (
                <div key={chat.id} onClick={(e) => { e.stopPropagation(); onOpenChat(chat.id); }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800 truncate">{chat.name}</span>
                      <span className="text-[10px] text-gray-400">{chat.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{chat.lastMsg}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Org Structure / Address Book */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Contact2 className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-800">通讯录</h3>
              </div>
              <button onClick={() => setActivePage('contacts')} className="text-xs text-blue-600 font-medium">查看全部</button>
            </div>
            <div className="space-y-2">
              {ORG_STRUCTURE.slice(0, 3).map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                    <span className="text-sm text-gray-700">{dept.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{dept.count}人</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppCenter = ({ setActivePage, categoryFilter }: { setActivePage: (p: Page) => void; categoryFilter?: string }) => {
  const categories = [
    {
      id: 'apps-hr',
      title: '人力与行政管理',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      apps: [
        { id: 'apps-hr-leave', name: '请假申请', icon: Calendar, color: 'bg-blue-400' },
        { id: 'apps-hr-travel', name: '出差申请', icon: Plane, color: 'bg-blue-500' },
        { id: 'apps-hr-training', name: '培训申请', icon: GraduationCap, color: 'bg-gray-600' },
        { id: 'apps-hr-stamp', name: '用印申请', icon: Stamp, color: 'bg-green-500' },
      ]
    },
    {
      id: 'apps-finance',
      title: '财务管理',
      icon: Wallet,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      apps: [
        { id: 'apps-finance-reimbursement', name: '报销申请', icon: FileText, color: 'bg-indigo-600' },
        { id: 'apps-finance-payment', name: '付款申请', icon: CreditCard, color: 'bg-blue-500' },
        { id: 'apps-finance-invoice', name: '发票申请', icon: FileText, color: 'bg-orange-500' },
      ]
    },
    {
      id: 'apps-supply',
      title: '供应链管理',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      apps: [
        { id: 'apps-supply-procurement', name: '采购申请', icon: ShoppingCart, color: 'bg-purple-500' },
        { id: 'apps-supply-requisition', name: '领用申请', icon: Briefcase, color: 'bg-blue-700' },
      ]
    }
  ];

  const filteredCategories = categoryFilter 
    ? categories.filter(c => c.id === categoryFilter)
    : categories;

  const allApps = categories.flatMap(c => c.apps);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {categoryFilter ? filteredCategories[0]?.title : '单据申请'}
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">管理应用</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">新建应用</button>
        </div>
      </div>

      <div className="space-y-12">
        {categoryFilter ? (
          filteredCategories.map((category) => (
            <div key={category.title} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {category.apps.map((app) => (
                <div
                  key={app.name}
                  onClick={() => setActivePage(app.id as Page)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-center gap-4"
                >
                  <div className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <app.icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{app.name}</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {allApps.map((app) => (
              <div
                key={app.name}
                onClick={() => setActivePage(app.id as Page)}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-center gap-4"
              >
                <div className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <app.icon className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-gray-700">{app.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Chat = ({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  currentUser,
  onClose,
}: {
  chats: ChatItem[];
  setChats: React.Dispatch<React.SetStateAction<ChatItem[]>>;
  activeChatId: number;
  setActiveChatId: React.Dispatch<React.SetStateAction<number>>;
  currentUser: any;
  onClose: () => void;
}) => {

  const initMessages: Record<number, { sender: string; content: string; self: boolean; time: string; fileUrl?: string; fileName?: string; fileSize?: string }[]> = {
    1: [
      { sender: '李明 (财务)', content: '王严严，你提交的报销单我已经收到了，正在审核中。', self: false, time: '14:20' },
      { sender: '我', content: '好的，辛苦了！如果有问题随时联系我。', self: true, time: '14:21' },
      { sender: '张三', content: '大家注意，供应链管理群的采购申请流程有更新，请查看最新公告。', self: false, time: '14:22' },
    ],
    2: [
      { sender: '李明 (财务)', content: '好的，收到', self: false, time: '10:05' },
    ],
    3: [
      { sender: '张三', content: '采购申请已通过', self: false, time: '昨天' },
    ],
    4: [
      { sender: '王五 (行政)', content: '用印申请已审批', self: false, time: '昨天' },
    ],
  };

  const [selectedChatId, setSelectedChatId] = useState(activeChatId || chats[0]?.id || 0);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState(initMessages);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const signatureMenuRef = useRef<HTMLDivElement>(null);
  const signatureButtonRef = useRef<HTMLButtonElement>(null);
  const [showSignatureMenu, setShowSignatureMenu] = useState(false);
  const [customSignature, setCustomSignature] = useState('');
  const [onlineAccounts, setOnlineAccounts] = useState<string[]>(() => getOnlineUsersFromStorage());
  const [chatSignatures, setChatSignatures] = useState<Record<number, string>>(() => {
    const stored = getSignaturesFromStorage();
    const defaults = Object.fromEntries(chats.map((chat) => [chat.id, chat.signature || '状态未设置']));
    return { ...defaults, ...stored };
  });

  const isChatOnline = (chat: ChatItem) => {
    if (chat.type === 'group') return true;
    if (!chat.userAccount) return false;
    return onlineAccounts.includes(normalizeAccount(chat.userAccount));
  };

  const getChatStatusMeta = (chat: ChatItem) => {
    if (chat.type === 'group') {
      return {
        label: '群聊',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
        pulse: false,
      };
    }

    const online = isChatOnline(chat);
    return {
      label: online ? '在线' : '离线',
      dotClass: online ? 'bg-green-500' : 'bg-gray-400',
      textClass: online ? 'text-green-500' : 'text-gray-400',
      pulse: online,
    };
  };

  useEffect(() => {
    if (activeChatId) {
      setSelectedChatId(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    setOnlineAccounts(getOnlineUsersFromStorage());
  }, [currentUser?.username]);

  useEffect(() => {
    if (chats.length === 0) return;
    if (selectedChatId === 0) return;
    const exists = chats.some(c => c.id === selectedChatId);
    if (!exists) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    setChatSignatures((prev) => {
      const next: Record<number, string> = {};
      let changed = false;

      chats.forEach((chat) => {
        const signatureFromChat = chat.signature || '状态未设置';
        next[chat.id] = signatureFromChat;
        if (prev[chat.id] !== signatureFromChat) {
          changed = true;
        }
      });

      const prevIds = Object.keys(prev).length;
      if (!changed && prevIds === chats.length) {
        return prev;
      }
      return next;
    });
  }, [chats]);

  useEffect(() => {
    saveSignaturesToStorage(chatSignatures);
  }, [chatSignatures]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || event.key === ONLINE_USERS_STORAGE_KEY) {
        setOnlineAccounts(getOnlineUsersFromStorage());
      }
      if (!event.key || event.key === CHAT_SIGNATURES_STORAGE_KEY) {
        const latest = getSignaturesFromStorage();
        setChatSignatures((prev) => ({ ...prev, ...latest }));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const selectedStatus = selectedChat ? getChatStatusMeta(selectedChat) : null;
  const selectedSignature = selectedChat ? (chatSignatures[selectedChat.id] || '状态未设置') : '状态未设置';
  const canEditSelectedSignature = !!selectedChat && selectedChat.type === 'direct' && normalizeAccount(selectedChat.userAccount) === normalizeAccount(currentUser?.username);

  useEffect(() => {
    if (!canEditSelectedSignature) {
      setShowSignatureMenu(false);
    }
  }, [canEditSelectedSignature]);

  const handleSetSignature = (nextValue: string) => {
    if (!selectedChat) return;
    const normalized = nextValue.trim() || '状态未设置';

    setChatSignatures((prev) => ({ ...prev, [selectedChat.id]: normalized }));
    setChats((prev) => prev.map((chat) => (
      chat.id === selectedChat.id ? { ...chat, signature: normalized } : chat
    )));
    setShowSignatureMenu(false);
    setCustomSignature('');
  };

  const handleSaveCustomSignature = () => {
    if (!canEditSelectedSignature) return;
    handleSetSignature(customSignature);
  };

  const handleEditGroupName = () => {
    if (!selectedChat || selectedChat.type !== 'group') return;
    const nextName = window.prompt('请输入新的群聊名称', selectedChat.name);
    if (nextName === null) return;
    const normalized = nextName.trim();
    if (!normalized) {
      setAppError({ title: '输入错误', message: '群聊名称不能为空' });
      return;
    }
    setChats((prev) => prev.map((chat) => (
      chat.id === selectedChat.id ? { ...chat, name: normalized } : chat
    )));
  };

  const handleCloseCurrentConversation = () => {
    setSelectedChatId(0);
    setActiveChatId(0);
  };

  useEffect(() => {
    if (!selectedChat) return;
    setActiveChatId(selectedChat.id);
    setChats(prev => {
      let changed = false;
      const next = prev.map(c => {
        if (c.id === selectedChat.id && c.unread > 0) {
          changed = true;
          return { ...c, unread: 0 };
        }
        return c;
      });
      return changed ? next : prev;
    });
  }, [selectedChat, setActiveChatId, setChats]);

  React.useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        emojiPickerRef.current?.contains(e.target as Node) ||
        emojiButtonRef.current?.contains(e.target as Node)
      ) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!showSignatureMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        signatureMenuRef.current?.contains(e.target as Node) ||
        signatureButtonRef.current?.contains(e.target as Node)
      ) return;
      setShowSignatureMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSignatureMenu]);

  const EMOJIS = ['😀','😂','🥰','😎','🤔','😅','👍','🙏','🎉','❤️','🔥','✅','💪','🤝','😊','🥳','😢','😡','🤣','💯','👀','⭐','🚀','📌','📎','🗂️','📝','💬','📢','🔔'];

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'doc') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const fileUrl = URL.createObjectURL(file);
    const sizeKB = (file.size / 1024);
    const fileSize = sizeKB >= 1024 ? `${(sizeKB/1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
    if (!selectedChat) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), {
        sender: '我', content: '', self: true, time,
        fileUrl, fileName: file.name, fileSize
      }],
    }));
    e.target.value = '';
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    if (!selectedChat) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), { sender: '我', content: text, self: true, time }],
    }));
    setMessage('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">消息</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                <Users2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索聊天或同事..."
              className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortChatsByUnreadAndTime(chats)
            .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((chat) => (
            (() => {
              const status = getChatStatusMeta(chat);
              return (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChatId(chat.id);
                setActiveChatId(chat.id);
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
              }}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                chat.type === 'group' ? 'bg-indigo-500' : 'bg-blue-500'
              }`}>
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800 truncate">{chat.name}</span>
                  <span className="text-[10px] text-gray-400">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 truncate">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass} ${status.pulse ? 'animate-pulse' : ''}`}></span>
                  <span className={`text-[10px] ${status.textClass}`}>{status.label}</span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[140px]">
                    {chatSignatures[chat.id] || '状态未设置'}
                  </span>
                </div>
              </div>
            </div>
              );
            })()
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">暂无会话</div>
        ) : (
          <>
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${
              selectedChat.type === 'group' ? 'bg-indigo-500' : 'bg-blue-500'
            }`}>
              {selectedChat.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-gray-800">{selectedChat.name}</div>
                {selectedChat.type === 'group' && (
                  <button
                    onClick={handleEditGroupName}
                    title="编辑群聊名称"
                    className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className={`text-[10px] ${selectedStatus?.textClass || 'text-gray-400'} flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus?.dotClass || 'bg-gray-400'} ${selectedStatus?.pulse ? 'animate-pulse' : ''}`}></span>
                {selectedStatus?.label || '离线'}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full max-w-[220px] truncate">
                  {selectedSignature}
                </span>
                <div className="relative">
                  <button
                    ref={signatureButtonRef}
                    disabled={!canEditSelectedSignature}
                    onClick={() => setShowSignatureMenu((prev) => !prev)}
                    title={canEditSelectedSignature ? '设置签名' : '仅可修改自己的签名'}
                    className={`p-1 rounded-md transition-colors ${canEditSelectedSignature ? 'text-gray-400 hover:text-blue-600 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {showSignatureMenu && (
                    <div ref={signatureMenuRef} className="absolute top-7 left-0 z-20 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-3">
                      <div className="text-[11px] text-gray-500 mb-2">快捷签名</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {CHAT_SIGNATURE_PRESETS.map((item) => (
                          <button
                            key={item}
                            onClick={() => handleSetSignature(item)}
                            className="px-2 py-1 text-[11px] rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="text-[11px] text-gray-500 mb-1">自定义签名</div>
                      <div className="flex items-center gap-2">
                        <input
                          value={customSignature}
                          onChange={(e) => setCustomSignature(e.target.value)}
                          placeholder="例如：外出客户拜访"
                          className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          onClick={handleSaveCustomSignature}
                          className="h-8 px-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Phone className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
            <Video className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
            <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
            <button
              onClick={handleCloseCurrentConversation}
              title="关闭当前会话并返回聊天列表"
              className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {(chatMessages[selectedChat.id] || []).map((msg, idx) => {
            const isFile = !!msg.fileUrl;
            const fileCard = isFile ? (
              <a
                href={msg.fileUrl}
                download={msg.fileName}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2.5 transition-colors max-w-[280px] group"
              >
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{msg.fileName}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{msg.fileSize}</div>
                </div>
                <Download className="w-4 h-4 opacity-60 group-hover:opacity-100 shrink-0" />
              </a>
            ) : null;
            return msg.self ? (
              <div key={idx} className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">王</div>
                <div className="space-y-1 text-right">
                  <div className="text-[10px] text-gray-400 mr-1">{msg.time}</div>
                  <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-white text-sm shadow-sm">
                    {isFile ? fileCard : msg.content}
                  </div>
                </div>
              </div>
            ) : (
              <div key={idx} className="flex gap-3 max-w-[80%]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 ${selectedChat.type === 'group' ? 'bg-indigo-500' : 'bg-blue-500'}`}>{msg.sender.slice(0,1)}</div>
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 ml-1">{msg.sender} &middot; {msg.time}</div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-sm text-gray-700">
                    {isFile ? fileCard : msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="mb-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-lg flex flex-wrap gap-1.5 max-w-xs">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.zip,.rar"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.csv"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'doc')}
          />
          <div className="flex items-center gap-4 mb-4 text-gray-400">
            <button
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(v => !v)}
              title="表情"
              className={`p-1 rounded-lg transition-colors hover:text-blue-600 ${showEmojiPicker ? 'text-blue-600 bg-blue-50' : ''}`}
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="发送图片/文件"
              className="p-1 rounded-lg transition-colors hover:text-blue-600"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={() => docInputRef.current?.click()}
              title="发送文档"
              className="p-1 rounded-lg transition-colors hover:text-blue-600"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-end gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息（Enter 发送，Shift+Enter 换行）..."
              className="flex-1 bg-gray-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-blue-100 transition-all resize-none h-20"
            />
            <button
              onClick={handleSend}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

const TravelRequestDetailView = ({ request }: { request: WorkflowRequest }) => {
  const detail = request.travelDetail || createDefaultTravelDetail(request.applicant, request.dept);

  return (
    <div className="p-8 space-y-6 max-h-[72vh] overflow-y-auto text-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">流程编号</div>
          <div className="font-medium text-gray-800">{request.id}</div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">申请人</div>
          <div className="font-medium text-gray-800">{detail.name}</div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">状态</div>
          <div className="font-medium text-gray-800">{request.status}</div>
        </div>
      </div>

      <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-2 text-blue-600">
          <Users2 className="w-4 h-4" />
          <h3 className="text-sm font-bold">申请人信息</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><div className="text-gray-400 mb-1">姓名</div><div className="font-medium text-gray-800">{detail.name}</div></div>
          <div><div className="text-gray-400 mb-1">成本中心</div><div className="font-medium text-gray-800">{detail.costCenter}</div></div>
          <div><div className="text-gray-400 mb-1">出差事由</div><div className="font-medium text-gray-800">{detail.reason}</div></div>
          <div className="md:col-span-3"><div className="text-gray-400 mb-1">具体说明</div><div className="font-medium text-gray-800">{detail.description}</div></div>
          <div><div className="text-gray-400 mb-1">是否首次出差</div><div className="font-medium text-gray-800">{detail.firstTravel}</div></div>
          <div><div className="text-gray-400 mb-1">RG</div><div className="font-medium text-gray-800">{detail.rg}</div></div>
          <div><div className="text-gray-400 mb-1">CPF</div><div className="font-medium text-gray-800">{detail.cpf}</div></div>
          <div><div className="text-gray-400 mb-1">出生日期</div><div className="font-medium text-gray-800">{detail.birthDate}</div></div>
          <div><div className="text-gray-400 mb-1">提交时间</div><div className="font-medium text-gray-800">{request.createTime}</div></div>
          <div><div className="text-gray-400 mb-1">当前节点</div><div className="font-medium text-gray-800">{request.currentNode}</div></div>
          <div><div className="text-gray-400 mb-1">审批人</div><div className="font-medium text-gray-800">{request.approver}</div></div>
        </div>
      </div>

      <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-2 text-blue-600">
          <Plane className="w-4 h-4" />
          <h3 className="text-sm font-bold">行程段</h3>
        </div>
        <div className="p-6 space-y-4">
          {detail.segments.map((segment, index) => (
            <div key={`${segment.from}-${segment.to}-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <div><div className="text-gray-400 mb-1">出发地</div><div className="font-medium text-gray-800">{segment.from}</div></div>
              <div><div className="text-gray-400 mb-1">目的地</div><div className="font-medium text-gray-800">{segment.to}</div></div>
              <div><div className="text-gray-400 mb-1">日期时间</div><div className="font-medium text-gray-800">{segment.dateTime}</div></div>
              <div><div className="text-gray-400 mb-1">交通方式</div><div className="font-medium text-gray-800">{segment.transport}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-2 text-blue-600">
            <Briefcase className="w-4 h-4" />
            <h3 className="text-sm font-bold">行李</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div><div className="text-gray-400 mb-1">是否需要托运行李</div><div className="font-medium text-gray-800">{detail.needBaggage ? '是' : '否'}</div></div>
            <div><div className="text-gray-400 mb-1">数量</div><div className="font-medium text-gray-800">{detail.needBaggage ? `${detail.baggageQty} 件` : '-'}</div></div>
          </div>
        </div>
        <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-2 text-blue-600">
            <Home className="w-4 h-4" />
            <h3 className="text-sm font-bold">住宿</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div><div className="text-gray-400 mb-1">需要酒店</div><div className="font-medium text-gray-800">{detail.needHotel ? '是' : '否'}</div></div>
            <div><div className="text-gray-400 mb-1">入住城市</div><div className="font-medium text-gray-800">{detail.hotelCity}</div></div>
            <div><div className="text-gray-400 mb-1">酒店名称</div><div className="font-medium text-gray-800">{detail.hotelName}</div></div>
            <div><div className="text-gray-400 mb-1">预计费用</div><div className="font-medium text-gray-800">{detail.hotelCost}</div></div>
            <div><div className="text-gray-400 mb-1">入住时间</div><div className="font-medium text-gray-800">{detail.checkIn}</div></div>
            <div><div className="text-gray-400 mb-1">离开时间</div><div className="font-medium text-gray-800">{detail.checkOut}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-2 text-blue-600">
            <CreditCard className="w-4 h-4" />
            <h3 className="text-sm font-bold">费用与银行信息</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div><div className="text-gray-400 mb-1">需要预付款</div><div className="font-medium text-gray-800">{detail.needAdvance ? '是' : '否'}</div></div>
            <div><div className="text-gray-400 mb-1">币种</div><div className="font-medium text-gray-800">{detail.currency}</div></div>
            <div><div className="text-gray-400 mb-1">金额</div><div className="font-medium text-gray-800">{detail.amount}</div></div>
            <div><div className="text-gray-400 mb-1">银行</div><div className="font-medium text-gray-800">{detail.bank}</div></div>
            <div><div className="text-gray-400 mb-1">网点</div><div className="font-medium text-gray-800">{detail.agency}</div></div>
            <div><div className="text-gray-400 mb-1">账号</div><div className="font-medium text-gray-800">{detail.account}</div></div>
            <div className="col-span-2"><div className="text-gray-400 mb-1">PIX</div><div className="font-medium text-gray-800">{detail.pix}</div></div>
          </div>
        </div>
        <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-2 text-blue-600">
            <RotateCcw className="w-4 h-4 rotate-90" />
            <h3 className="text-sm font-bold">车辆租赁</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div><div className="text-gray-400 mb-1">需要租车</div><div className="font-medium text-gray-800">{detail.needVehicle ? '是' : '否'}</div></div>
            <div><div className="text-gray-400 mb-1">主驾驶</div><div className="font-medium text-gray-800">{detail.driver}</div></div>
            <div><div className="text-gray-400 mb-1">副驾驶</div><div className="font-medium text-gray-800">{detail.coDriver}</div></div>
            <div><div className="text-gray-400 mb-1">取车地点</div><div className="font-medium text-gray-800">{detail.pickupLocation}</div></div>
            <div><div className="text-gray-400 mb-1">取车时间</div><div className="font-medium text-gray-800">{detail.pickupTime}</div></div>
            <div><div className="text-gray-400 mb-1">还车地点</div><div className="font-medium text-gray-800">{detail.returnLocation}</div></div>
            <div className="col-span-2"><div className="text-gray-400 mb-1">还车时间</div><div className="font-medium text-gray-800">{detail.returnTime}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApprovalGroups = ({
  workflowRequests,
  currentUser,
  initialTab,
  onApprove,
  onReject,
}: {
  workflowRequests: WorkflowRequest[];
  currentUser: any;
  initialTab: WorkflowTab;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  const [tab, setTab] = useState<WorkflowTab>(initialTab);
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const currentDisplayName = currentUser?.nickname || currentUser?.username || '管理员';
  const pendingItems = workflowRequests.filter(item => item.status === '待审批');
  const submittedItems = workflowRequests.filter(item => item.applicant === currentDisplayName);
  const processedItems = workflowRequests.filter(item => item.status !== '待审批');
  const visibleItems = tab === 'pending' ? pendingItems : tab === 'submitted' ? submittedItems : processedItems;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">流程待办中心</h2>
          <p className="text-sm text-gray-400 mt-1">统一处理待审批、我发起和已处理流程</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {[
            { id: 'pending', label: `待审批 ${pendingItems.length}` },
            { id: 'submitted', label: `我发起的 ${submittedItems.length}` },
            { id: 'processed', label: `已处理 ${processedItems.length}` },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as WorkflowTab)}
              className={`px-4 py-2 rounded-xl transition-colors ${tab === item.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">流程列表</h3>
          </div>
          <span className="text-sm text-gray-400">共 {visibleItems.length} 条</span>
        </div>
        <div className="divide-y divide-gray-100">
          {visibleItems.length === 0 && (
            <div className="py-16 text-center text-gray-400">当前分类暂无流程记录</div>
          )}
          {visibleItems.map(item => (
            <div key={item.id} className="px-6 py-5 flex items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <button onClick={() => setSelectedRequest(item)} className="text-sm font-bold text-gray-800 hover:text-gray-600 transition-colors">{item.type}</button>
                  <span className="text-xs text-gray-400">{item.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === '待审批' ? 'bg-blue-100 text-blue-600' : item.status === '已通过' ? 'bg-green-100 text-green-600' : item.status === '已驳回' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {item.status}
                  </span>
                </div>
                <button onClick={() => setSelectedRequest(item)} className="text-sm text-blue-500 truncate hover:text-blue-700 transition-colors text-left max-w-full">{item.summary}</button>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                  <span>申请人：{item.applicant}</span>
                  <span>部门：{item.dept}</span>
                  <span>当前节点：{item.currentNode}</span>
                  <span>审批人：{item.approver}</span>
                  <span>提交时间：{item.createTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setSelectedRequest(item)} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-colors">查看</button>
                {tab === 'pending' && (
                  <>
                    <button onClick={() => onReject(item.id)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors">驳回</button>
                    <button onClick={() => onApprove(item.id)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">同意</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className={`bg-white w-full ${selectedRequest.type === '出差申请' ? 'max-w-5xl' : 'max-w-2xl'} rounded-3xl shadow-2xl overflow-hidden`}
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <div className="text-lg font-bold text-gray-800">{selectedRequest.type}</div>
                  <div className="text-sm text-gray-400 mt-1">{selectedRequest.id}</div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {selectedRequest.type === '出差申请' ? (
                <TravelRequestDetailView request={selectedRequest} />
              ) : (
                <div className="p-8 grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">申请人</div>
                    <div className="font-medium text-gray-800">{selectedRequest.applicant}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">部门</div>
                    <div className="font-medium text-gray-800">{selectedRequest.dept}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">当前节点</div>
                    <div className="font-medium text-gray-800">{selectedRequest.currentNode}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">审批人</div>
                    <div className="font-medium text-gray-800">{selectedRequest.approver}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-400 mb-1">摘要</div>
                    <div className="font-medium text-gray-800">{selectedRequest.summary}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">提交时间</div>
                    <div className="font-medium text-gray-800">{selectedRequest.createTime}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">状态</div>
                    <div className="font-medium text-gray-800">{selectedRequest.status}</div>
                  </div>
                </div>
              )}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                {selectedRequest.status === '待审批' && (
                  <>
                    <button onClick={() => { onReject(selectedRequest.id); setSelectedRequest(null); }} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors">驳回</button>
                    <button onClick={() => { onApprove(selectedRequest.id); setSelectedRequest(null); }} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">审批通过</button>
                  </>
                )}
                <button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">关闭</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LeaveRequestForm = ({ onBack, title = '请假申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (1)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button type="button" onClick={() => { setAppNotice({ type: 'success', message: '草稿已保存' }); onBack(); }} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button type="button" onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button type="button" onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }} className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            提交
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-orange-600">
              <Users2 className="w-4 h-4" />
              <h3 className="text-sm font-bold">基本信息 (INFORMAÇÕES BÁSICAS)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">姓名 (Nome)</label>
                <input type="text" defaultValue="王严严" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">部门 (Departamento)</label>
                <input type="text" defaultValue="财务部" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">请假类型 (Tipo de Licença)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>事假 (Licença Particular)</option>
                  <option>病假 (Licença Médica)</option>
                  <option>年假 (Férias Anuais)</option>
                  <option>婚假 (Licença Casamento)</option>
                  <option>产假 (Licença Maternidade)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">开始时间 (Início)</label>
                <div className="relative">
                  <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">结束时间 (Término)</label>
                <div className="relative">
                  <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">时长 (Duração - Dias/Horas)</label>
                <input type="text" placeholder="例如: 2天" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">请假原因 (Motivo)</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="请详细说明请假原因..." />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">附件 (Anexos)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all cursor-pointer">
                  <Paperclip className="w-6 h-6" />
                  <span className="text-xs font-bold">点击或拖拽上传证明文件 (如病假条)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:49:59
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            提交
          </button>
        </div>
      </div>
    </div>
  );
};

const TrainingRequestForm = ({ onBack, title = '培训申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (0)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            提交
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-green-600">
              <FileText className="w-4 h-4" />
              <h3 className="text-sm font-bold">培训详情 (DETALHES DO TREINAMENTO)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">培训名称 (Nome do Treinamento)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="请输入培训课程名称" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">培训类别 (Categoria)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>内部培训 (Interno)</option>
                  <option>外部培训 (Externo)</option>
                  <option>线上课程 (Online)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">开始时间 (Início)</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">结束时间 (Término)</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">预估费用 (Custo Estimado)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                  <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">培训目标与内容 (Objetivos e Conteúdo)</label>
                <textarea rows={4} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="请描述培训的主要目标和涵盖的内容..." />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:50:15
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            提交
          </button>
        </div>
      </div>
    </div>
  );
};

const StampRequestForm = ({ onBack, title = '用印申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Stamp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (0)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            提交
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-red-600">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-sm font-bold">用印详情 (DETALHES DO CARIMBO)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">文件名称 (Nome do Documento)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="请输入需要盖章的文件全称" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">文件类别 (Tipo de Documento)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>合同协议 (Contrato)</option>
                  <option>证明文件 (Certificado)</option>
                  <option>公函 (Ofício)</option>
                  <option>人事类 (RH)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">印章类型 (Tipo de Carimbo)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>公司公章 (Selo da Empresa)</option>
                  <option>法人章 (Selo do Representante Legal)</option>
                  <option>合同专用章 (Selo de Contrato)</option>
                  <option>财务专用章 (Selo Financeiro)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">份数 (Número de Cópias)</label>
                <input type="number" defaultValue={1} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">是否外带? (Levar para fora?)</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="take_out" className="w-4 h-4 text-blue-600 border-gray-300" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">是 (SIM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="take_out" className="w-4 h-4 text-blue-600 border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">否 (NÃO)</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">用途说明 (Finalidade)</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="请详细说明该文件的用途..." />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">待盖章文件草案 (Rascunho do Documento)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all cursor-pointer">
                  <PlusCircle className="w-6 h-6" />
                  <span className="text-xs font-bold">点击或拖拽上传文件草案</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:50:30
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            提交
          </button>
        </div>
      </div>
    </div>
  );
};

const ReimbursementRequestForm = ({ onBack, title = '报销申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (3)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            提交
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-indigo-600">
              <Wallet className="w-4 h-4" />
              <h3 className="text-sm font-bold">报销详情 (DETALHES DO REEMBOLSO)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">报销类别 (Tipo de Despesa)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>差旅费 (Viagens)</option>
                  <option>招待费 (Entretenimento)</option>
                  <option>办公费 (Escritório)</option>
                  <option>通讯费 (Comunicação)</option>
                  <option>其他 (Outros)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">报销金额 (Valor)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                  <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">发生日期 (Data)</label>
                <input type="date" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">费用说明 (Descrição)</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="请详细说明费用产生的原因和用途..." />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">发票附件 (Anexos de Fatura)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all cursor-pointer">
                  <PlusCircle className="w-6 h-6" />
                  <span className="text-xs font-bold">点击或拖拽上传发票照片或PDF</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-indigo-600">
              <CreditCard className="w-4 h-4" />
              <h3 className="text-sm font-bold">收款账户 (CONTA BANCÁRIA)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">银行名称 (Banco)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="例如: Banco do Brasil" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">账号 (Número da Conta)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="00000-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:51:00
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            提交
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentRequestForm = ({ onBack, title = '付款申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (0)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            {t('submit')}
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
              <Workflow className="w-4 h-4" />
              <h3 className="text-sm font-bold">付款详情 (DETALHES DO PAGAMENTO)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">收款单位/个人 (Beneficiário)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="请输入收款方全称" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">付款金额 (Valor do Pagamento)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                  <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">付款时间 (Data e Hora de Pagamento)</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">付款方式 (Método)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>银行转账 (Transferência)</option>
                  <option>支票 (Cheque)</option>
                  <option>现金 (Dinheiro)</option>
                  <option>PIX</option>
                </select>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">付款用途 (Finalidade)</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="请详细说明付款原因..." />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:51:15
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            提交
          </button>
        </div>
      </div>
    </div>
  );
};

const InvoiceRequestForm = ({ onBack, title = '开票申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (0)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            {t('submit')}
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-orange-600">
              <FileText className="w-4 h-4" />
              <h3 className="text-sm font-bold">开票详情 (DETALHES DA FATURA)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">发票抬头 (Razão Social)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="请输入发票抬头" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">纳税人识别号 (CNPJ/CPF)</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">发票类型 (Tipo de Fatura)</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                  <option>增值税专用发票 (NF-e)</option>
                  <option>增值税普通发票 (NFS-e)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">开票金额 (Valor Total)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                  <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">开票项目 (Itens da Fatura)</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="请列出开票的具体项目和明细..." />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:51:30
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            提交
          </button>
        </div>
      </div>
    </div>
  );
};

const ProcurementRequestForm = ({ onBack, title = '采购申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (1)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            提交
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-purple-600">
              <Package className="w-4 h-4" />
              <h3 className="text-sm font-bold">{t('procurementDetails')}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('itemNameLabel')}</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder={t('itemNamePlaceholder')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('specificationLabel')}</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder={t('specificationPlaceholder')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('quantityLabel')}</label>
                <input type="number" defaultValue={1} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('estimatedUnitPriceLabel')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                  <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('desiredDeliveryDateTimeLabel')}</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('purchaseReasonLabel')}</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder={t('purchaseReasonPlaceholder')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:51:45
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: t('submitSuccess') }); onBack(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

const RequisitionRequestForm = ({ onBack, title = '领用申请', onSubmitRequest }: { onBack: () => void; title?: string; onSubmitRequest?: (title: string) => void }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (0)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            存草稿
          </button>
          <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            提交
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
              <Layers className="w-4 h-4" />
              <h3 className="text-sm font-bold">{t('requisitionDetails')}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('requisitionItemLabel')}</label>
                <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" placeholder={t('requisitionItemPlaceholder')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('requisitionQuantityLabel')}</label>
                <input type="number" defaultValue={1} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none" />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('requisitionPurposeLabel')}</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder={t('requisitionPurposePlaceholder')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 12:52:00
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => { setAppNotice({ type: 'success', message: '草稿已保存' }); onBack(); }}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            存草稿
          </button>
          <button 
            type="button"
            onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }}
            className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all"
          >
            提交并继续创建
          </button>
          <button 
            type="button"
            onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }}
            className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

const TravelRequestForm = ({ onBack, title = '出差申请单', currentUser, onSubmitRequest }: { onBack: () => void; title?: string; currentUser?: any; onSubmitRequest?: (title: string) => void }) => {
  const [needVehicle, setNeedVehicle] = useState(true);
  const [needBaggage, setNeedBaggage] = useState(true);
  const [needHotel, setNeedHotel] = useState(true);
  const [segments, setSegments] = useState([
    { id: 1, from: 'MANAUS', to: 'CEARA', dateTime: '2026-03-08T08:25' },
    { id: 2, from: 'CEARA', to: 'MANAUS', dateTime: '2026-03-20T14:20' },
  ]);

  const brazilCities = [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'CEARA'
  ];

  const costCenters = [
    'FISCAL ELETRA', 'RH', 'FINANCEIRO', 'OPERACIONAL', 'VENDAS', 'TI', 'LOGÍSTICA'
  ];

  const addSegment = () => {
    setSegments([...segments, { id: Date.now(), from: '', to: '', dateTime: '' }]);
  };

  const removeSegment = (id: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">创建记录</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> AI 助手
          </button>
          <button type="button" onClick={() => setAppNotice({ type: 'info', message: '打开草稿箱' }) } className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            <History className="w-3.5 h-3.5" /> 草稿箱 (2)
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button 
            type="button"
            onClick={() => { setAppNotice({ type: 'success', message: '草稿已保存' }); onBack(); }}
            className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            存草稿
          </button>
          <button 
            type="button"
            onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }}
            className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
          >
            提交并继续创建
          </button>
          <button 
            type="button"
            onClick={() => { onSubmitRequest?.(title); setAppNotice({ type: 'success', message: '提交成功' }); onBack(); }}
            className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all"
          >
            {t('submit')}
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Section: Applicant Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
              <Users2 className="w-4 h-4" />
              <h3 className="text-sm font-bold">{t('travelApplicantInfo')}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('fullNameLabel')}</label>
                <div className="relative">
                  <input type="text" defaultValue={currentUser?.nickname || currentUser?.username || ''} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                  <Search className="w-4 h-4 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('costCenterLabel')}</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none cursor-pointer appearance-none">
                  {costCenters.map(cc => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('travelReasonLabel')}</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none cursor-pointer appearance-none">
                  <option value="1">{t('travelReasonBusiness')}</option>
                  <option value="2">{t('travelReasonTechSupport')}</option>
                  <option value="3">{t('travelReasonInternalTraining')}</option>
                </select>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('detailDescriptionLabel')}</label>
                <textarea rows={3} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none resize-none" defaultValue="Alinhar processos operacionais, padronizar rotinas, fortalecer a comunicação entre as equipes e garantir a uniformidade na execução das atividades." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('firstTimeTravelLabel')}</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="first_time" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{t('yes')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="first_time" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{t('no')}</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">RG</label>
                <input type="text" defaultValue="1815674-6" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CPF</label>
                <input type="text" defaultValue="832.776.332-68" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dateOfBirthLabel')}</label>
                <div className="relative">
                  <input type="text" defaultValue="1986/01/25" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                  <Calendar className="w-4 h-4 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Travel Segments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <Building2 className="w-4 h-4" />
                <h3 className="text-sm font-bold">{t('travelSegments')}</h3>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('airTravel')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('busTravel')}</span>
                </label>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {segments.map((seg, index) => (
                <div key={seg.id} className="relative group">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded uppercase">{`${t('segmentLabel')} ${index + 1}`}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('originLabel')}</label>
                      <select className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-200 appearance-none cursor-pointer" defaultValue={seg.from}>
                        <option value="">{t('selectCity')}</option>
                        {brazilCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('destinationLabel')}</label>
                      <select className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-200 appearance-none cursor-pointer" defaultValue={seg.to}>
                        <option value="">{t('selectCity')}</option>
                        {brazilCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dateTimeLabel')}</label>
                      <input type="datetime-local" defaultValue={seg.dateTime} className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-200" />
                    </div>
                  </div>
                  {segments.length > 1 && (
                    <button 
                      onClick={() => removeSegment(seg.id)}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addSegment}
                className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm font-bold hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> {t('addSegment')}
              </button>
            </div>
          </div>

          {/* Section: Baggage & Hotel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
                <Briefcase className="w-4 h-4" />
                <h3 className="text-sm font-bold">{t('baggageTitle')}</h3>
              </div>
              <div className="p-6 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500" 
                    checked={needBaggage}
                    onChange={(e) => setNeedBaggage(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('needCheckedBaggageLabel')}</span>
                </label>
                
                <AnimatePresence>
                  {needBaggage && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('baggageQuantityLabel')}</label>
                        <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none cursor-pointer appearance-none">
                          {[...Array(11)].map((_, i) => (
                            <option key={i} value={i}>{`${i} ${t('pieceUnit')}`}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
                <Home className="w-4 h-4" />
                <h3 className="text-sm font-bold">{t('accommodationTitle')}</h3>
              </div>
              <div className="p-6 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500" 
                    checked={needHotel}
                    onChange={(e) => setNeedHotel(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('needHotelLabel')}</span>
                </label>
                
                <AnimatePresence>
                  {needHotel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('checkInCityLabel')}</label>
                            <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none appearance-none cursor-pointer">
                              <option value="">{t('selectCity')}</option>
                              {brazilCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('hotelNameLabel')}</label>
                            <input type="text" placeholder={t('hotelNamePlaceholder')} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('checkInTimeLabel')}</label>
                            <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('checkOutTimeLabel')}</label>
                            <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('estimatedCostLabel')}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                              <input type="number" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-8 pr-4 py-2 text-sm transition-all outline-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Section: Advance & Bank */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
              <CreditCard className="w-4 h-4" />
              <h3 className="text-sm font-bold">{t('advanceBankInfoTitle')}</h3>
            </div>
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('needAdvancePaymentLabel')}</span>
                </label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                    {t('selectedCurrency')}: BRL
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('currencyLabel')}</label>
                  <select className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none appearance-none">
                    <option value="BRL">BRL - Real</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="CNY">CNY - Yuan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('advanceAmountLabel')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                    <input type="text" defaultValue="1,320.00" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none font-mono" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('bankName')}</label>
                  <input type="text" defaultValue="Itaú Unibanco" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('branchLabel')}</label>
                  <input type="text" defaultValue="9651" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('accountNumber')}</label>
                  <input type="text" defaultValue="03756-7" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('pixKeyLabel')}</label>
                  <input type="text" defaultValue="83277633268" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Vehicle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-blue-600">
              <RotateCcw className="w-4 h-4 rotate-90" />
              <h3 className="text-sm font-bold">{t('vehicleRentalTitle')}</h3>
            </div>
            <div className="p-6 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500" 
                  checked={needVehicle}
                  onChange={(e) => setNeedVehicle(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('needVehicleRentalLabel')}</span>
              </label>
              
              <AnimatePresence>
                {needVehicle && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('primaryDriverLabel')}</label>
                        <input type="text" defaultValue="wyycst1120" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" placeholder={t('enterNamePlaceholder')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('additionalDriverLabel')}</label>
                        <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm transition-all outline-none" placeholder={t('fillIfAnyPlaceholder')} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('pickupLocationTimeLabel')}</label>
                          <div className="flex flex-col gap-2">
                            <input type="text" placeholder={t('pickupLocationPlaceholder')} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                            <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dropoffLocationTimeLabel')}</label>
                          <div className="flex flex-col gap-2">
                            <input type="text" placeholder={t('dropoffLocationPlaceholder')} className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                            <input type="datetime-local" className="w-full bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl px-4 py-2 text-sm transition-all outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          系统已自动保存草稿 19:37:59
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
            存草稿
          </button>
          <button className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all">
            提交并继续创建
          </button>
          <button className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

const AttendanceReport = () => {
  const { t } = useI18n();
  const data = [
    { id: 1, name: '王严严', dept: '财务部', month: '2026-03', normal: 21, late: 0, absent: 0, otNormal: 4.5, otWeekend: 0, leave: 0, status: '正常' },
    { id: 2, name: '吴勇', dept: '市场部', month: '2026-03', normal: 19, late: 2, absent: 0, otNormal: 12, otWeekend: 8, leave: 0, status: '异常' },
    { id: 3, name: '李浩宇', dept: '研发中心', month: '2026-03', normal: 20, late: 0, absent: 0, otNormal: 25, otWeekend: 16, leave: 1, status: '正常' },
    { id: 4, name: '张丽莉', dept: '财务部', month: '2026-03', normal: 21, late: 1, absent: 0, otNormal: 2, otWeekend: 0, leave: 0, status: '正常' },
    { id: 5, name: '王强', dept: '研发中心', month: '2026-03', normal: 18, late: 0, absent: 0, otNormal: 30, otWeekend: 12, leave: 3, status: '正常' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">{t('attendanceMonthlySummaryReport')}</h2>
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> {t('export')}
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('month')}</label>
          <input type="month" defaultValue="2026-03" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('department')}</label>
          <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none">
            <option value="">{t('allDepartments')}</option>
            <option value="财务部">{t('deptFinance')}</option>
            <option value="研发中心">{t('deptResearchCenter')}</option>
            <option value="市场部">{t('deptMarketing')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('name')}</label>
          <input type="text" placeholder={t('searchNamePlaceholder')} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="flex items-end">
          <button className="w-full bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">{t('queryReport')}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-r border-gray-100">{t('name')}</th>
              <th className="px-4 py-3 border-r border-gray-100">{t('department')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('attendanceDays')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('lateEarly')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('absence')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('overtimeWeekdayHours')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('overtimeWeekendHours')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('leaveDays')}</th>
              <th className="px-4 py-3">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 border-r border-gray-50 font-bold text-gray-700">{row.name}</td>
                <td className="px-4 py-3 border-r border-gray-50">{row.dept}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono">{row.normal}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono text-orange-600">{row.late}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono text-red-600">{row.absent}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono">{row.otNormal}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono">{row.otWeekend}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono">{row.leave}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    row.status === '正常' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {row.status === '正常' ? t('statusNormal') : t('statusAbnormal')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExpenseStatisticsReport = () => {
  const { t } = useI18n();
  const data = [
    { id: 1, dept: '研发中心', project: 'Eletra V2.0', category: '差旅费', amount: 12500.00, count: 8, budget: '85%', status: '正常' },
    { id: 2, dept: '市场部', project: '春季展会', category: '招待费', amount: 8900.50, count: 12, budget: '92%', status: '预警' },
    { id: 3, dept: '行政部', project: '日常办公', category: '办公用品', amount: 3200.00, count: 5, budget: '45%', status: '正常' },
    { id: 4, dept: '研发中心', project: '云平台迁移', category: '技术服务', amount: 45000.00, count: 2, budget: '78%', status: '正常' },
    { id: 5, dept: '财务部', project: '年度审计', category: '咨询费', amount: 15000.00, count: 1, budget: '105%', status: '超支' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">{t('expenseReimbursementStatsReport')}</h2>
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> {t('export')}
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('statisticsDimension')}</label>
          <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none">
            <option>{t('byDepartment')}</option>
            <option>{t('byProject')}</option>
            <option>{t('byExpenseCategory')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('timeRange')}</label>
          <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none">
            <option>{t('thisMonth')}</option>
            <option>{t('lastMonth')}</option>
            <option>{t('thisQuarter')}</option>
            <option>{t('thisYear')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('status')}</label>
          <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none">
            <option>{t('all')}</option>
            <option>{t('statusNormal')}</option>
            <option>{t('statusWarning')}</option>
            <option>{t('statusOverBudget')}</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">{t('generateStatistics')}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[900px]">
          <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-r border-gray-100">{t('deptOrProject')}</th>
              <th className="px-4 py-3 border-r border-gray-100">{t('expenseCategory')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-right">{t('reimbursementTotal')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('reimbursementCount')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('budgetExecutionRate')}</th>
              <th className="px-4 py-3">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 border-r border-gray-50">
                  <div className="font-bold text-gray-700">{row.dept}</div>
                  <div className="text-[10px] text-gray-400">{row.project}</div>
                </td>
                <td className="px-4 py-3 border-r border-gray-50">{row.category}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-right font-mono font-bold">
                  {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono">{row.count}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          parseInt(row.budget) > 100 ? 'bg-red-500' : parseInt(row.budget) > 90 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(parseInt(row.budget), 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] w-8">{row.budget}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    row.status === '正常' ? 'bg-green-100 text-green-600' : 
                    row.status === '预警' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {row.status === '正常' ? t('statusNormal') : row.status === '预警' ? t('statusWarning') : t('statusOverBudget')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProcurementDetailReport = () => {
  const { t } = useI18n();
  const data = [
    { id: 'PO202603001', item: 'MacBook Pro 14"', supplier: 'Apple Store', qty: 5, price: 15999.00, total: 79995.00, date: '2026-04-10', status: '进行中', progress: 60 },
    { id: 'PO202603002', item: 'Dell U2723QE', supplier: 'Dell China', qty: 10, price: 3899.00, total: 38990.00, date: '2026-04-05', status: '待发货', progress: 20 },
    { id: 'PO202603003', item: 'Herman Miller Aeron', supplier: 'HM Official', qty: 3, price: 12500.00, total: 37500.00, date: '2026-03-25', status: '已入库', progress: 100 },
    { id: 'PO202603004', item: 'Logitech MX Master 3S', supplier: 'JD.com', qty: 20, price: 699.00, total: 13980.00, date: '2026-03-28', status: '运输中', progress: 85 },
    { id: 'PO202603005', item: 'Cisco C9200L-24T-4G', supplier: 'Cisco Partner', qty: 2, price: 22000.00, total: 44000.00, date: '2026-04-20', status: '审批中', progress: 10 },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">{t('procurementExecutionDetailReport')}</h2>
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> {t('export')}
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('orderNumber')}</label>
          <input type="text" placeholder="PO..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('supplier')}</label>
          <input type="text" placeholder={t('searchSupplierPlaceholder')} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('executionStatus')}</label>
          <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none">
            <option>{t('all')}</option>
            <option>{t('statusInApproval')}</option>
            <option>{t('statusPendingShipment')}</option>
            <option>{t('statusInTransit')}</option>
            <option>{t('statusInStock')}</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">{t('queryDetails')}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
          <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-r border-gray-100">{t('orderNumber')}</th>
              <th className="px-4 py-3 border-r border-gray-100">{t('itemNameLabel')}</th>
              <th className="px-4 py-3 border-r border-gray-100">{t('supplier')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('quantityLabel')}</th>
              <th className="px-4 py-3 border-r border-gray-100 text-right">{t('estimatedUnitPriceLabel')} (R$)</th>
              <th className="px-4 py-3 border-r border-gray-100 text-right">{t('procurementTotalAmount')} (R$)</th>
              <th className="px-4 py-3 border-r border-gray-100 text-center">{t('expectedDelivery')}</th>
              <th className="px-4 py-3 border-r border-gray-100">{t('executionProgress')}</th>
              <th className="px-4 py-3">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 border-r border-gray-50 font-mono text-blue-600 font-bold">{row.id}</td>
                <td className="px-4 py-3 border-r border-gray-50 font-bold text-gray-700">{row.item}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-gray-500">{row.supplier}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-center font-mono">{row.qty}</td>
                <td className="px-4 py-3 border-r border-gray-50 text-right font-mono">
                  {row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 border-r border-gray-50 text-right font-mono font-bold">
                  {row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 border-r border-gray-50 text-center">{row.date}</td>
                <td className="px-4 py-3 border-r border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          row.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] w-8">{row.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    row.status === '已入库' ? 'bg-green-100 text-green-600' : 
                    row.status === '审批中' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {row.status === '已入库'
                      ? t('statusInStock')
                      : row.status === '审批中'
                        ? t('statusInApproval')
                        : row.status === '待发货'
                          ? t('statusPendingShipment')
                          : row.status === '运输中'
                            ? t('statusInTransit')
                            : t('statusInProgress')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TravelRequestReport = () => {
  const { t } = useI18n();
  const data = [
    { id: 1, name: '王严严', dept: 'FISCAL ELETRA', reason: '业务洽谈', desc: '世界那么大，我想去看看', isFirst: '是', rg: '3203212000060711', dob: '2000-06-07', cpf: '123.456.789-00',
      segments: 'MANAUS→CEARA / 2026-03-08 / 飞机', baggageQty: 2, baggage: true,
      needHotel: true, hotelCity: 'CEARA', hotelName: 'Hotel Center', checkIn: '2026-03-08 14:00', checkOut: '2026-03-20 11:00', hotelCost: 'R$1,200',
      needAdvance: true, currency: 'BRL', amount: 'R$1,320.00', bank: 'Itaú Unibanco', agency: '9651', account: '03756-7', pix: '83277633268',
      needVehicle: true, driver: '王严严', coDriver: '', pickupLoc: 'CEARA Airport', pickupTime: '2026-03-08 15:00', returnLoc: 'CEARA Airport', returnTime: '2026-03-20 10:00' },
    { id: 2, name: '吴勇', dept: '市场部', reason: '技术支持', desc: '需带样品一套', isFirst: '', rg: '4303021985110532', dob: '1985-11-05', cpf: '999.888.777-66',
      segments: 'SÃO PAULO→MANAUS / 2026-03-10 / 飞机', baggageQty: 1, baggage: false,
      needHotel: false, hotelCity: '', hotelName: '', checkIn: '', checkOut: '', hotelCost: '',
      needAdvance: false, currency: 'BRL', amount: '', bank: '', agency: '', account: '', pix: '',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
    { id: 3, name: '李浩宇', dept: '研发中心', reason: '内部培训', desc: '为期三天，需完成报告', isFirst: '', rg: '3301041999090938', dob: '1999-09-09', cpf: '666.777.555-88',
      segments: 'RIO→BRASÍLIA / 2026-03-12 / 飞机', baggageQty: 0, baggage: true,
      needHotel: true, hotelCity: 'Brasília', hotelName: 'Nacional Hotel', checkIn: '2026-03-12 15:00', checkOut: '2026-03-15 12:00', hotelCost: 'R$900',
      needAdvance: true, currency: 'BRL', amount: 'R$800.00', bank: 'Bradesco', agency: '1234', account: '56789-0', pix: '66677755588',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
    { id: 4, name: '张丽莉', dept: '财务部', reason: '业务洽谈', desc: '带合同文本及样品', isFirst: '', rg: '1306811992080876', dob: '1992-08-08', cpf: '222.333.444-55',
      segments: 'MANAUS→RIO / 2026-03-15 / 飞机', baggageQty: 2, baggage: true,
      needHotel: true, hotelCity: 'Rio de Janeiro', hotelName: 'Windsor Hotel', checkIn: '2026-03-15 18:00', checkOut: '2026-03-18 10:00', hotelCost: 'R$1,500',
      needAdvance: true, currency: 'BRL', amount: 'R$2,000.00', bank: 'Caixa', agency: '4567', account: '89012-3', pix: '22233344455',
      needVehicle: true, driver: '张丽莉', coDriver: '', pickupLoc: 'Rio Airport', pickupTime: '2026-03-15 19:00', returnLoc: 'Rio Airport', returnTime: '2026-03-18 09:00' },
    { id: 5, name: '王强', dept: '研发中心', reason: '技术支持', desc: '短期驻场解决紧急问题', isFirst: '', rg: '1101011995110912', dob: '1995-11-09', cpf: '888.0.222-33',
      segments: 'CEARA→SÃO PAULO / 2026-03-16 / 巴士', baggageQty: 0, baggage: false,
      needHotel: false, hotelCity: '', hotelName: '', checkIn: '', checkOut: '', hotelCost: '',
      needAdvance: false, currency: 'BRL', amount: '', bank: '', agency: '', account: '', pix: '',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
    { id: 6, name: '陈嘉怡', dept: '市场部', reason: '内部培训', desc: '需准备调研问卷', isFirst: '', rg: '4201071986052078', dob: '1986-05-20', cpf: '111.222.333-55',
      segments: 'MANAUS→SALVADOR / 2026-03-18 / 飞机', baggageQty: 1, baggage: true,
      needHotel: true, hotelCity: 'Salvador', hotelName: 'Sheraton Hotel', checkIn: '2026-03-18 16:00', checkOut: '2026-03-21 11:00', hotelCost: 'R$1,100',
      needAdvance: true, currency: 'BRL', amount: 'R$1,500.00', bank: 'Itaú Unibanco', agency: '2345', account: '67890-1', pix: '11122233355',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
    { id: 7, name: '吴勇', dept: '市场部', reason: '业务洽谈', desc: '与客户面对面交流', isFirst: '', rg: '4401051992121522', dob: '1992-12-15', cpf: '777.888.999-66',
      segments: 'MANAUS→FORTALEZA / 2026-03-20 / 飞机', baggageQty: 0, baggage: true,
      needHotel: true, hotelCity: 'Fortaleza', hotelName: 'Praia Hotel', checkIn: '2026-03-20 20:00', checkOut: '2026-03-23 10:00', hotelCost: 'R$750',
      needAdvance: true, currency: 'BRL', amount: 'R$900.00', bank: 'Santander', agency: '0987', account: '12345-6', pix: '77788899966',
      needVehicle: true, driver: '吴勇', coDriver: '张丽莉', pickupLoc: 'Fortaleza Airport', pickupTime: '2026-03-20 21:00', returnLoc: 'Fortaleza Airport', returnTime: '2026-03-23 09:00' },
    { id: 8, name: '李浩宇', dept: '研发中心', reason: '技术支持', desc: '需带海报与名片', isFirst: '', rg: '3101011998010187', dob: '1998-01-01', cpf: '333.444.555-0',
      segments: 'RIO→MANAUS / 2026-03-22 / 飞机', baggageQty: 1, baggage: true,
      needHotel: false, hotelCity: '', hotelName: '', checkIn: '', checkOut: '', hotelCost: '',
      needAdvance: false, currency: 'BRL', amount: '', bank: '', agency: '', account: '', pix: '',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
    { id: 9, name: '张丽莉', dept: '财务部', reason: '内部培训', desc: '顺便调研当地市场情况', isFirst: '', rg: '5201151993052534', dob: '1993-05-25', cpf: '852.123.456-78',
      segments: 'SÃO PAULO→BELO HORIZONTE / 2026-03-24 / 巴士', baggageQty: 2, baggage: false,
      needHotel: true, hotelCity: 'Belo Horizonte', hotelName: 'Ouro Preto Hotel', checkIn: '2026-03-24 14:00', checkOut: '2026-03-27 11:00', hotelCost: 'R$680',
      needAdvance: true, currency: 'BRL', amount: 'R$700.00', bank: 'Caixa', agency: '1111', account: '22222-3', pix: '85212345678',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
    { id: 10, name: '王强', dept: '研发中心', reason: '业务洽谈', desc: '需携带部分设备样品', isFirst: '', rg: '3502031987061550', dob: '1987-06-15', cpf: '127.555.999-44',
      segments: 'MANAUS→CURITIBA / 2026-03-25 / 飞机', baggageQty: 3, baggage: true,
      needHotel: true, hotelCity: 'Curitiba', hotelName: 'Bourbon Hotel', checkIn: '2026-03-25 16:00', checkOut: '2026-03-28 10:00', hotelCost: 'R$950',
      needAdvance: true, currency: 'USD', amount: '$500.00', bank: 'Bradesco', agency: '5678', account: '34567-8', pix: '12755599944',
      needVehicle: true, driver: '王强', coDriver: '', pickupLoc: 'Curitiba Airport', pickupTime: '2026-03-25 17:00', returnLoc: 'Curitiba Airport', returnTime: '2026-03-28 09:00' },
    { id: 11, name: '陈嘉怡', dept: '市场部', reason: '技术支持', desc: '需带公司资料及展示板', isFirst: '', rg: '4409821989041275', dob: '1990-04-12', cpf: '428.350.118-13',
      segments: 'CEARA→MANAUS / 2026-03-26 / 飞机', baggageQty: 1, baggage: true,
      needHotel: false, hotelCity: '', hotelName: '', checkIn: '', checkOut: '', hotelCost: '',
      needAdvance: true, currency: 'BRL', amount: 'R$600.00', bank: 'Nubank', agency: '0001', account: '99999-0', pix: '42835011813',
      needVehicle: false, driver: '', coDriver: '', pickupLoc: '', pickupTime: '', returnLoc: '', returnTime: '' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">{t('travelRequestQueryReport')}</h2>
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Search className="w-4 h-4 cursor-pointer hover:text-blue-600" />
            <Filter className="w-4 h-4 cursor-pointer hover:text-blue-600" />
            <BarChart3 className="w-4 h-4 cursor-pointer hover:text-blue-600" />
            <MessageSquare className="w-4 h-4 cursor-pointer hover:text-blue-600" />
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
              <Library className="w-4 h-4" />
              <span className="text-xs">草稿箱</span>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> {t('export')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('name')}</label>
          <input type="text" placeholder={t('enterNamePlaceholder')} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('costCenterLabel')}</label>
          <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none">
            <option value="">{t('all')}</option>
            <option value="财务部">{t('deptFinance')}</option>
            <option value="研发中心">{t('deptResearchCenter')}</option>
            <option value="市场部">{t('deptMarketing')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('dateFrom')}</label>
          <input type="date" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('dateTo')}</label>
          <div className="flex gap-2">
            <input type="date" className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">{t('search')}</button>
          </div>
        </div>
      </div>

      {/* Tabs & Pagination Info */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 py-2 border-b-2 border-blue-600">
            <Grid className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-600">{t('all')}</span>
            <ChevronDown className="w-3 h-3 text-blue-600" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <RotateCcw className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <span>{t('totalRowsPageInfo')}</span>
          <div className="flex gap-2">
            <ChevronRight className="w-4 h-4 rotate-180 cursor-not-allowed opacity-30" />
            <ChevronRight className="w-4 h-4 cursor-not-allowed opacity-30" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[3200px]">
          <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
            {/* Group headers */}
            <tr className="text-[10px] font-bold uppercase">
              <th className="px-3 py-2 border-r border-gray-100 w-10" rowSpan={2}>
                <div className="flex items-center justify-center"><FileText className="w-4 h-4 text-gray-400" /></div>
              </th>
              <th className="px-3 py-2 border-r border-gray-100 w-12" rowSpan={2}>
                <div className="flex items-center gap-1">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <ChevronDown className="w-3 h-3" />
                </div>
              </th>
              <th colSpan={8} className="px-4 py-2 border-r border-b border-gray-100 bg-blue-50 text-blue-600 text-center">{t('travelApplicantInfo')}</th>
              <th colSpan={1} className="px-4 py-2 border-r border-b border-gray-100 bg-purple-50 text-purple-600 text-center">{t('travelSegments')}</th>
              <th colSpan={2} className="px-4 py-2 border-r border-b border-gray-100 bg-orange-50 text-orange-600 text-center">{t('baggageTitle')}</th>
              <th colSpan={6} className="px-4 py-2 border-r border-b border-gray-100 bg-green-50 text-green-600 text-center">{t('accommodationTitle')}</th>
              <th colSpan={7} className="px-4 py-2 border-r border-b border-gray-100 bg-yellow-50 text-yellow-700 text-center">{t('advanceBankInfoTitle')}</th>
              <th colSpan={7} className="px-4 py-2 border-b border-gray-100 bg-red-50 text-red-600 text-center">{t('vehicleRentalTitle')}</th>
            </tr>
            {/* Field headers */}
            <tr>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('name')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('costCenterLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('travelReasonLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('detailDescriptionLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('firstTravel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">RG</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('dateOfBirthLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">CPF</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('travelSegments')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('checkedBaggage')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('quantityLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('needHotel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('checkInCityLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('hotelNameLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('checkInTimeLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('checkOutTimeLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('estimatedCostLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('needAdvancePayment')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('currencyLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('advanceAmountLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('bankName')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('branchLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('accountNumber')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('pixKeyLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('needVehicleRental')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('primaryDriverLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('additionalDriverLabel')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('pickupLocation')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('pickupTime')}</th>
              <th className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">{t('dropoffLocation')}</th>
              <th className="px-4 py-2 whitespace-nowrap">{t('dropoffTime')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-2 text-center text-gray-300 border-r border-gray-50">{idx + 1}</td>
                <td className="px-3 py-2 text-center border-r border-gray-50">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                {/* 申请人信息 */}
                <td className="px-4 py-2 border-r border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">{row.name.slice(0,1)}</div>
                    <span className="whitespace-nowrap">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2 border-r border-gray-50">
                  {row.dept && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 whitespace-nowrap">{row.dept}</span>}
                </td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.reason}</td>
                <td className="px-4 py-2 border-r border-gray-50 text-gray-500 max-w-[160px] truncate">{row.desc}</td>
                <td className="px-4 py-2 border-r border-gray-50 text-center">
                  {row.isFirst === '是' ? <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{t('yes')}</span> : <span className="text-gray-300">{t('no')}</span>}
                </td>
                <td className="px-4 py-2 border-r border-gray-50 font-mono whitespace-nowrap">{row.rg}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.dob}</td>
                <td className="px-4 py-2 border-r border-gray-50 font-mono whitespace-nowrap">{row.cpf}</td>
                {/* 行程段 */}
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">
                  <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold">{row.segments}</span>
                </td>
                {/* 行李 */}
                <td className="px-4 py-2 border-r border-gray-50 text-center">
                  <input type="checkbox" checked={row.baggage} readOnly className="rounded border-gray-300 text-blue-600" />
                </td>
                <td className="px-4 py-2 border-r border-gray-50 text-center">
                  {row.baggageQty > 0 ? <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold">{`${row.baggageQty} ${t('pieceUnit')}`}</span> : <span className="text-gray-300">—</span>}
                </td>
                {/* 住宿 */}
                <td className="px-4 py-2 border-r border-gray-50 text-center">
                  {row.needHotel ? <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{t('yes')}</span> : <span className="text-gray-300">{t('no')}</span>}
                </td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.hotelCity || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.hotelName || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.checkIn || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.checkOut || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap font-mono">{row.hotelCost || <span className="text-gray-300">—</span>}</td>
                {/* 费用与银行 */}
                <td className="px-4 py-2 border-r border-gray-50 text-center">
                  {row.needAdvance ? <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{t('yes')}</span> : <span className="text-gray-300">{t('no')}</span>}
                </td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.currency || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap font-mono">{row.amount || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.bank || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap font-mono">{row.agency || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap font-mono">{row.account || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap font-mono">{row.pix || <span className="text-gray-300">—</span>}</td>
                {/* 车辆租赁 */}
                <td className="px-4 py-2 border-r border-gray-50 text-center">
                  {row.needVehicle ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{t('yes')}</span> : <span className="text-gray-300">{t('no')}</span>}
                </td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.driver || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.coDriver || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.pickupLoc || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.pickupTime || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 border-r border-gray-50 whitespace-nowrap">{row.returnLoc || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-2 whitespace-nowrap">{row.returnTime || <span className="text-gray-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WorkflowConfig = ({ category }: { category?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

  const workflows = [
    { id: 'workflow-travel', name: '出差申请流程', status: '已发布', version: 'v2.4', lastUpdate: '2026-03-20' },
    { id: 'workflow-expense', name: '费用报销流程', status: '已发布', version: 'v3.1', lastUpdate: '2026-03-22' },
    { id: 'workflow-seal', name: '用印申请流程', status: '草稿', version: 'v1.0', lastUpdate: '2026-03-25' },
    { id: 'workflow-procurement', name: '采购申请流程', status: '已发布', version: 'v2.0', lastUpdate: '2026-03-15' },
  ];

  const filteredWorkflows = category && category !== 'workflow-config'
    ? workflows.filter(wf => wf.id === category)
    : workflows;

  const handleNew = () => {
    setEditingWorkflow(null);
    setIsModalOpen(true);
  };

  const handleEdit = (wf: any) => {
    setEditingWorkflow(wf);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">流程配置中心</h2>
          <p className="text-sm text-gray-400 mt-1">
            {category && category !== 'workflow-config' ? workflows.find(w => w.id === category)?.name : '管理系统所有业务流程审批节点及流转规则'}
          </p>
        </div>
        <button 
          onClick={handleNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> 新建流程
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredWorkflows.map((wf) => (
          <div key={wf.name} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Workflow className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                wf.status === '已发布' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
              }`}>
                {wf.status}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{wf.name}</h3>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>版本: {wf.version}</span>
              <span>{wf.lastUpdate}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
              <button 
                onClick={() => handleEdit(wf)}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                编辑流程
              </button>
              <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Designer Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingWorkflow ? `编辑流程: ${editingWorkflow.name}` : '新建流程'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">可视化流程设计器</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 p-8 overflow-auto">
              <div className="aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="flex flex-col items-center gap-8 relative z-10 scale-125">
                  <div className="w-48 p-4 bg-white rounded-xl shadow-lg border border-blue-100 text-center">
                    <div className="text-[10px] text-blue-600 font-bold uppercase mb-1">开始节点</div>
                    <div className="text-sm font-bold text-gray-800">提交申请单</div>
                  </div>
                  <div className="w-0.5 h-8 bg-blue-200"></div>
                  <div className="w-48 p-4 bg-white rounded-xl shadow-lg border border-orange-100 text-center">
                    <div className="text-[10px] text-orange-600 font-bold uppercase mb-1">审批节点</div>
                    <div className="text-sm font-bold text-gray-800">部门经理审核</div>
                  </div>
                  <div className="w-0.5 h-8 bg-blue-200"></div>
                  <div className="w-48 p-4 bg-white rounded-xl shadow-lg border border-green-100 text-center">
                    <div className="text-[10px] text-green-600 font-bold uppercase mb-1">结束节点</div>
                    <div className="text-sm font-bold text-gray-800">流程归档</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-white border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">取消</button>
              <button onClick={() => { setAppNotice({ type: 'success', message: '保存成功' }); setIsModalOpen(false); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">保存流程</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6">流程设计器预览</h3>
        <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="flex flex-col items-center gap-8 relative z-10">
            <div className="w-48 p-4 bg-white rounded-xl shadow-sm border border-blue-100 text-center">
              <div className="text-[10px] text-blue-600 font-bold uppercase mb-1">开始节点</div>
              <div className="text-sm font-bold text-gray-800">提交申请单</div>
            </div>
            <div className="w-0.5 h-8 bg-blue-200"></div>
            <div className="w-48 p-4 bg-white rounded-xl shadow-sm border border-orange-100 text-center">
              <div className="text-[10px] text-orange-600 font-bold uppercase mb-1">审批节点</div>
              <div className="text-sm font-bold text-gray-800">部门经理审核</div>
            </div>
            <div className="w-0.5 h-8 bg-blue-200"></div>
            <div className="w-48 p-4 bg-white rounded-xl shadow-sm border border-green-100 text-center">
              <div className="text-[10px] text-green-600 font-bold uppercase mb-1">结束节点</div>
              <div className="text-sm font-bold text-gray-800">流程归档</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = ({ category }: { category?: string }) => {
  const [internalSelectedReport, setInternalSelectedReport] = useState<string | null>(null);

  const reportsList = [
    { id: 'travel-query', name: '出差申请查询表', icon: Plane, desc: '查询所有员工的出差申请明细', category: 'reports-hr', pageId: 'reports-hr-travel' },
    { id: 'expense-report', name: '费用报销统计表', icon: CreditCard, desc: '按部门、项目统计报销费用', category: 'reports-finance', pageId: 'reports-finance-expense' },
    { id: 'attendance-report', name: '考勤月度汇总表', icon: Calendar, desc: '月度考勤异常与加班统计', category: 'reports-hr', pageId: 'reports-hr-attendance' },
    { id: 'procurement-report', name: '采购执行明细表', icon: Package, desc: '实时跟踪采购订单执行进度', category: 'reports-supply', pageId: 'reports-supply-procurement' },
  ];

  const pageToReportId: Record<string, string> = {
    'reports-hr-travel': 'travel-query',
    'reports-hr-attendance': 'attendance-report',
    'reports-finance-expense': 'expense-report',
    'reports-supply-procurement': 'procurement-report'
  };

  const activeReportId = internalSelectedReport || (category ? pageToReportId[category] : null);

  const filteredReports = category && (category === 'reports' || category.startsWith('reports-'))
    ? (category === 'reports' ? reportsList : reportsList.filter(r => r.category === category || r.pageId === category))
    : reportsList;

  const categoryTitle = {
    'reports': '全部报表',
    'reports-hr': '人力行政报表',
    'reports-finance': '财务报表',
    'reports-supply': '供应链报表'
  }[category || 'reports'] || '报表详情';

  const renderReport = () => {
    switch (activeReportId) {
      case 'travel-query': return <TravelRequestReport />;
      case 'attendance-report': return <AttendanceReport />;
      case 'expense-report': return <ExpenseStatisticsReport />;
      case 'procurement-report': return <ProcurementDetailReport />;
      default: return null;
    }
  };

  if (activeReportId) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        {!category?.includes('-') && (
          <div className="px-8 pt-4">
            <button 
              onClick={() => setInternalSelectedReport(null)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 返回报表列表
            </button>
          </div>
        )}
        <div className="flex-1">
          {renderReport()}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">报表中心</h2>
          <p className="text-sm text-gray-400 mt-1">{categoryTitle}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">自定义报表</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" /> 导出全部
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div 
            key={report.id} 
            onClick={() => setInternalSelectedReport(report.id)}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <report.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{report.name}</h3>
                <p className="text-xs text-gray-400">{report.desc}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddressBook = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'dept' | 'member'>('dept');
  const [selectedDept, setSelectedDept] = useState('研发中心');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">通讯录 - 组织架构</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => { setModalType('member'); setIsModalOpen(true); }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> 邀请成员
          </button>
          <button 
            onClick={() => { setModalType('dept'); setIsModalOpen(true); }}
            className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 新建部门
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">导出架构</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Org Tree */}
        <div className="col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">部门架构</h3>
            <button 
              onClick={() => { setModalType('dept'); setIsModalOpen(true); }}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {ORG_STRUCTURE.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div 
                  onClick={() => setSelectedDept(dept.name)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-colors ${selectedDept === dept.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-5 h-5 ${selectedDept === dept.name ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                    <span className="text-sm font-bold">{dept.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedDept === dept.name ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-600'}`} />
                </div>
                {dept.children.length > 0 && (
                  <div className="ml-8 border-l-2 border-gray-50 pl-4 space-y-1">
                    {dept.children.map(child => (
                      <div 
                        key={child} 
                        onClick={() => setSelectedDept(child)}
                        className={`p-2 text-sm cursor-pointer transition-colors ${selectedDept === child ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-blue-600'}`}
                      >
                        {child}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Member List */}
        <div className="col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">{selectedDept} (42人)</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索成员..." className="bg-gray-50 border-none rounded-lg py-1.5 pl-9 pr-4 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: '张三', role: '前端架构师', email: 'zhangsan@eletra.com', status: 'online' },
              { name: '李四', role: '后端开发', email: 'lisi@eletra.com', status: 'away' },
              { name: '王五', role: 'UI设计师', email: 'wangwu@eletra.com', status: 'online' },
              { name: '赵六', role: '产品经理', email: 'zhaoliu@eletra.com', status: 'offline' },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-4 p-4 border border-gray-50 rounded-2xl hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {member.name[0]}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    member.status === 'online' ? 'bg-green-500' : member.status === 'away' ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{member.name}</div>
                  <div className="text-[10px] text-gray-400">{member.role}</div>
                  <div className="text-[10px] text-gray-400 truncate">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{modalType === 'dept' ? '新建部门' : '新增成员'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {modalType === 'dept' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">部门名称</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="请输入部门名称" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">上级部门</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                      <option value="">无 (顶级部门)</option>
                      {ORG_STRUCTURE.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">成员姓名</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="请输入成员姓名" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">电子邮箱</label>
                    <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="请输入电子邮箱" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">所属部门</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                      {ORG_STRUCTURE.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all">取消</button>
              <button onClick={() => { setAppNotice({ type: 'success', message: '保存成功' }); setIsModalOpen(false); }} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">确定</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    { id: 1, title: '2026年Q1研发中心采购计划', type: '采购申请', date: '2026-03-20', status: '已通过', icon: ShoppingCart, color: 'bg-purple-500' },
    { id: 2, title: '关于上海分公司出差申请', type: '出差申请', date: '2026-03-25', status: '审批中', icon: Plane, color: 'bg-blue-500' },
    { id: 3, title: '新员工入职培训流程', type: '流程配置', date: '2026-02-15', status: '已发布', icon: Workflow, color: 'bg-green-500' },
    { id: 4, title: '行政部印章领用申请', type: '用印申请', date: '2026-03-26', status: '待提交', icon: Stamp, color: 'bg-orange-500' },
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">我的收藏</h2>
          <p className="text-gray-400 text-sm mt-1">您收藏的常用单据、流程和报表</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => (
          <motion.div 
            key={fav.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 ${fav.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                <fav.icon className="w-6 h-6" />
              </div>
              <button className="text-orange-400 hover:text-orange-500 transition-colors">
                <Star className="w-5 h-5 fill-current" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{fav.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{fav.type}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-[10px] text-gray-400">{fav.date}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  fav.status === '已通过' ? 'bg-green-50 text-green-600' :
                  fav.status === '审批中' ? 'bg-blue-50 text-blue-600' :
                  fav.status === '待提交' ? 'bg-orange-50 text-orange-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {fav.status}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ReimbursementForm = ({ onClose, onSubmitRequest }: { onClose: () => void; onSubmitRequest?: (title: string) => void }) => {
  const [rows, setRows] = useState([{ id: 1, type: '', from: '', to: '', dateTime: '' }]);

  const addRow = () => setRows([...rows, { id: Date.now(), type: '', from: '', to: '', dateTime: '' }]);
  const removeRow = (id: number) => setRows(rows.filter(r => r.id !== id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Form Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">创建费用报销记录</h2>
              <p className="text-xs text-gray-400">请如实填写报销信息，确保单据清晰</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Section: Applicant Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              <h3 className="font-bold text-gray-800">申请人信息</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <span className="text-red-500">*</span> 全名
                </label>
                <input type="text" defaultValue="王严严" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <span className="text-red-500">*</span> 成本中心
                </label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                  <option>出差费用归属成本中心</option>
                  <option>研发部</option>
                  <option>市场部</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <span className="text-red-500">*</span> 出差事由
                </label>
                <input type="text" placeholder="填写本次出差的业务原因" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-600">理由/说明</label>
                <textarea rows={3} placeholder="对本次出差涉及的业务流程、客户、任务等做补充说明" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">是否首次出差</label>
                <div className="flex gap-4">
                  {['是', '否'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="first_time" className="w-4 h-4 text-blue-600" defaultChecked={opt === '否'} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Transportation */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              <h3 className="font-bold text-gray-800">出行与住宿</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">交通方式</span>
                <button onClick={addRow} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  添加一行
                </button>
              </div>
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">出行交通方式</th>
                      <th className="px-4 py-3">出发地</th>
                      <th className="px-4 py-3">目的地</th>
                      <th className="px-4 py-3">日期时间</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-2 py-2">
                          <select className="w-full border-none bg-transparent focus:ring-0">
                            <option>请选择</option>
                            <option>飞机</option>
                            <option>高铁</option>
                            <option>打车</option>
                          </select>
                        </td>
                        <td className="px-2 py-2"><input type="text" className="w-full border-none bg-transparent focus:ring-0" placeholder="出发地" /></td>
                        <td className="px-2 py-2"><input type="text" className="w-full border-none bg-transparent focus:ring-0" placeholder="目的地" /></td>
                        <td className="px-2 py-2"><input type="datetime-local" className="w-full border-none bg-transparent focus:ring-0" /></td>
                        <td className="px-2 py-2">
                          <button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Form Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
            <span className="text-sm text-gray-500">继续创建时，保留本次提交内容</span>
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAppNotice({ type: 'success', message: '草稿已保存' })} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">存草稿</button>
            <button type="button" onClick={() => { onSubmitRequest?.('费用报销'); setAppNotice({ type: 'success', message: '提交成功，正在创建下一条...' }); }} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">提交并继续创建</button>
            <button type="button" onClick={() => { onSubmitRequest?.('费用报销'); setAppNotice({ type: 'success', message: '提交成功' }); onClose(); }} className="px-8 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all">提交</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NoticeDetailModal = ({ notice, onClose }: { notice: Notice; onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
              notice.type === '通知' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {notice.type}
            </span>
            <h3 className="text-lg font-bold text-gray-800">公告详情</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{notice.title}</h2>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>发布人：{notice.creator}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>发布时间：{notice.createTime}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed min-h-[200px]">
            <div dangerouslySetInnerHTML={{ __html: notice.content }} />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            我知道了
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [appError, setAppError] = useState<{ title: string; message: string } | null>(null);
  const [appNotice, setAppNotice] = useState<{ type?: 'success' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (!appNotice) return;
    const t = setTimeout(() => setAppNotice(null), 3000);
    return () => clearTimeout(t);
  }, [appNotice]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', nickname: '管理员', dept: '研发部', phone: '13800000000', status: true, createTime: '2026-01-01 12:00:00' },
    { id: 2, username: 'zhangsan', nickname: '张三', dept: '市场部', phone: '13911111111', status: true, createTime: '2026-02-15 09:30:00' },
    { id: 3, username: 'lisi', nickname: '李四', dept: '财务部', phone: '13722222222', status: false, createTime: '2026-03-10 14:20:00' },
  ]);

  const [activePage, setActivePage] = useState<Page>('workbench');
  const [approvalTab, setApprovalTab] = useState<WorkflowTab>('pending');
  const [showForm, setShowForm] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [workflowRequests, setWorkflowRequests] = useState<WorkflowRequest[]>(INITIAL_WORKFLOW_REQUESTS);
  const [chats, setChats] = useState<ChatItem[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number>(INITIAL_CHATS[0]?.id || 0);
  const [selectedNoticeForView, setSelectedNoticeForView] = useState<Notice | null>(null);
  const prevActivePageRef = useRef<Page>('workbench');
  const [formBackPage, setFormBackPage] = useState<Page>('apps');

  useEffect(() => {
    const isFormPage = activePage === 'travel-request' || (activePage.startsWith('apps-') && activePage.split('-').length === 3);
    if (isFormPage) {
      const fromPage = prevActivePageRef.current;
      setFormBackPage(fromPage === 'workbench' ? 'workbench' : 'apps');
    }
    prevActivePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    userService.getAll()
      .then((data) => {
        const mapped = data.map((u: any) => ({
          id: u.id,
          username: u.username,
          nickname: u.nickname || u.firstName || '',
          dept: u.dept || '',
          phone: u.phone || '',
          status: u.status === 'ACTIVE' || u.status === true,
          createTime: new Date(u.createdAt).toLocaleString(),
        }));
        if (mapped.length > 0) {
          setUsers(mapped);
        }
      })
      .catch(() => {
        // Keep local mock users when backend is unreachable.
      });
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const loginWithLocalUser = () => {
      const normalized = username.trim().toLowerCase();
      const localUser = users.find((u) => u.username.toLowerCase() === normalized);

      if (!localUser) {
        setAppError({ title: '登录失败', message: '用户名不存在' });
        return;
      }

      if (!localUser.status) {
        setAppError({ title: '登录失败', message: '该账号已停用' });
        return;
      }

      setIsAuthenticated(true);
      setCurrentUser({
        id: localUser.id,
        username: localUser.username,
        nickname: localUser.nickname || localUser.username,
        dept: localUser.dept || '',
        phone: localUser.phone || '',
        status: true,
        avatar: getUserAvatarFromStorage(localUser.username),
        statusSignature: getUserStatusFromStorage(localUser.username),
      });
      markUserOnline(localUser.username);
    };

    try {
      const res = await authService.login({ username, password });
      const localUser = users.find((u) => u.username === res.user.username);

      if (localUser && !localUser.status) {
        setAppError({ title: '登录失败', message: '该账号已停用' });
        return;
      }

      setIsAuthenticated(true);
      setCurrentUser({
        id: res.user.id,
        username: res.user.username,
        nickname: localUser?.nickname || res.user.username,
        dept: localUser?.dept || '',
        phone: localUser?.phone || '',
        status: true,
        avatar: getUserAvatarFromStorage(res.user.username),
        statusSignature: getUserStatusFromStorage(res.user.username),
      });
      markUserOnline(res.user.username);
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const isBackendUnavailable = !statusCode || statusCode >= 500;
      if (isBackendUnavailable) {
        loginWithLocalUser();
        if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
          setAppError({ title: '警告', message: '后端暂不可用，已切换本地登录模式' });
        }
        return;
      }

      const message = error?.response?.data?.message;
      if (typeof message === 'string') {
        setAppError({ title: '登录失败', message });
      } else {
        setAppError({ title: '登录失败', message: '请确认后端已启动并可用' });
      }
    }
  };

  const handleLogout = () => {
    markUserOffline(currentUser?.username);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActivePage('workbench');
  };

  const handleUpdateAvatar = (avatarDataUrl: string) => {
    setCurrentUser((prev: any) => {
      if (!prev) return prev;
      try {
        saveUserAvatarToStorage(prev.username, avatarDataUrl);
      } catch (err) {
        setAppError({ title: '保存失败', message: '头像保存到本地失败，可能空间不足或浏览器限制' });
      }
      return { ...prev, avatar: avatarDataUrl };
    });
  };

  const handleUpdateStatusSignature = (statusText: string) => {
    setCurrentUser((prev: any) => {
      if (!prev) return prev;
      saveUserStatusToStorage(prev.username, statusText);
      return { ...prev, statusSignature: statusText };
    });

    setChats((prev) => prev.map((chat) => {
      if (chat.type !== 'direct') return chat;
      if (normalizeAccount(chat.userAccount) !== normalizeAccount(currentUser?.username)) return chat;
      return { ...chat, signature: statusText };
    }));
  };

  const handleMarkAsRead = (id: number) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleOpenApprovals = (tab: WorkflowTab) => {
    setApprovalTab(tab);
    setActivePage('approvals');
  };

  const handleOpenChat = (chatId: number) => {
    setActiveChatId(chatId);
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
    setActivePage('chat');
  };

  const handleSubmitWorkflow = (type: string) => {
    const prefixMap: Record<string, string> = {
      '出差申请': 'TR',
      '请假申请': 'LV',
      '培训申请': 'TRN',
      '用印申请': 'SE',
      '报销申请': 'RB',
      '付款申请': 'PA',
      '开票申请': 'IV',
      '采购申请': 'PO',
      '领用申请': 'RQ',
      '费用报销': 'RB',
    };
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const timePart = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const applicant = currentUser?.nickname || currentUser?.username || '管理员';
    const dept = currentUser?.dept || '未分配部门';
    const prefix = prefixMap[type] || 'WF';

    setWorkflowRequests(prev => {
      const sameTypeCount = prev.filter(item => item.type === type).length + 1;
      return [
        {
          id: `${prefix}${datePart}${sameTypeCount.toString().padStart(3, '0')}`,
          type,
          applicant,
          dept,
          createTime: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${timePart}`,
          status: '待审批',
          currentNode: '部门审批',
          approver: '管理员',
          summary: `${applicant} 提交了${type}，等待审批处理。`,
          ...(type === '出差申请' ? { travelDetail: createDefaultTravelDetail(applicant, dept) } : {}),
        },
        ...prev,
      ];
    });
  };

  const handleApproveWorkflow = (id: string) => {
    setWorkflowRequests(prev => prev.map(item => item.id === id ? { ...item, status: '已通过', currentNode: '归档', approver: currentUser?.nickname || currentUser?.username || '管理员' } : item));
  };

  const handleRejectWorkflow = (id: string) => {
    setWorkflowRequests(prev => prev.map(item => item.id === id ? { ...item, status: '已驳回', currentNode: '申请人修改', approver: currentUser?.nickname || currentUser?.username || '管理员' } : item));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // 点击铃铛时定位到第一个未读或最新会话，由 handleBellClick 处理（声明已在上方）
  const handleBellClick = () => {
    const sorted = sortChatsByUnreadAndTime(chats);
    const target = sorted.find(chat => chat.unread > 0) || sorted[0];
    setActivePage('chat');
    setActiveChatId(target ? target.id : null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {appError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAppError(null)} />
          <div className="relative bg-white rounded-xl p-6 z-60 w-full max-w-md mx-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">{appError.title}</div>
                <div className="mt-2 text-sm text-gray-600">{appError.message}</div>
              </div>
              <button onClick={() => setAppError(null)} aria-label="关闭" className="rounded-full p-1 bg-gray-100 hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setAppError(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">确定</button>
            </div>
          </div>
        </div>
      )}
      {appNotice && (
        <div className="fixed left-1/2 bottom-8 z-50 -translate-x-1/2">
          <div className="bg-white border border-green-100 shadow-md rounded-lg px-4 py-3 flex items-center gap-3 min-w-[240px]">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="flex-1 text-sm text-gray-700">{appNotice.message}</div>
            <button onClick={() => setAppNotice(null)} className="text-gray-400 hover:text-gray-600 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 flex flex-col">
        <Header
          user={currentUser}
          onLogout={handleLogout}
          onGoHome={() => setActivePage('workbench')}
          onUpdateAvatar={handleUpdateAvatar}
          onUpdateStatus={handleUpdateStatusSignature}
          onBellClick={handleBellClick}
          onError={setAppError}
          chats={chats}
        />
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activePage === 'workbench' && (
              <motion.div
                key="workbench"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <Workbench 
                  onOpenForm={() => setShowForm(true)} 
                  onOpenApps={() => setActivePage('apps')} 
                  onOpenApprovals={handleOpenApprovals}
                  setActivePage={setActivePage}
                  notices={notices}
                  onMarkAsRead={handleMarkAsRead}
                  onOpenNotice={(n) => setSelectedNoticeForView(n)}
                  currentUser={currentUser}
                  workflowRequests={workflowRequests}
                  chats={chats}
                  onOpenChat={handleOpenChat}
                />
              </motion.div>
            )}
            {activePage.startsWith('apps') && activePage.split('-').length < 3 && (
              <motion.div
                key="apps"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <AppCenter 
                  setActivePage={setActivePage}
                  categoryFilter={activePage !== 'apps' ? activePage : undefined}
                />
              </motion.div>
            )}
            {(activePage === 'travel-request' || (activePage.startsWith('apps-') && activePage.split('-').length === 3)) && (
              <motion.div
                key="app-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                {(() => {
                  const props = { onBack: () => setActivePage(formBackPage) };
                  switch (activePage) {
                    case 'apps-hr-leave': return <LeaveRequestForm {...props} title="请假申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-hr-training': return <TrainingRequestForm {...props} title="培训申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-hr-stamp': return <StampRequestForm {...props} title="用印申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-hr-travel': 
                    case 'travel-request': return <TravelRequestForm {...props} title="出差申请" currentUser={currentUser} onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-finance-reimbursement': return <ReimbursementRequestForm {...props} title="报销申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-finance-payment': return <PaymentRequestForm {...props} title="付款申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-finance-invoice': return <InvoiceRequestForm {...props} title="开票申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-supply-procurement': return <ProcurementRequestForm {...props} title="采购申请" onSubmitRequest={handleSubmitWorkflow} />;
                    case 'apps-supply-requisition': return <RequisitionRequestForm {...props} title="领用申请" onSubmitRequest={handleSubmitWorkflow} />;
                    default: return <TravelRequestForm {...props} title="单据申请" currentUser={currentUser} onSubmitRequest={handleSubmitWorkflow} />;
                  }
                })()}
              </motion.div>
            )}
            {activePage === 'fav' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <Favorites />
              </motion.div>
            )}
            {activePage === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <AddressBook />
              </motion.div>
            )}
            {activePage === 'approvals' && (
              <motion.div
                key="approvals"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <ApprovalGroups 
                  workflowRequests={workflowRequests}
                  currentUser={currentUser}
                  initialTab={approvalTab}
                  onApprove={handleApproveWorkflow}
                  onReject={handleRejectWorkflow}
                />
              </motion.div>
            )}
            {activePage === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <Chat
                  chats={chats}
                  setChats={setChats}
                  activeChatId={activeChatId}
                  setActiveChatId={setActiveChatId}
                  currentUser={currentUser}
                  onClose={() => setActivePage('workbench')}
                />
              </motion.div>
            )}
            {(activePage === 'reports' || activePage.startsWith('reports-')) && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <Reports category={activePage} />
              </motion.div>
            )}
            {(activePage === 'workflow-config' || activePage.startsWith('workflow-')) && (
              <motion.div
                key="workflow-config"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <WorkflowConfig category={activePage} />
              </motion.div>
            )}
            {activePage.startsWith('sys-') && (
              <motion.div
                key="sys-mgmt"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                {(() => {
                  switch (activePage) {
                    case 'sys-user': return <UserManagement title="用户管理" users={users} setUsers={setUsers} />;
                    case 'sys-role': return <RoleManagement title="角色管理" />;
                    case 'sys-menu': return <MenuManagement title="菜单管理" />;
                    case 'sys-dept': return <DeptManagement title="部门管理" />;
                    case 'sys-post': return <PostManagement title="岗位管理" />;
                    case 'sys-dict': return <DictManagement title="字典管理" />;
                    case 'sys-notice': return <NoticeManagement title="通知公告管理" notices={notices} setNotices={setNotices} onMarkAsRead={handleMarkAsRead} onOpenNotice={(n) => setSelectedNoticeForView(n)} />;
                    default: return (
                      <div className="p-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
                          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                            <Settings2 className="w-8 h-8" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-800">系统管理</h2>
                          <p className="text-gray-400 max-w-md mx-auto">
                            请选择左侧子菜单进行系统配置与管理。
                          </p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showForm && <ReimbursementForm onClose={() => setShowForm(false)} onSubmitRequest={handleSubmitWorkflow} />}
        {selectedNoticeForView && (
          <NoticeDetailModal 
            notice={selectedNoticeForView} 
            onClose={() => setSelectedNoticeForView(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
