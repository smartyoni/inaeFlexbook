import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Transaction,
  Category,
  PaymentMethod,
  Project,
  BankAccount,
  AccountBalance,
  RecurringExpense,
  ScheduledExpense
} from './types';

// Collections
const transactionsRef = collection(db, 'transactions');
const categoriesRef = collection(db, 'categories');
const paymentMethodsRef = collection(db, 'paymentMethods');
const projectsRef = collection(db, 'projects');
const bankAccountsRef = collection(db, 'bankAccounts');
const accountBalancesRef = collection(db, 'accountBalances');
const recurringExpensesRef = collection(db, 'recurringExpenses');
const scheduledExpensesRef = collection(db, 'scheduledExpenses');
const checklistCardsRef = collection(db, 'checklistCards');

// Helper: Convert Firestore doc to typed object
const docToObject = <T extends { id: string }>(doc: any): T => ({
  ...doc.data(),
  id: doc.id,
} as T);

// Transactions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    date: Timestamp.fromDate(new Date(transaction.date))
  });
  return docRef.id;
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
  const updateData = { ...transaction };
  if (transaction.date) {
    (updateData as any).date = Timestamp.fromDate(new Date(transaction.date));
  }
  await updateDoc(doc(transactionsRef, id), updateData);
};

export const deleteTransaction = async (id: string) => {
  await deleteDoc(doc(transactionsRef, id));
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string) => {
  const q = query(
    transactionsRef,
    where('date', '>=', Timestamp.fromDate(new Date(startDate))),
    where('date', '<=', Timestamp.fromDate(new Date(endDate)))
  );
  const docs = await getDocs(q);
  return docs.docs
    .map(docToObject<Transaction>)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTransactionsByProjectId = async (projectId: string): Promise<Transaction[]> => {
  const q = query(
    transactionsRef,
    where('projectId', '==', projectId)
  );
  const docs = await getDocs(q);
  return docs.docs
    .map(docToObject<Transaction>)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const updateTransactionProjectId = async (projectId: string, newProjectId: string | null) => {
  const q = query(transactionsRef, where('projectId', '==', projectId));
  const docs = await getDocs(q);
  for (const docSnap of docs.docs) {
    await updateDoc(doc(transactionsRef, docSnap.id), { projectId: newProjectId });
  }
};

export const getTransactionsByYear = async (year: number): Promise<Transaction[]> => {
  const startOfYear = new Date(year, 0, 1).toISOString();
  const endOfYear = new Date(year, 11, 31).toISOString();
  return getTransactionsByDateRange(startOfYear, endOfYear);
};

export const getTransactionsByMonthAndType = async (year: number, month: number, type: 'income' | 'expense'): Promise<Transaction[]> => {
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0).toISOString();
  const transactions = await getTransactionsByDateRange(startOfMonth, endOfMonth);
  return transactions.filter(t => t.type === type);
};

// Categories
export const addCategory = async (category: Omit<Category, 'id'>) => {
  const docRef = await addDoc(categoriesRef, category);
  return docRef.id;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  await updateDoc(doc(categoriesRef, id), category);
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(categoriesRef, id));
};

export const getAllCategories = async (): Promise<Category[]> => {
  const docs = await getDocs(categoriesRef);
  return docs.docs
    .map(docToObject<Category>)
    .sort((a, b) => a.order - b.order);
};

// Payment Methods
export const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
  const docRef = await addDoc(paymentMethodsRef, method);
  return docRef.id;
};

export const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
  await updateDoc(doc(paymentMethodsRef, id), method);
};

export const deletePaymentMethod = async (id: string) => {
  await deleteDoc(doc(paymentMethodsRef, id));
};

export const getAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const docs = await getDocs(paymentMethodsRef);
  return docs.docs
    .map(docToObject<PaymentMethod>)
    .sort((a, b) => a.order - b.order);
};

// Projects
export const addProject = async (project: Omit<Project, 'id'>) => {
  const docRef = await addDoc(projectsRef, project);
  return docRef.id;
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  await updateDoc(doc(projectsRef, id), project);
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(projectsRef, id));
};

export const getAllProjects = async (): Promise<Project[]> => {
  const docs = await getDocs(projectsRef);
  return docs.docs
    .map(docToObject<Project>)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, 'projects', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToObject<Project>(docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
};

// Bank Accounts
export const addBankAccount = async (account: Omit<BankAccount, 'id'>) => {
  const docRef = await addDoc(bankAccountsRef, account);
  return docRef.id;
};

export const updateBankAccount = async (id: string, account: Partial<BankAccount>) => {
  await updateDoc(doc(bankAccountsRef, id), account);
};

export const deleteAccount = async (id: string) => {
  await deleteDoc(doc(bankAccountsRef, id));
};

export const getAllBankAccounts = async (): Promise<BankAccount[]> => {
  const docs = await getDocs(bankAccountsRef);
  return docs.docs.map(docToObject<BankAccount>);
};

// Account Balances
export const addAccountBalance = async (balance: Omit<AccountBalance, 'id'>) => {
  const docRef = await addDoc(accountBalancesRef, {
    ...balance,
    timestamp: Timestamp.fromDate(new Date(balance.timestamp))
  });
  return docRef.id;
};

export const getAccountBalances = async (accountId: string): Promise<AccountBalance[]> => {
  const q = query(
    accountBalancesRef,
    where('accountId', '==', accountId)
  );
  const docs = await getDocs(q);
  return docs.docs
    .map(docToObject<AccountBalance>)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Recurring Expenses
export const addRecurringExpense = async (expense: Omit<RecurringExpense, 'id'>) => {
  const docRef = await addDoc(recurringExpensesRef, expense);
  return docRef.id;
};

export const updateRecurringExpense = async (id: string, expense: Partial<RecurringExpense>) => {
  await updateDoc(doc(recurringExpensesRef, id), expense);
};

export const deleteRecurringExpense = async (id: string) => {
  await deleteDoc(doc(recurringExpensesRef, id));
};

export const getAllRecurringExpenses = async (): Promise<RecurringExpense[]> => {
  const docs = await getDocs(recurringExpensesRef);
  return docs.docs.map(docToObject<RecurringExpense>);
};

// Scheduled Expenses
export const addScheduledExpense = async (expense: Omit<ScheduledExpense, 'id'>) => {
  const docRef = await addDoc(scheduledExpensesRef, {
    ...expense,
    scheduledDate: Timestamp.fromDate(new Date(expense.scheduledDate))
  });
  return docRef.id;
};

export const updateScheduledExpense = async (id: string, expense: Partial<ScheduledExpense>) => {
  const updateData = { ...expense };
  if (expense.scheduledDate) {
    (updateData as any).scheduledDate = Timestamp.fromDate(new Date(expense.scheduledDate));
  }
  await updateDoc(doc(scheduledExpensesRef, id), updateData);
};

export const deleteScheduledExpense = async (id: string) => {
  await deleteDoc(doc(scheduledExpensesRef, id));
};

export const getAllScheduledExpenses = async (): Promise<ScheduledExpense[]> => {
  const docs = await getDocs(scheduledExpensesRef);
  return docs.docs.map(docToObject<ScheduledExpense>);
};

export const getScheduledExpensesByStatus = async (status: string): Promise<ScheduledExpense[]> => {
  const q = query(scheduledExpensesRef, where('status', '==', status));
  const docs = await getDocs(q);
  return docs.docs.map(docToObject<ScheduledExpense>);
};

// Checklist Cards
export const addChecklistCard = async (card: any) => {
  const docRef = await addDoc(checklistCardsRef, {
    ...card,
    createdAt: Timestamp.fromDate(new Date(card.createdAt))
  });
  return docRef.id;
};

export const updateChecklistCard = async (id: string, card: any) => {
  const updateData = { ...card };
  if (card.createdAt && typeof card.createdAt === 'string') {
    updateData.createdAt = Timestamp.fromDate(new Date(card.createdAt));
  }
  await updateDoc(doc(checklistCardsRef, id), updateData);
};

export const deleteChecklistCard = async (id: string) => {
  await deleteDoc(doc(checklistCardsRef, id));
};

export const getAllChecklistCards = async (): Promise<any[]> => {
  const docs = await getDocs(checklistCardsRef);
  return docs.docs.map(docToObject<any>);
};
