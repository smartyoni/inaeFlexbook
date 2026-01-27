import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as firestoreService from '../firestore-service';
import { Project, Transaction, Category, PaymentMethod } from '../types';
import ProjectDetailPanel from '../components/ProjectDetailPanel';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        // Load project
        const proj = await firestoreService.getProjectById(id);
        if (!proj) return navigate('/projects');
        setProject(proj);

        // Load transactions
        const trans = await firestoreService.getTransactionsByProjectId(id);
        const getDateForSort = (date: any): Date => {
          if (typeof date === 'string') {
            return new Date(date);
          } else if (date && typeof date === 'object' && 'toDate' in date) {
            return (date as any).toDate();
          }
          return new Date(date);
        };
        setTransactions(trans.sort((a, b) => getDateForSort(b.date).getTime() - getDateForSort(a.date).getTime()));

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
        console.error('Error fetching project details:', error);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  if (!project) return null;

  const handleUpdate = async (projectId: string, updates: Partial<Project>) => {
    try {
      await firestoreService.updateProject(projectId, updates);
      // Update local state
      setProject({ ...project, ...updates } as Project);
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
      setProject({ ...project, locked } as Project);
    } catch (error) {
      console.error('Error toggling lock:', error);
      throw error;
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('프로젝트와 관련된 모든 기록 연결이 해제됩니다. 정말 삭제하시겠습니까?')) return;

    try {
      // Clear projectId from all related transactions
      await firestoreService.updateTransactionProjectId(projectId, null);
      // Delete the project
      await firestoreService.deleteProject(projectId);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate('/projects')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800">
          <ArrowLeft size={24} />
        </button>
      </header>

      <ProjectDetailPanel
        project={project}
        transactions={transactions}
        categories={categories}
        paymentMethods={paymentMethods}
        isMobile={false}
        onUpdate={handleUpdate}
        onToggleLock={handleToggleLock}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProjectDetail;
