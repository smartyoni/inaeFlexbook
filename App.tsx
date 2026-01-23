
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
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
    { path: '/analysis', label: '분석', icon: PieChart },
    { path: '/projects', label: '프로젝트', icon: Briefcase },
    { path: '/statistics', label: '통계', icon: BarChart3 },
    { path: '/settings', label: '설정', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 px-4 py-2 flex justify-around items-center z-50" style={{ backgroundColor: 'var(--notion-bg)', borderTop: '1px solid var(--notion-border)' }}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-colors`}
          style={{
            color: isActive(item.path) ? 'var(--notion-blue)' : 'var(--notion-text-tertiary)',
          }}
        >
          <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--notion-bg-secondary)' }}>
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
