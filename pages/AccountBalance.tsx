
import React, { useState, useEffect } from 'react';
import * as firestoreService from '../firestore-service';
import { BankAccount } from '../types';
import { Plus, CreditCard, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountBalance: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', alias: '' });

  const fetchAccounts = async () => {
    try {
      const data = await firestoreService.getAllBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = async () => {
    if (!newAcc.name) return;
    try {
      await firestoreService.addBankAccount({
        bankName: newAcc.name,
        accountAlias: newAcc.alias,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      setNewAcc({ name: '', alias: '' });
      setIsAdding(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      alert('계좌 추가에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">계좌 관리</h1>
      </header>

      <div className="space-y-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{acc.bankName}</h3>
                <p className="text-xs text-slate-400 font-medium">{acc.accountAlias || '별칭 없음'}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (confirm('계좌를 삭제하시겠습니까?')) {
                  try {
                    await firestoreService.deleteAccount(acc.id);
                    fetchAccounts();
                  } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('계좌 삭제에 실패했습니다.');
                  }
                }
              }}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
            <input 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="은행명"
              value={newAcc.name}
              onChange={e => setNewAcc({...newAcc, name: e.target.value})}
            />
            <input 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="계좌 별칭"
              value={newAcc.alias}
              onChange={e => setNewAcc({...newAcc, alias: e.target.value})}
            />
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold">취소</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">추가</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Plus size={20} /> 새 계좌 등록
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountBalance;
