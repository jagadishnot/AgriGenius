import React from 'react';
import {
  Sprout,
  CloudSun,
  Bell,
  PlusCircle,
  MessageSquare,
  Camera,
  ChevronDown,
  LogOut,
  Mic,
  Database,
} from 'lucide-react';
import { Farm, UserProfile, WeatherData, Task } from '../types';
import { CriticalAlertsDropdown } from './CriticalAlertsDropdown';

interface NavbarProps {
  farms: Farm[];
  selectedFarmId: string;
  onSelectFarm: (id: string) => void;
  profile: UserProfile | null;
  onOpenQuickAction: (action: 'addFarm' | 'askAgent' | 'uploadDisease' | 'addTask') => void;
  pendingTasksCount: number;
  onSignOut: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenDatabaseHub?: () => void;
  weather?: WeatherData | null;
  tasks?: Task[];
  onNavigate?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
  profile,
  onOpenQuickAction,
  pendingTasksCount,
  onSignOut,
  onOpenVoiceAssistant,
  onOpenDatabaseHub,
  weather,
  tasks,
  onNavigate,
}) => {
  const currentFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 border-b border-emerald-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">AgriGenius</span>
              <span className="text-[10px] uppercase font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded tracking-wider">
                Autonomous Agent
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 hidden sm:block">Smart Precision Farming & Agronomy</p>
          </div>
        </div>

        {/* Center: Active Farm Selector */}
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-3 py-1.5">
          <span className="text-xs text-emerald-300/80 font-medium hidden md:inline">Active Farm:</span>
          <div className="relative inline-block">
            <select
              aria-label="Select active farm"
              value={selectedFarmId}
              onChange={(e) => onSelectFarm(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer pr-6 appearance-none"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id} className="bg-emerald-950 text-white">
                  {farm.farm_name} ({farm.total_area} {farm.area_unit})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-300 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Actions: Quick Actions, Weather preview, Notifications, Farmer badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Alexa Voice Assistant Button */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              title="Open Alexa Voice Assistant"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Alexa Voice</span>
            </button>
          )}

          {/* Supabase DB Hub Button */}
          {onOpenDatabaseHub && (
            <button
              onClick={onOpenDatabaseHub}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 transition-all cursor-pointer"
              title="Supabase PostgreSQL Database Settings & SQL"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Supabase DB</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* Quick Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => onOpenQuickAction('askAgent')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
              title="Ask AI Assistant"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Agent</span>
            </button>
            <button
              onClick={() => onOpenQuickAction('uploadDisease')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white transition-colors cursor-pointer"
              title="Upload Crop Photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Diagnose Leaf</span>
            </button>
            <button
              onClick={() => onOpenQuickAction('addFarm')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              title="Add Farm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Farm</span>
            </button>
          </div>

          {/* Real-time Telemetry & Micro Weather Badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-800/60 border border-emerald-700/50 text-xs text-emerald-100">
            <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live</span>
            </span>
            <span className="text-emerald-500">|</span>
            <CloudSun className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentFarm?.average_temperature || 28}°C</span>
            <span className="text-emerald-500">|</span>
            <span>{currentFarm?.humidity || 60}% RH</span>
          </div>

          {/* Critical Alerts & Severe Weather Notification Bell */}
          <CriticalAlertsDropdown
            weather={weather || null}
            tasks={tasks || []}
            farm={currentFarm}
            onNavigate={(tab) => (onNavigate ? onNavigate(tab) : onOpenQuickAction('addTask'))}
          />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs border border-emerald-400/50">
              {profile?.display_name ? profile.display_name.charAt(0) : 'R'}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <p className="font-semibold text-white leading-tight">{profile?.display_name || 'Farmer'}</p>
              <p className="text-[10px] text-emerald-300 capitalize">{profile?.district || 'Nashik'}, {profile?.state || 'MH'}</p>
            </div>

            <button
              onClick={onSignOut}
              className="ml-1 p-2 rounded-lg bg-emerald-800/60 hover:bg-rose-900/60 text-emerald-200 hover:text-rose-200 border border-emerald-700/50 hover:border-rose-700/50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Sign Out of AgriGenius"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
