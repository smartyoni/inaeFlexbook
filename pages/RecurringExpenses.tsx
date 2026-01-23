
import React from 'react';
import { ArrowLeft, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecurringExpenses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">고정 지출</h1>
      </header>

      <div className="py-20 flex flex-col items-center justify-center text-slate-300">
        <BellOff size={64} className="mb-4 opacity-20" />
        <p className="font-bold">고정 지출 기능 준비 중</p>
        <p className="text-xs mt-2 max-w-[200px] text-center">월세, 통신비 등 매달 반복되는 지출을 자동화하는 기능을 곧 선보입니다.</p>
      </div>
    </div>
  );
};

export default RecurringExpenses;
