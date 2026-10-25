import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Wind,
  CloudRain,
  Flame,
  Bug,
  Droplets,
  CalendarClock,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { WeatherData, Task, Farm } from '../types';
import { evaluateCriticalAlerts, CriticalAlert, AlertCategory } from '../lib/farming-logic';

interface CriticalAlertsDropdownProps {
  weather: WeatherData | null;
  tasks: Task[];
  farm: Farm | null;
  onNavigate: (tab: string) => void;
}

export const CriticalAlertsDropdown: React.FC<CriticalAlertsDropdownProps> = ({
  weather,
  tasks,
  farm,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'weather' | 'tasks'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('agrigenius_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    let timer: NodeJS.Timeout | null = null;
    if (isOpen) {
      timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 10);
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Compute live alerts using deterministic agronomic evaluator
  const allAlerts = evaluateCriticalAlerts({ weather, tasks, farm });
  const activeAlerts = allAlerts.filter((a) => !dismissedIds.includes(a.id));

  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length;
  const totalCount = activeAlerts.length;

  const weatherAlertsCount = activeAlerts.filter((a) => a.category !== 'task').length;
  const taskAlertsCount = activeAlerts.filter((a) => a.category === 'task').length;

  const filteredAlerts = activeAlerts.filter((a) => {
    if (activeFilter === 'weather') return a.category !== 'task';
    if (activeFilter === 'tasks') return a.category === 'task';
    return true;
  });

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('agrigenius_dismissed_alerts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearDismissed = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('agrigenius_dismissed_alerts');
    } catch {
      // ignore
    }
  };

  const handleActionClick = (targetTab: string) => {
    onNavigate(targetTab);
    setIsOpen(false);
  };

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'wind':
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'heat':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'disease':
        return <Bug className="w-4 h-4 text-rose-400" />;
      case 'evapo':
        return <Droplets className="w-4 h-4 text-teal-400" />;
      case 'task':
        return <CalendarClock className="w-4 h-4 text-amber-300" />;
      default:
        return <AlertCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        data-testid="critical-alerts-bell"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`p-2 rounded-xl transition-all relative cursor-pointer flex items-center justify-center ${
          criticalCount > 0
            ? 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-200 border border-rose-500/60 shadow-lg shadow-rose-950/50'
            : warningCount > 0
            ? 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-200 border border-amber-500/50'
            : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-700/60'
        }`}
        aria-label={`Critical alerts and farm warnings (${totalCount} active)`}
        title="Critical Alerts & Severe Weather Monitor"
      >
        <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'animate-bounce text-rose-300' : ''}`} />

        {/* Counter Badge */}
        {totalCount > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
              criticalCount > 0
                ? 'bg-rose-600 text-white ring-2 ring-rose-950 ring-offset-0 animate-pulse'
                : 'bg-amber-500 text-stone-950 ring-2 ring-stone-900'
            }`}
          >
            {totalCount}
          </span>
        )}

        {/* Ambient Ring Ping when Critical */}
        {criticalCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping opacity-75" />
        )}
      </button>

      {/* Popover Flyout */}
      {isOpen && (
        <div
          data-testid="critical-alerts-popover"
          className="absolute right-0 top-full mt-2.5 w-84 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  criticalCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {criticalCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                  Critical Alerts & Ag-Watch
                  {criticalCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-extrabold border border-rose-500/40">
                      {criticalCount} Critical
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-stone-400">Live Weather & High-Priority Field Monitor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-stone-850 text-stone-400 hover:text-white transition-colors"
              aria-label="Close alerts popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 bg-stone-950/60 border-b border-stone-800 text-[11px] font-medium">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter('weather')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'weather'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Weather ({weatherAlertsCount})
            </button>
            <button
              onClick={() => setActiveFilter('tasks')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'tasks'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Urgent Tasks ({taskAlertsCount})
            </button>
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-stone-800/80 p-2 space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-white">All Field Conditions Optimal</h4>
                <p className="text-[11px] text-stone-400 max-w-xs leading-relaxed">
                  No active severe weather warnings, wind drift alerts, or overdue critical tasks for {farm?.farm_name || 'your farm'}.
                </p>
                {dismissedIds.length > 0 && (
                  <button
                    onClick={handleClearDismissed}
                    className="mt-2 text-[10px] text-stone-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Restore {dismissedIds.length} dismissed alert{dismissedIds.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700/80'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-700/80'
                      : 'bg-stone-850/60 border-stone-750 hover:border-stone-600'
                  }`}
                >
                  {/* Top line: Severity tag + Metric badge + Dismiss button */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1 ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {getCategoryIcon(alert.category)}
                        <span>{alert.severity}</span>
                      </span>

                      <span className="text-[10px] font-semibold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded">
                        {alert.metric}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDismiss(alert.id, e)}
                      className="p-1 rounded text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors"
                      title="Dismiss alert"
                      aria-label="Dismiss this alert"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">{alert.title}</h4>

                  {/* Directive */}
                  <p className="text-[11px] text-stone-300 leading-relaxed mb-2.5 bg-stone-900/70 p-2 rounded-lg border border-stone-800/80">
                    {alert.directive}
                  </p>

                  {/* Quick Action Navigation Button */}
                  <button
                    onClick={() => handleActionClick(alert.targetTab)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      alert.severity === 'critical'
                        ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-sm shadow-rose-900/50'
                        : alert.severity === 'warning'
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-750 hover:bg-stone-700 text-stone-200'
                    }`}
                  >
                    <span>{alert.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Ag-Telemetry</span>
            </span>
            {dismissedIds.length > 0 && (
              <button
                onClick={handleClearDismissed}
                className="text-stone-400 hover:text-stone-200 hover:underline cursor-pointer"
              >
                Restore ({dismissedIds.length}) dismissed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
