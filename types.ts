
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  order: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: TransactionType; // Added type field
  color: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  status: 'active' | 'completed' | 'archived';
  locked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string; // ID of the category (Purchase Place / Income Source)
  paymentMethodId: string | null; 
  projectId: string | null;
  date: string; // ISO string
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountAlias?: string;
  accountNumber?: string;
  memo?: string;
  createdAt: string;
  isActive: boolean;
  isFavorite?: boolean;
}

export interface AccountBalance {
  id: string;
  accountId: string;
  amount: number;
  memo?: string;
  timestamp: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  memo?: string;
  isActive: boolean;
  recurrenceType: 'regular' | 'irregular';
  months?: number[]; // [1, 2, ..., 12]
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  scheduledDate: string;
  memo?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
