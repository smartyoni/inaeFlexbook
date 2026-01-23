
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { PaymentMethod, TransactionType } from '../types';

const PaymentMethodManagement: React.FC = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#6366f1');

  const fetchMethods = async () => {
    const data = await db.paymentMethods.toArray();
    setMethods(data.sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#6366f1');
    setEditingMethod(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setName(method.name);
    setType(method.type);
    setColor(method.color);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isIncome = methods.find(m => m.id === id)?.type === 'income';
    const label = isIncome ? '입금방법' : '결제수단';
    if (confirm(`이 ${label}을 삭제하시겠습니까? 기존 내역의 정보가 사라질 수 있습니다.`)) {
      await db.paymentMethods.delete(id);
      fetchMethods();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const methodData = {
      id: editingMethod?.id || crypto.randomUUID(),
      name,
      type,
      color,
      order: editingMethod?.order ?? methods.length
    };

    if (editingMethod) {
      await db.paymentMethods.update(editingMethod.id, methodData);
    } else {
      await db.paymentMethods.add(methodData);
    }

    setIsModalOpen(false);
    fetchMethods();
    resetForm();
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">수단 관리</h1>
          <p className="text-sm text-slate-400 font-medium">결제수단 및 입금방법 관리</p>
        </div>
      </header>

      <div className="space-y-6">
        {(['expense', 'income'] as TransactionType[]).map((sectionType) => {
          const filtered = methods.filter(m => m.type === sectionType);
          const title = sectionType === 'expense' ? '결제수단 (지출 시 사용)' : '입금방법 (수입 시 사용)';
          
          return (
            <div key={sectionType} className="space-y-3">
              <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {title}
              </h3>
              {filtered.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-8 text-center text-slate-300">
                  <p className="text-xs font-bold">등록된 항목이 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {filtered.map((method, idx) => (
                    <div 
                      key={method.id} 
                      className={`flex items-center justify-between p-4 ${idx !== filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
                          style={{ backgroundColor: method.color }}
                        >
                          {method.name[0]}
                        </div>
                        <span className="font-bold text-slate-700">{method.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenEdit(method)} 
                          className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(method.id)} 
                          className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleOpenAdd}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all z-40"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingMethod ? '정보 수정' : '새 수단 추가'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">구분</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    결제수단
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    입금방법
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">이름</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder={type === 'expense' ? "예: 신한카드, 네이버페이" : "예: 급여계좌, 현금"}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">테마 색상</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                  />
                  <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 truncate uppercase">
                    {color}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 text-white font-black bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Check size={20} strokeWidth={3} />
                저장하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManagement;
