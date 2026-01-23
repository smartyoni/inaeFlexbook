
import React from 'react';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScheduledExpenses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">예정 지출</h1>
      </header>

      <div className="py-20 flex flex-col items-center justify-center text-slate-300">
        <CalendarClock size={64} className="mb-4 opacity-20" />
        <p className="font-bold">예정 지출 기능 준비 중</p>
        <p className="text-xs mt-2 max-w-[200px] text-center">향후 발생할 큰 지출 계획을 미리 세워보세요.</p>
      </div>
    </div>
  );
};

export default ScheduledExpenses;
