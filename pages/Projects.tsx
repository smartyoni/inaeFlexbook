
import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, ChevronRight, CheckCircle2, Clock, Archive } from 'lucide-react';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import * as firestoreService from '../firestore-service';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#4f46e5' });

  const fetchProjects = async () => {
    try {
      const projs = await firestoreService.getAllProjects();
      setProjects(projs);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    try {
      await firestoreService.addProject({
        name: newProject.name,
        description: newProject.description,
        color: newProject.color,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setNewProject({ name: '', description: '', color: '#4f46e5' });
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('프로젝트 생성 실패. 다시 시도해주세요.');
    }
  };

  const statusIcons = {
    active: <Clock size={14} className="text-indigo-500" />,
    completed: <CheckCircle2 size={14} className="text-emerald-500" />,
    archived: <Archive size={14} className="text-slate-400" />
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">프로젝트</h1>
          <p className="text-sm text-slate-400 font-medium">목표 지향적 자산 관리</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-2xl shadow-sm hover:bg-slate-50 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="py-20 text-center text-slate-300">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">진행 중인 프로젝트가 없습니다</p>
            <p className="text-xs mt-1">여행, 경조사 등 특별한 목적을 위한 비용을 모아보세요.</p>
          </div>
        ) : (
          projects.map(proj => (
            <Link 
              key={proj.id} 
              to={`/projects/${proj.id}`}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: proj.color }}
                >
                  {proj.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{proj.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {statusIcons[proj.status]}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{proj.status}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-6 text-slate-800">새 프로젝트 생성</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">이름</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="예: 유럽 여행, 결혼 준비"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">설명</label>
                <input 
                  type="text" 
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="어떤 프로젝트인가요?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">테마 색상</label>
                <input 
                  type="color" 
                  value={newProject.color}
                  onChange={e => setNewProject({...newProject, color: e.target.value})}
                  className="w-full h-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl">취소</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">생성하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
