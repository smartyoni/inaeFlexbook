
import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Database,
  Grid,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const menuGroups = [
    {
      title: '자산 관리',
      items: [
        { label: '계좌 관리', icon: CreditCard, path: '/balances' },
        { label: '고정 지출 설정', icon: Bell, path: '/recurring' },
        { label: '예정 지출 관리', icon: Shield, path: '/scheduled' },
      ]
    },
    {
      title: '환경 설정',
      items: [
        { label: '구매처 & 수입원 관리', icon: Grid, path: '/settings/categories' },
        { label: '결제 & 입금 수단 관리', icon: Wallet, path: '/settings/payments' },
        { label: '데이터 백업/복구', icon: Database, path: '/settings' },
      ]
    },
    {
      title: '앱 정보',
      items: [
        { label: '도움말 & 지원', icon: HelpCircle, path: '/settings' },
        { label: '로그아웃', icon: LogOut, path: '/settings', color: 'text-rose-500' },
      ]
    }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">설정</h1>
        <p className="text-sm text-slate-400 font-medium">개인화된 FlexBook 환경</p>
      </header>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">FlexBook 사용자</h2>
          <p className="text-xs text-slate-400 font-medium">flexbook@example.com</p>
        </div>
      </div>

      <div className="space-y-8">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h3>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {group.items.map((item, iIdx) => (
                <Link
                  key={iIdx}
                  to={item.path}
                  className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-colors ${
                    iIdx !== group.items.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className={item.color || 'text-slate-400'} />
                    <span className={`font-bold text-sm ${item.color || 'text-slate-700'}`}>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Version 1.0.0 (Build 202505)</p>
      </div>
    </div>
  );
};

export default Settings;
