import express from 'express';

const app = express();
const PORT = 3002;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

type UserStatus = 'ACTIVE' | 'INACTIVE';

type UserRecord = {
  id: number;
  username: string;
  password: string;
  nickname: string;
  dept: string;
  phone: string;
  status: UserStatus;
  role: 'ADMIN' | 'MANAGER' | 'APPROVER' | 'USER';
  createdAt: string;
};

type RoleRecord = {
  id: number;
  name: string;
  key: string;
  sort: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

type NoticeRecord = {
  id: number;
  title: string;
  type: string;
  status: boolean;
  creator: string;
  content: string;
  isNew: boolean;
  isRead: boolean;
  createdAt: string;
};

type MenuRecord = {
  id: number;
  name: string;
  permission: string;
  component: string;
  sort: number;
  status: boolean;
  createdAt: string;
};

const now = () => new Date().toISOString();

let users: UserRecord[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    nickname: '管理员',
    dept: '研发部',
    phone: '13800000000',
    status: 'ACTIVE',
    role: 'ADMIN',
    createdAt: now(),
  },
  {
    id: 2,
    username: 'zhangsan',
    password: 'zhangsan123',
    nickname: '张三',
    dept: '市场部',
    phone: '13911111111',
    status: 'ACTIVE',
    role: 'USER',
    createdAt: now(),
  },
  {
    id: 3,
    username: 'lisi',
    password: 'lisi123',
    nickname: '李四',
    dept: '财务部',
    phone: '13722222222',
    status: 'INACTIVE',
    role: 'USER',
    createdAt: now(),
  },
];

let nextUserId = 4;

let roles: RoleRecord[] = [
  {
    id: 1,
    name: '系统管理员',
    key: 'sys:admin',
    sort: 0,
    status: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 2,
    name: '流程审批人',
    key: 'workflow:approver',
    sort: 1,
    status: true,
    createdAt: now(),
    updatedAt: now(),
  },
];
let nextRoleId = 3;
const roleMenuMap: Record<number, number[]> = {
  1: [],
  2: [],
};

let notices: NoticeRecord[] = [
  {
    id: 1,
    title: '系统维护通知',
    type: '通知',
    status: true,
    creator: 'admin',
    content: '系统将于本周末进行维护升级，请留意',
    isNew: false,
    isRead: false,
    createdAt: now(),
  },
];
let nextNoticeId = 2;

let menus: MenuRecord[] = [
  {
    id: 1,
    name: '用户管理',
    permission: 'sys:user:list',
    component: 'system/user/index',
    sort: 1,
    status: true,
    createdAt: now(),
  },
  {
    id: 2,
    name: '角色管理',
    permission: 'sys:role:list',
    component: 'system/role/index',
    sort: 2,
    status: true,
    createdAt: now(),
  },
];
let nextMenuId = 3;

const sanitizeUser = (u: UserRecord) => {
  const { password, ...safe } = u;
  return safe;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'eletra-oa-mock-api' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, email, password } = req.body || {};
  const account = String(username || email || '').trim().toLowerCase();
  const pwd = String(password || '').trim();

  const user = users.find((u) => u.username.toLowerCase() === account);
  if (!user || user.password !== pwd) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ message: '该账号已停用' });
  }

  res.json({
    access_token: `mock-token-${user.id}`,
    user: sanitizeUser(user),
  });
});

app.get('/api/users', (_req, res) => {
  res.json(users.map(sanitizeUser));
});

app.post('/api/users', (req, res) => {
  const { username, password, nickname = '', dept = '', phone = '', status = true } = req.body || {};

  const normalizedUsername = String(username || '').trim();
  const normalizedPassword = String(password || '').trim();

  if (!normalizedUsername) {
    return res.status(400).json({ message: '账号不能为空' });
  }

  if (!normalizedPassword) {
    return res.status(400).json({ message: '密码不能为空' });
  }

  const exists = users.some((u) => u.username.toLowerCase() === normalizedUsername.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: '账号已存在' });
  }

  const newUser: UserRecord = {
    id: nextUserId++,
    username: normalizedUsername,
    password: normalizedPassword,
    nickname: String(nickname || ''),
    dept: String(dept || ''),
    phone: String(phone || ''),
    status: status ? 'ACTIVE' : 'INACTIVE',
    role: 'USER',
    createdAt: now(),
  };

  users.push(newUser);
  res.status(201).json(sanitizeUser(newUser));
});

app.patch('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const { password, nickname, dept, phone, status } = req.body || {};

  if (typeof password === 'string' && password.trim()) {
    user.password = password.trim();
  }
  if (nickname !== undefined) user.nickname = String(nickname || '');
  if (dept !== undefined) user.dept = String(dept || '');
  if (phone !== undefined) user.phone = String(phone || '');
  if (status !== undefined) user.status = status ? 'ACTIVE' : 'INACTIVE';

  res.json(sanitizeUser(user));
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const before = users.length;
  users = users.filter((u) => u.id !== id);

  if (users.length === before) {
    return res.status(404).json({ message: '用户不存在' });
  }

  res.json({ success: true });
});

app.get('/api/workflows', (_req, res) => {
  res.json([]);
});

app.get('/api/system/notices', (_req, res) => {
  res.json(notices);
});

app.post('/api/system/notices', (req, res) => {
  const { title, type = '通知', status = true, creator = 'system', content = '' } = req.body || {};

  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) {
    return res.status(400).json({ message: '公告标题不能为空' });
  }

  const notice: NoticeRecord = {
    id: nextNoticeId++,
    title: normalizedTitle,
    type: String(type || '通知'),
    status: Boolean(status),
    creator: String(creator || 'system'),
    content: String(content || ''),
    isNew: true,
    isRead: false,
    createdAt: now(),
  };

  notices.push(notice);
  res.status(201).json(notice);
});

app.patch('/api/system/notices/:id', (req, res) => {
  const id = Number(req.params.id);
  const notice = notices.find((n) => n.id === id);

  if (!notice) {
    return res.status(404).json({ message: '公告不存在' });
  }

  const { title, type, status, creator, content, isNew, isRead } = req.body || {};

  if (title !== undefined) notice.title = String(title || '').trim() || notice.title;
  if (type !== undefined) notice.type = String(type || '');
  if (status !== undefined) notice.status = Boolean(status);
  if (creator !== undefined) notice.creator = String(creator || '');
  if (content !== undefined) notice.content = String(content || '');
  if (isNew !== undefined) notice.isNew = Boolean(isNew);
  if (isRead !== undefined) notice.isRead = Boolean(isRead);

  res.json(notice);
});

app.delete('/api/system/notices/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = notices.findIndex((n) => n.id === id);

  if (idx < 0) {
    return res.status(404).json({ message: '公告不存在' });
  }

  const [deleted] = notices.splice(idx, 1);
  res.json(deleted);
});

app.get('/api/system/dicts', (_req, res) => {
  res.json([]);
});

app.get('/api/system/roles', (_req, res) => {
  res.json(roles);
});

app.post('/api/system/roles', (req, res) => {
  const { name, key, sort = 0, status = true } = req.body || {};
  const normalizedName = String(name || '').trim();
  const normalizedKey = String(key || '').trim().toLowerCase();

  if (!normalizedName || !normalizedKey) {
    return res.status(400).json({ message: '角色名称和权限字符不能为空' });
  }

  if (!/^[a-z][a-z0-9:_-]{2,49}$/.test(normalizedKey)) {
    return res.status(400).json({ message: '权限字符格式不正确' });
  }

  const duplicated = roles.some((r) => r.key === normalizedKey);
  if (duplicated) {
    return res.status(409).json({ message: '权限字符已存在' });
  }

  const ts = now();
  const role: RoleRecord = {
    id: nextRoleId++,
    name: normalizedName,
    key: normalizedKey,
    sort: Number(sort) || 0,
    status: Boolean(status),
    createdAt: ts,
    updatedAt: ts,
  };

  roles.push(role);
  roleMenuMap[role.id] = [];
  res.status(201).json(role);
});

app.patch('/api/system/roles/:id', (req, res) => {
  const id = Number(req.params.id);
  const role = roles.find((r) => r.id === id);

  if (!role) {
    return res.status(404).json({ message: '角色不存在' });
  }

  const { name, key, sort, status } = req.body || {};
  const normalizedKey = key !== undefined ? String(key || '').trim().toLowerCase() : role.key;

  if (!/^[a-z][a-z0-9:_-]{2,49}$/.test(normalizedKey)) {
    return res.status(400).json({ message: '权限字符格式不正确' });
  }

  const duplicated = roles.some((r) => r.id !== id && r.key === normalizedKey);
  if (duplicated) {
    return res.status(409).json({ message: '权限字符已存在' });
  }

  if (name !== undefined) role.name = String(name || '').trim();
  role.key = normalizedKey;
  if (sort !== undefined) role.sort = Number(sort) || 0;
  if (status !== undefined) role.status = Boolean(status);
  role.updatedAt = now();

  res.json(role);
});

app.delete('/api/system/roles/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = roles.findIndex((r) => r.id === id);

  if (idx < 0) {
    return res.status(404).json({ message: '角色不存在' });
  }

  const [deleted] = roles.splice(idx, 1);
  delete roleMenuMap[id];
  res.json(deleted);
});

app.get('/api/system/roles/:id/menus', (req, res) => {
  const id = Number(req.params.id);
  if (!roles.some((r) => r.id === id)) {
    return res.status(404).json({ message: '角色不存在' });
  }
  res.json(roleMenuMap[id] || []);
});

app.put('/api/system/roles/:id/menus', (req, res) => {
  const id = Number(req.params.id);
  if (!roles.some((r) => r.id === id)) {
    return res.status(404).json({ message: '角色不存在' });
  }

  const menuIds = Array.isArray(req.body?.menuIds)
    ? req.body.menuIds.map((v: unknown) => Number(v)).filter((n: number) => Number.isFinite(n))
    : [];

  roleMenuMap[id] = menuIds;
  res.json({ roleId: id, menuIds });
});

app.get('/api/system/menus', (_req, res) => {
  res.json(menus);
});

app.post('/api/system/menus', (req, res) => {
  const { name, permission, component, sort = 1, status = true } = req.body || {};

  const normalizedName = String(name || '').trim();
  const normalizedPermission = String(permission || '').trim();
  const normalizedComponent = String(component || '').trim();

  if (!normalizedName || !normalizedPermission || !normalizedComponent) {
    return res.status(400).json({ message: '菜单名称、权限标识、组件路径不能为空' });
  }

  const menu: MenuRecord = {
    id: nextMenuId++,
    name: normalizedName,
    permission: normalizedPermission,
    component: normalizedComponent,
    sort: Number(sort) || 1,
    status: Boolean(status),
    createdAt: now(),
  };

  menus.push(menu);
  res.status(201).json(menu);
});

app.patch('/api/system/menus/:id', (req, res) => {
  const id = Number(req.params.id);
  const menu = menus.find((m) => m.id === id);

  if (!menu) {
    return res.status(404).json({ message: '菜单不存在' });
  }

  const { name, permission, component, sort, status } = req.body || {};

  if (name !== undefined) menu.name = String(name || '').trim() || menu.name;
  if (permission !== undefined) menu.permission = String(permission || '').trim() || menu.permission;
  if (component !== undefined) menu.component = String(component || '').trim() || menu.component;
  if (sort !== undefined) menu.sort = Number(sort) || menu.sort;
  if (status !== undefined) menu.status = Boolean(status);

  res.json(menu);
});

app.delete('/api/system/menus/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = menus.findIndex((m) => m.id === id);

  if (idx < 0) {
    return res.status(404).json({ message: '菜单不存在' });
  }

  const [deleted] = menus.splice(idx, 1);
  res.json(deleted);
});

app.get('/api/system/depts', (_req, res) => {
  res.json([]);
});

app.get('/api/system/posts', (_req, res) => {
  res.json([]);
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Mock API route not found' });
});

app.listen(PORT, () => {
  console.log(`Mock API server is running at http://localhost:${PORT}/api`);
});
