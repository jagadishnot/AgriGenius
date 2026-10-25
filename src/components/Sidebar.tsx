import React from 'react';
import {
  LayoutDashboard,
  Trees,
  Layers,
  Bot,
  Stethoscope,
  Droplets,
  CloudSun,
  TrendingUp,
  Landmark,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  User,
  Database,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'farms'
  | 'crops'
  | 'assistant'
  | 'disease'
  | 'irrigation'
  | 'weather'
  | 'market'
  | 'schemes'
  | 'tasks'
  | 'reports'
  | 'admin'
  | 'profile'
  | 'database';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, pendingTasksCount }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'farms' as NavTab, label: 'Farm Management', icon: Trees },
    { id: 'crops' as NavTab, label: 'Crop Cycles', icon: Layers },
    { id: 'assistant' as NavTab, label: 'AI Farming Agent', icon: Bot, badge: 'Agent' },
    { id: 'disease' as NavTab, label: 'Disease Scanner', icon: Stethoscope, badge: 'Vision' },
    { id: 'irrigation' as NavTab, label: 'Irrigation & Soil', icon: Droplets },
    { id: 'weather' as NavTab, label: 'Weather & Alerts', icon: CloudSun },
    { id: 'market' as NavTab, label: 'Mandi Market Rates', icon: TrendingUp },
    { id: 'schemes' as NavTab, label: 'Govt Schemes', icon: Landmark },
    { id: 'tasks' as NavTab, label: 'Tasks & Reminders', icon: CheckSquare, count: pendingTasksCount },
    { id: 'reports' as NavTab, label: 'Farm Analytics', icon: BarChart3 },
    { id: 'database' as NavTab, label: 'Supabase Database', icon: Database, badge: 'Cloud' },
    { id: 'admin' as NavTab, label: 'Agent Monitoring', icon: ShieldCheck },
    { id: 'profile' as NavTab, label: 'Farmer Profile', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0">
      {/* Scrollable menu */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-stone-400">
          Core Operations
        </div>
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-stone-400">
          Agronomy & Markets
        </div>
        {navItems.slice(5, 9).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        <div className="pt-3 px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-stone-400">
          Management & Audits
        </div>
        {navItems.slice(9).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-amber-400 text-emerald-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="mt-auto p-4 border-t border-stone-800 bg-stone-950/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">Agent Engine Online</span>
        </div>
        <p className="text-[11px] text-stone-400 mt-1">Autonomous RAG & Agronomic Tool Registry Active</p>
      </div>
    </aside>
  );
};
