
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
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';
import TransactionForm from '../components/TransactionForm';
import DailyAnalysis from '../components/DailyAnalysis';
import * as firestoreService from '../firestore-service';

const Household: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAnalysisSheet, setShowAnalysisSheet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const fetchTransactions = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

      let results = await firestoreService.getTransactionsByDateRange(startOfMonth, endOfMonth);

      if (filter !== 'all') {
        results = results.filter(t => t.type === filter);
      }

      setTransactions(results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      const catsArray = await firestoreService.getAllCategories();
      const catsMap: Record<string, Category> = {};
      catsArray.forEach(c => catsMap[c.id] = c);
      setCategories(catsMap);

      const paysArray = await firestoreService.getAllPaymentMethods();
      const paysMap: Record<string, PaymentMethod> = {};
      paysArray.forEach(p => paysMap[p.id] = p);
      setPaymentMethods(paysMap);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentDate, filter]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 768;

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups: Record<string, typeof transactions>, transaction) => {
    // Handle both string and Firestore Timestamp formats
    let dateStr = transaction.date;
    if (typeof transaction.date === 'string') {
      dateStr = transaction.date;
    } else if (transaction.date && typeof transaction.date === 'object' && 'toDate' in transaction.date) {
      dateStr = (transaction.date as any).toDate().toISOString();
    }
    const dateKey = dateStr.split('T')[0]; // YYYY-MM-DD format
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {});

  // Auto-select date on desktop if none selected
  useEffect(() => {
    if (isDesktop && !selectedDate && Object.keys(groupedTransactions).length > 0) {
      const latestDate = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a))[0];
      setSelectedDate(latestDate);
    }
  }, [isDesktop, groupedTransactions, selectedDate]);

  // Helper to convert Firestore Timestamp to Date
  const getDate = (date: any): Date => {
    if (typeof date === 'string') {
      return new Date(date);
    } else if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as any).toDate();
    }
    return new Date(date);
  };

  // Helper to get date string in YYYY-MM-DD format
  const getDateString = (date: any): string => {
    if (typeof date === 'string') {
      return date.split('T')[0];
    } else if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as any).toDate().toISOString().split('T')[0];
    }
    return new Date(date).toISOString().split('T')[0];
  };

  // Calculate daily income and expense
  const getDailyStats = (dayTransactions: typeof transactions) => {
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    if (!isDesktop) {
      setShowAnalysisSheet(true);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    const dateKey = getDateString(transaction.date);
    setSelectedTransaction(transaction);
    handleDateClick(dateKey);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await firestoreService.deleteTransaction(id);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('삭제 실패. 다시 시도해주세요.');
      }
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await firestoreService.updateTransaction(id, updates);
      // Update local state
      setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
      // Update selectedTransaction if it's the one being updated
      if (selectedTransaction?.id === id) {
        setSelectedTransaction({ ...selectedTransaction, ...updates });
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('수정 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className={`${
      isDesktop
        ? 'max-w-7xl mx-auto px-4 pt-6 pb-12'
        : 'max-w-xl mx-auto px-4 pt-6 pb-12'
    }`}>
      {/* Header & Month Selector */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">가계부</h1>
          <p className="text-sm text-indigo-600 font-medium">나의 천사 김인애를 위해 만들었습니다.</p>
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
      <section className="grid grid-cols-3 gap-4 mb-8">
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
        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">총 잔액</span>
          </div>
          <div className="text-xl font-black">₩{balance.toLocaleString()}</div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Grid Layout for Desktop */}
      <div className={`${isDesktop ? 'grid grid-cols-2 gap-6' : 'block'}`}>
        {/* Left Column: Transactions */}
        <div>
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

          {/* Transaction List by Date */}
          <section className="space-y-6">
            {transactions.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-slate-300">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-bold">기록된 거래 내역이 없습니다</p>
              </div>
            ) : (
              Object.entries(groupedTransactions)
                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                .map(([date, dayTransactions]) => {
                  const dailyStats = getDailyStats(dayTransactions);
                  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  });
                  return (
                <div key={date}>
                  {/* Date Header */}
                  <div
                    onClick={() => handleDateClick(date)}
                    className={`px-2 mb-3 cursor-pointer transition-colors ${
                      selectedDate === date && isDesktop
                        ? 'bg-indigo-50 rounded-lg p-2 -mx-2'
                        : ''
                    }`}
                  >
                    <h3 className="text-sm font-bold text-slate-700">{displayDate}</h3>
                  </div>

                  {/* Daily Transactions */}
                  <div className="space-y-2 mb-3">
                    {dayTransactions.map((transaction) => {
                      const category = categories[transaction.category];
                      const paymentMethod = transaction.paymentMethodId ? paymentMethods[transaction.paymentMethodId] : null;
                      return (
                        <div
                          key={transaction.id}
                          onClick={() => handleTransactionClick(transaction)}
                          className={`group bg-white p-4 rounded-2xl shadow-sm border flex items-center justify-between transition-all hover:shadow-md cursor-pointer ${
                            selectedDate === getDateString(transaction.date) && isDesktop
                              ? 'border-indigo-500 ring-2 ring-indigo-100'
                              : 'border-slate-100 hover:border-indigo-100'
                          }`}
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
                                  {getDate(transaction.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
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
                    })}
                  </div>

                  {/* Daily Summary */}
                  <div className="px-2 py-3 bg-gradient-to-r from-emerald-50 to-rose-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-6">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">수입</span>
                          <span className="text-lg font-black text-emerald-600">+₩{dailyStats.income.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">지출</span>
                          <span className="text-lg font-black text-rose-600">-₩{dailyStats.expense.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">일 합계</span>
                        <span className={`text-lg font-black ${dailyStats.income - dailyStats.expense >= 0 ? 'text-indigo-600' : 'text-slate-800'}`}>
                          ₩{(dailyStats.income - dailyStats.expense).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                  );
                })
            )}
            </section>
          </div>

        {/* Right Column: Daily Analysis (Desktop Only) */}
        {isDesktop && selectedDate && (
          <div className="sticky top-6 h-[calc(100vh-8rem)]">
            <DailyAnalysis
              selectedDate={selectedDate}
              transactions={transactions}
              categories={categories}
              paymentMethods={paymentMethods}
              isMobile={false}
              selectedTransaction={selectedTransaction}
              onUpdateTransaction={handleUpdateTransaction}
            />
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => { setEditingTransaction(undefined); setIsFormOpen(true); }}
        className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all z-40"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Mobile Bottom Sheet */}
      {!isDesktop && showAnalysisSheet && selectedDate && (
        <DailyAnalysis
          selectedDate={selectedDate}
          transactions={transactions}
          categories={categories}
          paymentMethods={paymentMethods}
          isMobile={true}
          onClose={() => setShowAnalysisSheet(false)}
          selectedTransaction={selectedTransaction}
          onUpdateTransaction={handleUpdateTransaction}
        />
      )}

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
