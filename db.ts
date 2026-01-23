
import { Dexie, type Table } from 'dexie';
import { Transaction, Category, Project, BankAccount, AccountBalance, RecurringExpense, ScheduledExpense, PaymentMethod } from './types';

// The FlexBookDB class extends Dexie to provide a strongly-typed database interface.
export class FlexBookDB extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  paymentMethods!: Table<PaymentMethod>;
  projects!: Table<Project>;
  bankAccounts!: Table<BankAccount>;
  accountBalances!: Table<AccountBalance>;
  recurringExpenses!: Table<RecurringExpense>;
  scheduledExpenses!: Table<ScheduledExpense>;

  constructor() {
    super('FlexBookDB');
    
    // Fix: Using named import { Dexie } instead of default import ensures that the 'version' method 
    // from the base class is properly recognized and inherited by the TypeScript compiler.
    this.version(3).stores({
      transactions: 'id, type, category, paymentMethodId, projectId, date',
      categories: 'id, name, type',
      paymentMethods: 'id, name, type', // Added type to index
      projects: 'id, name, status',
      bankAccounts: 'id, bankName',
      accountBalances: 'id, accountId, timestamp',
      recurringExpenses: 'id, category',
      scheduledExpenses: 'id, status, scheduledDate'
    });
  }
}

export const db = new FlexBookDB();

export const initializeSeedData = async () => {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    console.log("FlexBook: No purchase places found.");
  }
};
