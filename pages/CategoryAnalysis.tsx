
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import * as firestoreService from '../firestore-service';
import { Transaction, Category, PaymentMethod, TransactionType } from '../types';
import { ChevronLeft, ChevronRight, PieChart as PieIcon } from 'lucide-react';

type AnalysisMode = 'monthly' | 'custom';
type AnalysisBy = 'category' | 'paymentMethod';

const CategoryAnalysis: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [type, setType] = useState<TransactionType>('expense');
  const [mode, setMode] = useState<AnalysisMode>('monthly');
  const [analysisBy, setAnalysisBy] = useState<AnalysisBy>('category');
  const [customStartDate, setCustomStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);

  const fetchData = async () => {
    try {
      let startDate: string;
      let endDate: string;

      if (mode === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      } else {
        startDate = new Date(customStartDate + 'T00:00:00').toISOString();
        endDate = new Date(customEndDate + 'T23:59:59').toISOString();
      }

      const transactions = await firestoreService.getTransactionsByDateRange(startDate, endDate);
      const filteredTransactions = transactions.filter(t => t.type === type);

      let chartData: { name: string; value: number; color: string }[] = [];

      if (analysisBy === 'category') {
        const categories = await firestoreService.getAllCategories();
        const catsMap: Record<string, Category> = {};
        categories.forEach(c => catsMap[c.id] = c);

        const grouping: Record<string, number> = {};
        filteredTransactions.forEach(t => {
          const catName = catsMap[t.category]?.name || '미지정';
          grouping[catName] = (grouping[catName] || 0) + t.amount;
        });

        chartData = Object.entries(grouping).map(([name, value]) => ({
          name,
          value,
          color: categories.find(c => c.name === name)?.color || '#cbd5e1'
        })).sort((a, b) => b.value - a.value);
      } else {
        // analysisBy === 'paymentMethod'
        const paymentMethods = await firestoreService.getAllPaymentMethods();
        const methodsMap: Record<string, PaymentMethod> = {};
        paymentMethods.forEach(m => methodsMap[m.id] = m);

        const grouping: Record<string, number> = {};
        filteredTransactions.forEach(t => {
          if (t.paymentMethodId) {
            const methodName = methodsMap[t.paymentMethodId]?.name || '미지정';
            grouping[methodName] = (grouping[methodName] || 0) + t.amount;
          }
        });

        chartData = Object.entries(grouping).map(([name, value]) => ({
          name,
          value,
          color: Object.values(methodsMap).find(m => m.name === name)?.color || '#cbd5e1'
        })).sort((a, b) => b.value - a.value);
      }

      setData(chartData);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate, type, mode, customStartDate, customEndDate, analysisBy]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getHeaderTitle = () => {
    if (type === 'expense') {
      return analysisBy === 'category' ? '구매처 분석' : '결제수단 분석';
    } else {
      return analysisBy === 'category' ? '수입원 분석' : '입금방법 분석';
    }
  };

  const getAnalysisLabel = () => {
    if (type === 'expense') {
      return analysisBy === 'category' ? '구매처' : '결제수단';
    } else {
      return analysisBy === 'category' ? '수입원' : '입금방법';
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{getHeaderTitle()}</h1>
          <p className="text-sm text-slate-400 font-medium">
            {type === 'expense' ? '소비 패턴 파악하기' : '수입 구성 파악하기'}
          </p>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('monthly')}
          className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            mode === 'monthly'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          월별
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            mode === 'custom'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          기간설정
        </button>
      </div>

      {/* Month Selector (Monthly Mode) */}
      {mode === 'monthly' && (
        <div className="flex items-center justify-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-700 min-w-[100px] text-center">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Date Range Picker (Custom Mode) */}
      {mode === 'custom' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                시작일
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                종료일
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
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

        {/* Analysis Target Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setAnalysisBy('category')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              analysisBy === 'category' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            {type === 'expense' ? '구매처' : '수입원'}
          </button>
          <button
            onClick={() => setAnalysisBy('paymentMethod')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              analysisBy === 'paymentMethod' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            {type === 'expense' ? '결제수단' : '입금방법'}
          </button>
        </div>

        {data.length > 0 ? (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-8">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-800">₩{item.value.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                      {((item.value / data.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300">
            <PieIcon size={48} className="mb-4 opacity-20" />
            <p className="font-bold">
              {analysisBy === 'paymentMethod' && type === 'expense'
                ? '결제수단이 등록된 지출내역이 없습니다'
                : analysisBy === 'paymentMethod' && type === 'income'
                ? '입금방법이 등록된 수입내역이 없습니다'
                : `${type === 'expense' ? '지출' : '수입'}이 없습니다`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAnalysis;
