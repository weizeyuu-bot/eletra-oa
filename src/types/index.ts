// User-related types
export interface User {
  id: string | number;
  email: string;
  username: string;
  nickname?: string;
  dept?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'MANAGER' | 'APPROVER' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED' | boolean;
  createdAt: string;
}

// Auth-related types
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'status'>;
}

// Expense-related types
export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  submittedBy: string;
  submitter?: User;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  currency?: string;
  category: string;
  description?: string;
  attachments?: string[];
}

export interface UpdateExpenseRequest {
  title?: string;
  amount?: number;
  category?: string;
  description?: string;
  status?: Expense['status'];
}

// Workflow-related types
export interface Workflow {
  id: string;
  title: string;
  description?: string;
  type: 'EXPENSE_REIMBURSEMENT' | 'LEAVE_REQUEST' | 'PURCHASE_ORDER' | 'TRAVEL_REQUEST';
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  steps?: WorkflowStep[];
  createdBy: string;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  approverRole: string;
}

export interface CreateWorkflowRequest {
  title: string;
  description?: string;
  type: Workflow['type'];
  steps: Array<{
    title: string;
    description?: string;
    approverRole: string;
  }>;
}

// Approval-related types
export interface Approval {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
