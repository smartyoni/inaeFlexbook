
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Edit2, Lock, RefreshCw, FileText, MoreVertical, X } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  memo?: string;
}

interface ChecklistCard {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: string;
}

const Checklist: React.FC = () => {
  const [cards, setCards] = useState<ChecklistCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [editingItemMemoId, setEditingItemMemoId] = useState<string | null>(null);
  const [editingItemMemoText, setEditingItemMemoText] = useState('');
  const [openMenuItemId, setOpenMenuItemId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checklistCards');
    if (saved) {
      setCards(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('checklistCards', JSON.stringify(cards));
  }, [cards]);

  const addCard = () => {
    if (cards.length >= 20) {
      alert('최대 20개의 카드만 생성할 수 있습니다.');
      return;
    }
    const newCard: ChecklistCard = {
      id: Date.now().toString(),
      title: '새 카테고리',
      items: [],
      createdAt: new Date().toISOString()
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (id: string) => {
    if (confirm('이 카드를 삭제하시겠습니까?')) {
      setCards(cards.filter(card => card.id !== id));
    }
  };

  const updateCardTitle = (id: string, newTitle: string) => {
    setCards(cards.map(card =>
      card.id === id ? { ...card, title: newTitle } : card
    ));
  };

  const addItemToCard = (cardId: string, itemText: string) => {
    if (!itemText.trim()) return;
    setCards(cards.map(card =>
      card.id === cardId
        ? {
            ...card,
            items: [
              ...card.items,
              {
                id: Date.now().toString(),
                text: itemText,
                completed: false
              }
            ]
          }
        : card
    ));
    setNewItemText({ ...newItemText, [cardId]: '' });
  };

  const toggleItemCompletion = (cardId: string, itemId: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? {
            ...card,
            items: card.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : card
    ));
  };

  const deleteItem = (cardId: string, itemId: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? {
            ...card,
            items: card.items.filter(item => item.id !== itemId)
          }
        : card
    ));
  };

  const clearCompletedItems = (cardId: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? {
            ...card,
            items: card.items.filter(item => !item.completed)
          }
        : card
    ));
  };

  const completedCount = (cardId: string) => {
    return cards.find(c => c.id === cardId)?.items.filter(i => i.completed).length || 0;
  };

  const totalItems = (cardId: string) => {
    return cards.find(c => c.id === cardId)?.items.length || 0;
  };

  const updateItemMemo = (cardId: string, itemId: string, memo: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? {
            ...card,
            items: card.items.map(item =>
              item.id === itemId ? { ...item, memo } : item
            )
          }
        : card
    ));
  };

  return (
    <div className="max-w-full mx-auto px-6 pt-6 pb-12">
      <header className="mb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">체크리스트</h1>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-96"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 flex-shrink-0">
              {editingCardId === card.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      updateCardTitle(card.id, editingTitle);
                      setEditingCardId(null);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded font-bold hover:bg-indigo-700"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{card.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {completedCount(card.id)}/{totalItems(card.id)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingCardId(card.id);
                        setEditingTitle(card.title);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {card.items.length === 0 ? (
                <p className="text-xs text-slate-300 text-center py-4">항목을 추가해보세요</p>
              ) : (
                card.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 group border-b border-slate-100 pb-2 last:border-b-0">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleItemCompletion(card.id, item.id)}
                        className="flex-shrink-0 mt-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {item.completed ? (
                          <CheckCircle2 size={16} className="text-indigo-600" />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`flex-1 text-xs transition-all line-clamp-2 ${
                            item.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.text}
                        </span>
                        {item.memo && (
                          <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded mt-1">
                            {item.memo}
                          </div>
                        )}
                      </div>
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenuItemId(openMenuItemId === item.id ? null : item.id)}
                          className="p-1.5 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {openMenuItemId === item.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-max">
                            <button
                              onClick={() => {
                                setEditingItemMemoId(item.id);
                                setEditingItemMemoText(item.memo || '');
                                setOpenMenuItemId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                            >
                              <FileText size={12} />
                              메모작성
                            </button>
                            <button
                              onClick={() => {
                                deleteItem(card.id, item.id);
                                setOpenMenuItemId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-2 border-t border-slate-100"
                            >
                              <Trash2 size={12} />
                              삭제
                            </button>
                            <button
                              onClick={() => setOpenMenuItemId(null)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                            >
                              <X size={12} />
                              취소
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Item Input */}
            <div className="p-3 border-t border-slate-100 flex-shrink-0 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText[card.id] || ''}
                  onChange={(e) => setNewItemText({ ...newItemText, [card.id]: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItemToCard(card.id, newItemText[card.id] || '');
                    }
                  }}
                  placeholder="항목 추가..."
                  className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => addItemToCard(card.id, newItemText[card.id] || '')}
                  className="flex-shrink-0 px-2 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-bold flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
              {totalItems(card.id) > 0 && completedCount(card.id) > 0 && (
                <button
                  onClick={() => clearCompletedItems(card.id)}
                  className="w-full px-2 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 transition-colors font-bold"
                >
                  정리
                </button>
              )}

              {/* Item Memo Modal */}
              {editingItemMemoId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
                  <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-sm">
                    <h3 className="font-bold text-slate-800 mb-3">항목 메모</h3>
                    <textarea
                      autoFocus
                      value={editingItemMemoText}
                      onChange={(e) => setEditingItemMemoText(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                      placeholder="메모를 입력하세요..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          const cardId = cards.find(c => c.items.find(i => i.id === editingItemMemoId))?.id;
                          if (cardId) {
                            updateItemMemo(cardId, editingItemMemoId, editingItemMemoText);
                          }
                          setEditingItemMemoId(null);
                        }}
                        className="flex-1 px-2 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingItemMemoId(null)}
                        className="flex-1 px-2 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 transition-colors font-bold"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Add Card Placeholder */}
        {cards.length < 20 && (
          <button
            onClick={addCard}
            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors flex items-center justify-center h-96 text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            <Plus size={24} className="mr-2" />
            카드 추가
          </button>
        )}
      </div>
    </div>
  );
};

export default Checklist;
