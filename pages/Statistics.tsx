
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [input, setInput] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checklist');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (input.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          text: input,
          completed: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setInput('');
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">체크리스트</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          {completedCount}/{items.length}
        </p>
      </header>

      {/* Input Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="새 항목 입력..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={addItem}
          className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold flex items-center gap-2"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-slate-300 text-center">
            <Circle size={48} className="mb-4 opacity-20" />
            <p className="font-bold">항목을 추가해보세요</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {item.completed ? (
                  <CheckCircle2 size={24} className="text-indigo-600" />
                ) : (
                  <Circle size={24} />
                )}
              </button>
              <span
                className={`flex-1 text-sm transition-all ${
                  item.completed
                    ? 'line-through text-slate-400'
                    : 'text-slate-700 font-medium'
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Checklist;
