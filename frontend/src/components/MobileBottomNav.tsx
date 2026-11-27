import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  FileText, 
  Wrench,
  Sliders
} from 'lucide-react';
import { TabType } from './Sidebar.tsx';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  pendingCount 
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'chat' as TabType, label: 'AI Chat', icon: MessageSquareText, badge: true },
    { id: 'reports' as TabType, label: 'Reports', icon: FileText, pending: pendingCount > 0 },
    { id: 'maintenance' as TabType, label: 'Repairs', icon: Wrench },
    { id: 'training' as TabType, label: 'Studio', icon: Sliders },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[999999] bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-2 py-1.5 safe-area-bottom shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 relative cursor-pointer ${
                isActive 
                  ? 'text-emerald-700 font-semibold scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                isActive ? 'bg-emerald-50 text-emerald-600' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{item.label}</span>
              
              {/* Active Dot indicator */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
              )}

              {/* Live badge for chat */}
              {item.badge && !isActive && (
                <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}

              {/* Pending report badge */}
              {item.pending && !isActive && (
                <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
