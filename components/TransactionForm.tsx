
import React, { useState, useEffect } from 'react';
import { X, Calendar, Wallet, Tag, FileText, Check, CreditCard } from 'lucide-react';
import { db } from '../firebase';
import { Category, Project, TransactionType, Transaction, PaymentMethod } from '../types';
import * as firestoreService from '../firestore-service';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface TransactionFormProps {
  onClose: () => void;
  onSave: () => void;
  initialData?: Transaction;
}

const getDateString = (date: any): string => {
  if (!date) return new Date().toISOString().split('T')[0];
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  if (typeof date === 'object' && 'toDate' in date) {
    return (date as any).toDate().toISOString().split('T')[0];
  }
  return new Date(date).toISOString().split('T')[0];
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialData?.amount ? String(initialData.amount) : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [paymentMethodId, setPaymentMethodId] = useState(initialData?.paymentMethodId || '');
  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [date, setDate] = useState(getDateString(initialData?.date));
  const [memo, setMemo] = useState(initialData?.memo || '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories by type
        const q1 = query(collection(db, 'categories'), where('type', '==', type));
        const catDocs = await getDocs(q1);
        const cats = catDocs.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id
          } as Category))
          .sort((a, b) => a.order - b.order);

        // Fetch payment methods by type
        const q2 = query(collection(db, 'paymentMethods'), where('type', '==', type));
        const payDocs = await getDocs(q2);
        const pays = payDocs.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id
          } as PaymentMethod))
          .sort((a, b) => a.order - b.order);

        // Fetch active projects
        const projs = await firestoreService.getAllProjects();
        const activeProjs = projs.filter(p => p.status === 'active');

        setCategories(cats);
        setPaymentMethods(pays);
        setProjects(activeProjs);

        // Auto-select first item if current selection is invalid for the new type
        if (cats.length > 0 && (!category || !cats.find(c => c.id === category))) {
          setCategory(cats[0].id);
        }
        if (pays.length > 0 && (!paymentMethodId || !pays.find(p => p.id === paymentMethodId))) {
          setPaymentMethodId(pays[0].id);
        } else if (pays.length === 0) {
          setPaymentMethodId('');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // 에러 발생 시에도 폼 표시
      }
    };
    fetchData();
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    const getCreatedAt = (): string => {
      if (!initialData?.createdAt) return new Date().toISOString();
      if (typeof initialData.createdAt === 'string') return initialData.createdAt;
      if (typeof initialData.createdAt === 'object' && 'toDate' in initialData.createdAt) {
        return (initialData.createdAt as any).toDate().toISOString();
      }
      return new Date().toISOString();
    };

    const transactionData: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      type,
      amount: parseInt(amount),
      description,
      category,
      paymentMethodId: paymentMethodId || null,
      projectId: projectId || null,
      date: new Date(date).toISOString(),
      memo,
      createdAt: getCreatedAt(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (initialData) {
        await firestoreService.updateTransaction(initialData.id, transactionData);
      } else {
        await firestoreService.addTransaction(transactionData);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('저장 실패. 인터넷 연결을 확인하세요.');
      return;
    }

    onSave();
    onClose();
  };

  const labels = {
    category: type === 'income' ? '수입원' : '구매처',
    payment: type === 'income' ? '입금방법' : '결제수단',
    placeholder: type === 'income' ? '' : '어디에 사용하셨나요?'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? '거래 수정' : '새 거래 기록'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              지출
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              수입
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">금액</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₩</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">내용</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Tag size={18} /></span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={labels.placeholder}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category (Purchase Place / Income Source) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{labels.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-bold text-slate-700"
                required
              >
                <option value="" disabled>선택</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Method / Deposit Method */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{labels.payment}</label>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-bold text-slate-700"
              >
                <option value="">없음</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>{pm.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Project Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">프로젝트 (선택)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium"
              >
                <option value="">없음</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">날짜</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Memo */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가적인 정보를 입력하세요..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none font-medium text-sm"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              type === 'expense' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
            }`}
          >
            <Check size={20} strokeWidth={3} />
            {initialData ? '저장하기' : '기록 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
