
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as firestoreService from '../firestore-service';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

const Statistics: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const transactions = await firestoreService.getTransactionsByYear(year);

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}월`,
        income: 0,
        expense: 0
      }));

      transactions.forEach(t => {
        const monthIdx = new Date(t.date).getMonth();
        if (t.type === 'income') monthlyData[monthIdx].income += t.amount;
        else monthlyData[monthIdx].expense += t.amount;
      });

      setData(monthlyData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">통계</h1>
          <p className="text-sm text-slate-400 font-medium">연간 흐름 요약</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-full shadow-sm border border-slate-100">
          <button onClick={() => setYear(year - 1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-700 min-w-[60px] text-center">{year}년</span>
          <button onClick={() => setYear(year + 1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 size={16} /> 월별 수입/지출 추이
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${(val / 10000).toFixed(0)}만`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} name="수입" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} name="지출" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white">
          <h3 className="text-xs font-bold opacity-80 uppercase tracking-widest mb-6">연간 총계</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className="block text-[10px] font-bold opacity-60 uppercase mb-1">총 수입</span>
              <span className="text-xl font-black">₩{data.reduce((s, d) => s + d.income, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold opacity-60 uppercase mb-1">총 지출</span>
              <span className="text-xl font-black">₩{data.reduce((s, d) => s + d.expense, 0).toLocaleString()}</span>
            </div>
            <div className="col-span-2 pt-4 border-t border-white/10">
              <span className="block text-[10px] font-bold opacity-60 uppercase mb-1">연간 순수익</span>
              <span className="text-2xl font-black">
                ₩{(data.reduce((s, d) => s + d.income, 0) - data.reduce((s, d) => s + d.expense, 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
