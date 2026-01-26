
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { X, PieChart as PieIcon, Edit2, Check } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';

interface DailyAnalysisProps {
  selectedDate: string; // YYYY-MM-DD format
  transactions: Transaction[];
  categories: Record<string, Category>;
  isMobile: boolean;
  onClose?: () => void;
  selectedTransaction?: Transaction | null;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => Promise<void>;
}

const DailyAnalysis: React.FC<DailyAnalysisProps> = ({
  selectedDate,
  transactions,
  categories,
  isMobile,
  onClose,
  selectedTransaction,
  onUpdateTransaction
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [editingMemoText, setEditingMemoText] = useState(selectedTransaction?.memo || '');

  // Update editing memo text when selected transaction changes
  React.useEffect(() => {
    setEditingMemoText(selectedTransaction?.memo || '');
    setIsEditingMemo(false);
  }, [selectedTransaction?.id]);

  // Handle save memo
  const handleSaveMemo = async () => {
    if (!selectedTransaction || !onUpdateTransaction) return;
    try {
      await onUpdateTransaction(selectedTransaction.id, { memo: editingMemoText });
      setIsEditingMemo(false);
    } catch (error) {
      console.error('Error updating memo:', error);
    }
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

  // Filter and process transactions for selected date
  const chartData = useMemo(() => {
    const dailyTransactions = transactions.filter(t => {
      const txDate = getDateString(t.date);
      return txDate === selectedDate && t.type === type;
    });

    // Group by category
    const grouping: Record<string, number> = {};
    dailyTransactions.forEach(t => {
      const catName = categories[t.category]?.name || '미지정';
      grouping[catName] = (grouping[catName] || 0) + t.amount;
    });

    // Create chart data
    const data = Object.entries(grouping)
      .map(([name, value]) => ({
        name,
        value,
        color:
          Object.values(categories).find(c => c.name === name)?.color || '#cbd5e1'
      }))
      .sort((a, b) => b.value - a.value);

    return data;
  }, [selectedDate, transactions, type, categories]);

  // Format selected date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Desktop Panel Layout
  if (!isMobile) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full overflow-y-auto">
        <h2 className="text-lg font-bold text-slate-800 mb-6">{formatDate(selectedDate)}</h2>

        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              type === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            지출 분석
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              type === 'income' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            수입 분석
          </button>
        </div>

        {/* Chart and List */}
        {chartData.length > 0 ? (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-8">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-800">
                      ₩{item.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                      {((item.value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Transaction Memo */}
            {selectedTransaction && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700">📝 메모</h3>
                  {!isEditingMemo && onUpdateTransaction && (
                    <button
                      onClick={() => setIsEditingMemo(true)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
                {isEditingMemo ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingMemoText}
                      onChange={(e) => setEditingMemoText(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={4}
                      placeholder="메모를 입력하세요..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveMemo}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Check size={16} /> 저장
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingMemo(false);
                          setEditingMemoText(selectedTransaction.memo || '');
                        }}
                        className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">
                    {selectedTransaction.memo || '메모가 없습니다'}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300">
            <PieIcon size={48} className="mb-4 opacity-20" />
            <p className="font-bold">해당 날짜에 {type === 'expense' ? '지출' : '수입'}이 없습니다</p>
          </div>
        )}
      </div>
    );
  }

  // Mobile Bottom Sheet Layout
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[90]"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="px-6 pb-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">{formatDate(selectedDate)}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                type === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              지출 분석
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                type === 'income' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              수입 분석
            </button>
          </div>

          {/* Chart and List */}
          {chartData.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 mt-8">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-800">
                        ₩{item.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                        {((item.value / total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Transaction Memo */}
              {selectedTransaction && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700">📝 메모</h3>
                    {!isEditingMemo && onUpdateTransaction && (
                      <button
                        onClick={() => setIsEditingMemo(true)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                  {isEditingMemo ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingMemoText}
                        onChange={(e) => setEditingMemoText(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        rows={4}
                        placeholder="메모를 입력하세요..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveMemo}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Check size={16} /> 저장
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingMemo(false);
                            setEditingMemoText(selectedTransaction.memo || '');
                          }}
                          className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedTransaction.memo || '메모가 없습니다'}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300">
              <PieIcon size={48} className="mb-4 opacity-20" />
              <p className="font-bold">해당 날짜에 {type === 'expense' ? '지출' : '수입'}이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DailyAnalysis;
