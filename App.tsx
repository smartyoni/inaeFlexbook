
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  CheckSquare2,
  Settings,
  Briefcase,
  Plus,
  PieChart
} from 'lucide-react';
import './firebase'; // Initialize Firebase

// Lazy load pages for better performance
import Household from './pages/Household';
import CategoryAnalysis from './pages/CategoryAnalysis';
import Projects from './pages/Projects';
import Statistics from './pages/Statistics';
import AccountBalance from './pages/AccountBalance';
import RecurringExpenses from './pages/RecurringExpenses';
import ScheduledExpenses from './pages/ScheduledExpenses';
import SettingsPage from './pages/Settings';
import ProjectDetail from './pages/ProjectDetail';
import CategoryManagement from './pages/CategoryManagement';
import PaymentMethodManagement from './pages/PaymentMethodManagement';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: '내역', icon: Home },
    { path: '/projects', label: '프로젝트', icon: Briefcase },
    { path: '/analysis', label: '분석', icon: PieChart },
    { path: '/statistics', label: '체크리스트', icon: CheckSquare2 },
    { path: '/settings', label: '설정', icon: Settings },
  ];

  return (
    <>
      {/* 데스크톱 사이드바 (768px 이상) */}
      <nav
        className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-60 md:flex-col md:gap-2 md:p-4 md:border-r z-40"
        style={{
          backgroundColor: 'var(--notion-bg)',
          borderColor: 'var(--notion-border)'
        }}
      >
        {/* 로고/타이틀 */}
        <div className="mb-6 px-3 pt-2">
          <h1 className="text-xl font-black text-slate-800">FlexBook</h1>
          <p className="text-xs text-slate-400 font-medium">가계부</p>
        </div>

        {/* 네비게이션 항목들 */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-indigo-50 font-bold'
                : 'hover:bg-slate-50'
            }`}
            style={{
              color: isActive(item.path) ? 'var(--notion-blue)' : 'var(--notion-text-secondary)',
            }}
          >
            <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* 모바일 하단 탭 (768px 이하) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 px-4 py-2 flex justify-around items-center z-50"
        style={{
          backgroundColor: 'var(--notion-bg)',
          borderTop: '1px solid var(--notion-border)'
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 transition-colors"
            style={{
              color: isActive(item.path) ? 'var(--notion-blue)' : 'var(--notion-text-tertiary)',
            }}
          >
            <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen pb-20 md:pb-0 md:pl-60" style={{ backgroundColor: 'var(--notion-bg-secondary)' }}>
        <Routes>
          <Route path="/" element={<Household />} />
          <Route path="/analysis" element={<CategoryAnalysis />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/balances" element={<AccountBalance />} />
          <Route path="/recurring" element={<RecurringExpenses />} />
          <Route path="/scheduled" element={<ScheduledExpenses />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/categories" element={<CategoryManagement />} />
          <Route path="/settings/payments" element={<PaymentMethodManagement />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
