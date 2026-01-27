import React from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { Project, Transaction, Category, PaymentMethod } from '../types';

interface ProjectDetailPanelProps {
  project: Project;
  transactions: Transaction[];
  categories: Record<string, Category>;
  paymentMethods: Record<string, PaymentMethod>;
  isMobile: boolean;
  onClose?: () => void;
  onDelete?: (projectId: string) => void;
}

const ProjectDetailPanel: React.FC<ProjectDetailPanelProps> = ({
  project,
  transactions,
  categories,
  paymentMethods,
  isMobile,
  onClose,
  onDelete
}) => {
  // Helper to convert Firestore Timestamp to Date
  const getDate = (date: any): Date => {
    if (typeof date === 'string') {
      return new Date(date);
    } else if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as any).toDate();
    }
    return new Date(date);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net = totalIncome - totalExpense;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
            style={{ backgroundColor: project.color }}
          >
            {project.name[0]}
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-800 mb-2">{project.name}</h1>
        <p className="text-slate-500 text-sm mb-6">{project.description || '설명이 없습니다.'}</p>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 mb-6">
          <div className="text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">총 수입</span>
            <span className="text-sm font-black text-emerald-500">₩{totalIncome.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">총 지출</span>
            <span className="text-sm font-black text-rose-500">₩{totalExpense.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">수지타산</span>
            <span className={`text-sm font-black ${net >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
              ₩{net.toLocaleString()}
            </span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">프로젝트 관련 내역</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-300">
              <p className="text-sm font-bold">연결된 내역이 없습니다</p>
            </div>
          ) : (
            transactions.map(t => {
              const txDate = getDate(t.date);
              const dateStr = txDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
              const timeStr = txDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
              return (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{t.description}</h4>
                    <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                      {t.type === 'income' ? '+' : '-'} ₩{t.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
                    <span className="text-[11px] text-slate-400">{timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Mobile Layout (Bottom Sheet)
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[90]" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="px-6 pb-12">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
              style={{ backgroundColor: project.color }}
            >
              {project.name[0]}
            </div>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <h1 className="text-2xl font-black text-slate-800 mb-2">{project.name}</h1>
          <p className="text-slate-500 text-sm mb-6">{project.description || '설명이 없습니다.'}</p>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 mb-6">
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">총 수입</span>
              <span className="text-sm font-black text-emerald-500">₩{totalIncome.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">총 지출</span>
              <span className="text-sm font-black text-rose-500">₩{totalExpense.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">수지타산</span>
              <span className={`text-sm font-black ${net >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
                ₩{net.toLocaleString()}
              </span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">프로젝트 관련 내역</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-300">
                <p className="text-sm font-bold">연결된 내역이 없습니다</p>
              </div>
            ) : (
              transactions.map(t => {
                const txDate = getDate(t.date);
                const dateStr = txDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                const timeStr = txDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">{t.description}</h4>
                      <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {t.type === 'income' ? '+' : '-'} ₩{t.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
                      <span className="text-[11px] text-slate-400">{timeStr}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailPanel;
