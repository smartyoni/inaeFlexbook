import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, CheckCircle2, Clock, Archive } from 'lucide-react';
import { Project, Transaction, Category, PaymentMethod } from '../types';
import * as firestoreService from '../firestore-service';
import ProjectDetailPanel from '../components/ProjectDetailPanel';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>({});
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#4f46e5' });

  const isDesktop = windowWidth >= 768;

  // Initial data loading
  useEffect(() => {
    const init = async () => {
      try {
        // Load projects
        const projs = await firestoreService.getAllProjects();
        setProjects(projs);

        // Load categories
        const cats = await firestoreService.getAllCategories();
        const catsMap: Record<string, Category> = {};
        cats.forEach(c => catsMap[c.id] = c);
        setCategories(catsMap);

        // Load payment methods
        const pays = await firestoreService.getAllPaymentMethods();
        const paysMap: Record<string, PaymentMethod> = {};
        pays.forEach(p => paysMap[p.id] = p);
        setPaymentMethods(paysMap);
      } catch (error) {
        console.error('Error initializing projects:', error);
      }
    };
    init();
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select first project on desktop
  useEffect(() => {
    if (isDesktop && !selectedProjectId && projects.length > 0) {
      handleProjectClick(projects[0].id);
    }
  }, [isDesktop, projects, selectedProjectId]);

  // Helper to convert Firestore Timestamp to Date
  const getDate = (date: any): Date => {
    if (typeof date === 'string') {
      return new Date(date);
    } else if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as any).toDate();
    }
    return new Date(date);
  };

  const handleProjectClick = async (projectId: string) => {
    setSelectedProjectId(projectId);

    if (!isDesktop) {
      setShowDetailSheet(true);
    }

    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    setSelectedProject(proj);

    // Load transactions for the project
    try {
      const trans = await firestoreService.getTransactionsByProjectId(projectId);
      const getDateForSort = (date: any): Date => {
        if (typeof date === 'string') return new Date(date);
        if (date && typeof date === 'object' && 'toDate' in date) return date.toDate();
        return new Date(date);
      };
      setTransactions(trans.sort((a, b) => getDateForSort(b.date).getTime() - getDateForSort(a.date).getTime()));
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      await firestoreService.updateProject(projectId, updates);

      // Update local state
      const updatedProjects = projects.map(p =>
        p.id === projectId ? { ...p, ...updates } : p
      );
      setProjects(updatedProjects);

      // Update selected project
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({ ...selectedProject, ...updates });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const handleToggleLock = async (projectId: string, locked: boolean) => {
    try {
      await firestoreService.updateProject(projectId, {
        locked,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedProjects = projects.map(p =>
        p.id === projectId ? { ...p, locked } : p
      );
      setProjects(updatedProjects);

      // Update selected project
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({ ...selectedProject, locked });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      throw error;
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await firestoreService.updateTransaction(id, updates);

      // Update transactions list
      const updatedTransactions = transactions.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const handleRefreshProjectTransactions = async () => {
    if (!selectedProjectId) return;

    try {
      const trans = await firestoreService.getTransactionsByProjectId(selectedProjectId);
      const getDateForSort = (date: any): Date => {
        if (typeof date === 'string') return new Date(date);
        if (date && typeof date === 'object' && 'toDate' in date) return date.toDate();
        return new Date(date);
      };
      setTransactions(trans.sort((a, b) => getDateForSort(b.date).getTime() - getDateForSort(a.date).getTime()));
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('프로젝트와 관련된 모든 기록 연결이 해제됩니다. 정말 삭제하시겠습니까?')) return;

    try {
      // Clear projectId from all related transactions
      await firestoreService.updateTransactionProjectId(projectId, null);
      // Delete the project
      await firestoreService.deleteProject(projectId);

      // Update local state
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);

      // Auto-select next project on desktop
      if (isDesktop && updatedProjects.length > 0) {
        handleProjectClick(updatedProjects[0].id);
      } else {
        setSelectedProjectId(null);
        setSelectedProject(null);
        setShowDetailSheet(false);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

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

      // Reload projects
      const projs = await firestoreService.getAllProjects();
      setProjects(projs);
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
    <div className={`${isDesktop ? 'max-w-7xl mx-auto px-4 pt-6 pb-12' : 'max-w-xl mx-auto px-4 pt-6 pb-12'}`}>
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

      {/* 2분할 그리드 */}
      <div className={`${isDesktop ? 'grid grid-cols-2 gap-6' : 'block'}`}>
        {/* 좌측: 프로젝트 목록 */}
        <div>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="py-20 text-center text-slate-300">
                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">진행 중인 프로젝트가 없습니다</p>
                <p className="text-xs mt-1">여행, 경조사 등 특별한 목적을 위한 비용을 모아보세요.</p>
              </div>
            ) : (
              projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => handleProjectClick(proj.id)}
                  className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center justify-between hover:shadow-md transition-all group cursor-pointer ${
                    selectedProjectId === proj.id && isDesktop
                      ? 'border-indigo-500 ring-2 ring-indigo-100'
                      : 'border-slate-100 hover:border-indigo-100'
                  }`}
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* 우측: 프로젝트 상세 (데스크톱 전용) */}
        {isDesktop && selectedProject && (
          <div className="sticky top-6 h-[calc(100vh-8rem)]">
            <ProjectDetailPanel
              project={selectedProject}
              transactions={transactions}
              categories={categories}
              paymentMethods={paymentMethods}
              isMobile={false}
              onUpdate={handleUpdateProject}
              onToggleLock={handleToggleLock}
              onDelete={handleDeleteProject}
              onUpdateTransaction={handleUpdateTransaction}
              onRefreshTransactions={handleRefreshProjectTransactions}
            />
          </div>
        )}
      </div>

      {/* 모바일 바텀시트 */}
      {!isDesktop && showDetailSheet && selectedProject && (
        <ProjectDetailPanel
          project={selectedProject}
          transactions={transactions}
          categories={categories}
          paymentMethods={paymentMethods}
          isMobile={true}
          onClose={() => setShowDetailSheet(false)}
          onUpdate={handleUpdateProject}
          onToggleLock={handleToggleLock}
          onDelete={handleDeleteProject}
          onUpdateTransaction={handleUpdateTransaction}
          onRefreshTransactions={handleRefreshProjectTransactions}
        />
      )}

      {/* Create Project Modal */}
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
