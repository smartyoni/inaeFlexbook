
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Trash2,
  Edit2,
  Wallet
} from 'lucide-react';
import { db } from '../db';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';
import TransactionForm from '../components/TransactionForm';

const Household: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');

  const fetchTransactions = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
    
    let query = db.transactions
      .where('date')
      .between(startOfMonth, endOfMonth, true, true);
    
    let results = await query.toArray();
    
    if (filter !== 'all') {
      results = results.filter(t => t.type === filter);
    }
    
    setTransactions(results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const catsArray = await db.categories.toArray();
    const catsMap: Record<string, Category> = {};
    catsArray.forEach(c => catsMap[c.id] = c);
    setCategories(catsMap);

    const paysArray = await db.paymentMethods.toArray();
    const paysMap: Record<string, PaymentMethod> = {};
    paysArray.forEach(p => paysMap[p.id] = p);
    setPaymentMethods(paysMap);
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentDate, filter]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await db.transactions.delete(id);
      fetchTransactions();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      {/* Header & Month Selector */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">가계부</h1>
          <p className="text-sm text-slate-400 font-medium">실시간 금융 관리</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-full shadow-sm border border-slate-100">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-700 min-w-[100px] text-center">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-200 text-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">수입</span>
            <ArrowUpRight size={16} className="opacity-80" />
          </div>
          <div className="text-xl font-black">₩{totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-rose-500 p-4 rounded-2xl shadow-lg shadow-rose-200 text-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">지출</span>
            <ArrowDownRight size={16} className="opacity-80" />
          </div>
          <div className="text-xl font-black">₩{totalExpense.toLocaleString()}</div>
        </div>
        <div className="col-span-2 bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest block mb-1">총 잔액</span>
            <div className="text-3xl font-black tracking-tight">₩{balance.toLocaleString()}</div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="flex gap-2 mb-6 overflow-x-auto no-scrollbar py-1">
        <button 
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          전체
        </button>
        <button 
          onClick={() => setFilter('income')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === 'income' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          수입만
        </button>
        <button 
          onClick={() => setFilter('expense')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === 'expense' ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          지출만
        </button>
      </section>

      {/* Transaction List */}
      <section className="space-y-4">
        {transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-slate-300">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-bold">기록된 거래 내역이 없습니다</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const category = categories[transaction.category];
            const paymentMethod = transaction.paymentMethodId ? paymentMethods[transaction.paymentMethodId] : null;
            return (
              <div 
                key={transaction.id} 
                className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:border-indigo-100"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: category?.color || '#cbd5e1' }}
                  >
                    <span className="font-black text-xs">{category?.name?.[0] || 'T'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{transaction.description}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{category?.name}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      {paymentMethod && (
                        <>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md text-white font-bold uppercase tracking-tight" style={{ backgroundColor: paymentMethod.color }}>
                            {paymentMethod.name}
                          </span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        </>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(transaction.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`font-black text-lg ${transaction.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                    {transaction.type === 'income' ? '+' : '-'} ₩{transaction.amount.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTransaction(transaction); setIsFormOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(transaction.id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => { setEditingTransaction(undefined); setIsFormOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all z-40"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Modal */}
      {isFormOpen && (
        <TransactionForm 
          onClose={() => setIsFormOpen(false)} 
          onSave={fetchTransactions}
          initialData={editingTransaction}
        />
      )}
    </div>
  );
};

export default Household;
