
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check, Grid, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category, TransactionType } from '../types';
import * as firestoreService from '../firestore-service';

const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#4f46e5');

  const fetchCategories = async () => {
    try {
      const cats = await firestoreService.getAllCategories();
      // Already sorted by order in firestore-service
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#4f46e5');
    setEditingCategory(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const label = category?.type === 'income' ? '수입원' : '구매처';
    if (confirm(`이 ${label}를 삭제하시겠습니까? 해당 항목으로 기록된 기존 내역의 분류가 사라질 수 있습니다.`)) {
      try {
        await firestoreService.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('삭제 실패. 다시 시도해주세요.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const categoryData: Omit<Category, 'id'> = {
        name,
        type,
        color,
        icon: 'Tag', // Default icon for now
        order: editingCategory?.order ?? categories.length
      };

      if (editingCategory) {
        await firestoreService.updateCategory(editingCategory.id, categoryData);
      } else {
        await firestoreService.addCategory(categoryData);
      }

      setIsModalOpen(false);
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('저장 실패. 다시 시도해주세요.');
    }
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      return;
    }

    const draggedCategory = categories.find(c => c.id === draggedCategoryId);
    const targetCategory = categories.find(c => c.id === targetCategoryId);

    if (!draggedCategory || !targetCategory || draggedCategory.type !== targetCategory.type) {
      setDraggedCategoryId(null);
      return;
    }

    try {
      // Get filtered categories of same type, sorted by current order
      const filteredCategories = categories
        .filter(c => c.type === draggedCategory.type)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const draggedIndex = filteredCategories.findIndex(c => c.id === draggedCategoryId);
      const targetIndex = filteredCategories.findIndex(c => c.id === targetCategoryId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedCategoryId(null);
        return;
      }

      // Create new array with swapped items
      const reorderedCategories = [...filteredCategories];
      [reorderedCategories[draggedIndex], reorderedCategories[targetIndex]] = [
        reorderedCategories[targetIndex],
        reorderedCategories[draggedIndex]
      ];

      // Update all categories with new order values
      const updatedCategories = categories.map(cat => {
        const sameTypeIndex = reorderedCategories.findIndex(c => c.id === cat.id);
        if (sameTypeIndex !== -1) {
          return { ...cat, order: sameTypeIndex };
        }
        return cat;
      });

      setCategories(updatedCategories);
      setDraggedCategoryId(null);

      // Save to Firestore
      for (const cat of reorderedCategories) {
        const updatedCat = updatedCategories.find(c => c.id === cat.id);
        if (updatedCat) {
          await firestoreService.updateCategory(cat.id, updatedCat);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setDraggedCategoryId(null);
      fetchCategories();
    }
  };

  const handleDragEnd = () => {
    setDraggedCategoryId(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">분류 관리</h1>
          <p className="text-sm text-slate-400 font-medium">구매처 및 수입원 관리</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Sections for Expense and Income */}
        {(['expense', 'income'] as TransactionType[]).map((sectionType) => {
          const filtered = categories.filter(c => c.type === sectionType);
          return (
            <div key={sectionType} className="space-y-3">
              <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {sectionType === 'expense' ? '지출 구매처' : '수입 수입원'}
              </h3>
              {filtered.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-8 text-center text-slate-300">
                  <p className="text-xs font-bold">등록된 항목이 없습니다</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {filtered.map((cat, idx) => (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cat.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, cat.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-4 transition-all cursor-move ${
                        draggedCategoryId === cat.id
                          ? 'bg-slate-100 opacity-50'
                          : 'hover:bg-slate-50'
                      } ${idx !== filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical size={16} className="text-slate-300" />
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.name[0]}
                        </div>
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all z-40"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCategory ? `${type === 'income' ? '수입원' : '구매처'} 수정` : `새 ${type === 'income' ? '수입원' : '구매처'} 추가`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">구분</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    지출 (구매처)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    수입 (수입원)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">이름</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder={type === 'expense' ? "예: 스타벅스, 쿠팡" : "예: 회사(월급), 당근마켓"}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">테마 색상</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                  />
                  <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 truncate uppercase">
                    {color}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 text-white font-black bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Check size={20} strokeWidth={3} />
                저장하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
