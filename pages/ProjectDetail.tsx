
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Target, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';
import { db } from '../db';
import { Project, Transaction } from '../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      const proj = await db.projects.get(id);
      if (!proj) return navigate('/projects');
      setProject(proj);

      const trans = await db.transactions.where('projectId').equals(id).toArray();
      setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    fetchDetails();
  }, [id, navigate]);

  if (!project) return null;

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net = totalIncome - totalExpense;

  const handleDeleteProject = async () => {
    if (confirm('프로젝트와 관련된 모든 기록 연결이 해제됩니다. 정말 삭제하시겠습니까?')) {
      // We don't delete transactions, just clear their projectId
      await db.transactions.where('projectId').equals(project.id).modify({ projectId: null });
      await db.projects.delete(project.id);
      navigate('/projects');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/projects')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button onClick={handleDeleteProject} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4"
          style={{ backgroundColor: project.color }}
        >
          {project.name[0]}
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">{project.name}</h1>
        <p className="text-slate-500 text-sm mb-6">{project.description || '설명이 없습니다.'}</p>
        
        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
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
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">프로젝트 관련 내역</h2>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-300">
            <p className="text-sm font-bold">연결된 내역이 없습니다</p>
          </div>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{t.description}</h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
              <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                {t.type === 'income' ? '+' : '-'} ₩{t.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
