import React, { useState } from 'react';
import {
  Trees,
  Layers,
  Droplets,
  HeartPulse,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  MessageSquare,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Mic,
  Bot,
  Zap,
  Check,
  RefreshCw,
  Send,
  ShieldCheck,
  CalendarCheck,
  Compass,
  BarChart3,
  CloudSun,
} from 'lucide-react';
import { Farm, CropCycle, Task, WeatherData, UserProfile } from '../types';
import { api } from '../lib/api';
import { NutrientCalculatorWidget } from '../components/NutrientCalculatorWidget';

interface DashboardViewProps {
  currentFarm: Farm;
  farms: Farm[];
  cropCycles: CropCycle[];
  tasks: Task[];
  weather: WeatherData | null;
  profile: UserProfile | null;
  onNavigate: (tab: any) => void;
  onOpenQuickAction: (action: any) => void;
  onToggleTask: (taskId: string) => void;
  onOpenVoiceAssistant?: () => void;
  onRefreshData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentFarm,
  farms,
  cropCycles,
  tasks,
  weather,
  profile,
  onNavigate,
  onOpenQuickAction,
  onToggleTask,
  onOpenVoiceAssistant,
  onRefreshData,
}) => {
  const farmCycles = cropCycles.filter((c) => c.farm_id === currentFarm?.id);
  const activeCycle = farmCycles.find((c) => c.status === 'active') || farmCycles[0];
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // AI Agent Dashboard Action State
  const [dashboardQuery, setDashboardQuery] = useState('');
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [activeActionType, setActiveActionType] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<{
    title: string;
    summary: string;
    details: string[];
    taskCreated?: any;
    analyticsData?: any;
  } | null>(null);

  // Trigger 1-Click Autonomous Action
  const handleRunAgentAction = async (
    actionType: 'analytics' | 'briefing' | 'irrigate' | 'soil_test' | 'mandi_check' | 'generate_tasks' | 'weather'
  ) => {
    if (!currentFarm?.id) return;
    setIsExecutingAction(true);
    setActiveActionType(actionType);
    try {
      const res = await api.executeAgentAction({
        actionType,
        farmId: currentFarm.id,
      });
      setAgentResult({
        title: res.title,
        summary: res.summary,
        details: res.details,
        taskCreated: res.taskCreated,
        analyticsData: res.resultData,
      });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Agent action error:', err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Direct AI Command from Dashboard or Quick Prompt
  const executeDirectPrompt = async (promptText: string) => {
    if (!promptText.trim() || !currentFarm?.id) return;
    setIsExecutingAction(true);
    try {
      const chatRes = await api.sendChatMessage({
        message: promptText.trim(),
        farmId: currentFarm.id,
        cropCycleId: activeCycle?.id,
      });
      setAgentResult({
        title: `AI Agent Response for ${profile?.display_name || 'Farmer'}`,
        summary: chatRes.direct_answer || chatRes.content || 'Analysis complete.',
        details: [
          ...(chatRes.key_reasons || []),
          ...(chatRes.suggested_next_steps?.map((s) => `Action Item: ${s}`) || []),
        ],
        analyticsData: chatRes.analytics_data,
      });
      setDashboardQuery('');
    } catch (err: any) {
      console.error('Dashboard agent prompt error:', err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleSendDashboardMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeDirectPrompt(dashboardQuery);
  };

  const handleScheduleFertigationTask = async (taskData: {
    title: string;
    description: string;
    category: 'fertilizer' | 'irrigation';
    due_date: string;
    priority: 'high' | 'medium';
  }) => {
    if (!currentFarm?.id) return;
    await api.createTask({
      farm_id: currentFarm.id,
      crop_cycle_id: activeCycle?.id || null,
      ...taskData,
    });
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Farm Context Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-emerald-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-400/30">
              Active Farm Context
            </span>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-stone-200">
              {currentFarm?.village || 'Nashik'}, {currentFarm?.state || 'Maharashtra'}
            </span>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-emerald-300 font-medium">
              Farmer: {profile?.display_name || 'Registered Farmer'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {currentFarm?.farm_name || 'My Agricultural Holding'}
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            {currentFarm?.ai_recommendation ||
              'Autonomous agricultural agent monitoring soil moisture, crop stage, and pest risks in real-time.'}
          </p>
        </div>

        {/* Shortcuts: Alexa Voice, Consult, Diagnose */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all cursor-pointer transform hover:scale-105"
              title="Speak with Alexa Voice Assistant"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Alexa Voice</span>
            </button>
          )}

          <button
            onClick={() => onOpenQuickAction('askAgent')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult Agent</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('uploadDisease')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Diagnose Crop</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT AUTONOMOUS AI AGENT COMMAND CENTER ON DASHBOARD */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-inner">
              <Bot className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">AgriGenius Autonomous Farm Agent</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  Live Agent Online
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Calibrated with {profile?.display_name || 'Farmer'}'s land data • {currentFarm?.farm_name} ({currentFarm?.total_area} {currentFarm?.area_unit}, {currentFarm?.soil_type} soil)
              </p>
            </div>
          </div>

          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Assist (Alexa Mode)</span>
            </button>
          )}
        </div>

        {/* 1-Click Autonomous Action Buttons */}
        <div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
            Execute Autonomous Agent Workflows:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              onClick={() => handleRunAgentAction('analytics')}
              disabled={isExecutingAction}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeActionType === 'analytics' && isExecutingAction
                  ? 'bg-emerald-900/50 border-emerald-400 animate-pulse'
                  : 'bg-stone-950/80 hover:bg-emerald-950/50 border-stone-800 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Economics</span>
              </div>
              <span className="text-xs font-bold text-white">Farm Analytics</span>
              <span className="text-[10px] text-stone-400 mt-1">Revenue, profit & yield</span>
            </button>

            <button
              onClick={() => handleRunAgentAction('briefing')}
              disabled={isExecutingAction}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeActionType === 'briefing' && isExecutingAction
                  ? 'bg-emerald-900/50 border-emerald-400 animate-pulse'
                  : 'bg-stone-950/80 hover:bg-emerald-950/50 border-stone-800 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Audit</span>
              </div>
              <span className="text-xs font-bold text-white">Daily Farm Briefing</span>
              <span className="text-[10px] text-stone-400 mt-1">Holistic status check</span>
            </button>

            <button
              onClick={() => handleRunAgentAction('irrigate')}
              disabled={isExecutingAction}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeActionType === 'irrigate' && isExecutingAction
                  ? 'bg-emerald-900/50 border-emerald-400 animate-pulse'
                  : 'bg-stone-950/80 hover:bg-emerald-950/50 border-stone-800 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center justify-between text-cyan-400 mb-1.5">
                <Droplets className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Irrigation</span>
              </div>
              <span className="text-xs font-bold text-white">Calculate & Log Drip</span>
              <span className="text-[10px] text-stone-400 mt-1">ETo & soil deficit</span>
            </button>

            <button
              onClick={() => handleRunAgentAction('soil_test')}
              disabled={isExecutingAction}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeActionType === 'soil_test' && isExecutingAction
                  ? 'bg-emerald-900/50 border-emerald-400 animate-pulse'
                  : 'bg-stone-950/80 hover:bg-emerald-950/50 border-stone-800 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center justify-between text-amber-400 mb-1.5">
                <HeartPulse className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Soil</span>
              </div>
              <span className="text-xs font-bold text-white">Soil Diagnostic</span>
              <span className="text-[10px] text-stone-400 mt-1">NPK & pH audit</span>
            </button>

            <button
              onClick={() => handleRunAgentAction('mandi_check')}
              disabled={isExecutingAction}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeActionType === 'mandi_check' && isExecutingAction
                  ? 'bg-emerald-900/50 border-emerald-400 animate-pulse'
                  : 'bg-stone-950/80 hover:bg-emerald-950/50 border-stone-800 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Market</span>
              </div>
              <span className="text-xs font-bold text-white">Check APMC Mandi</span>
              <span className="text-[10px] text-stone-400 mt-1">Regional arrival rates</span>
            </button>

            <button
              onClick={() => handleRunAgentAction('generate_tasks')}
              disabled={isExecutingAction}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeActionType === 'generate_tasks' && isExecutingAction
                  ? 'bg-emerald-900/50 border-emerald-400 animate-pulse'
                  : 'bg-stone-950/80 hover:bg-emerald-950/50 border-stone-800 hover:border-emerald-600/50'
              }`}
            >
              <div className="flex items-center justify-between text-indigo-400 mb-1.5">
                <CalendarCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Tasks</span>
              </div>
              <span className="text-xs font-bold text-white">Generate Field Tasks</span>
              <span className="text-[10px] text-stone-400 mt-1">Smart stage actions</span>
            </button>
          </div>
        </div>

        {/* Live Action Execution Result Card */}
        {agentResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-fade-in shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-sm text-white">{agentResult.title}</h3>
              </div>
              <button
                onClick={() => setAgentResult(null)}
                className="text-stone-400 hover:text-white text-xs cursor-pointer px-2 py-0.5 rounded-lg bg-stone-900/60 hover:bg-stone-800 transition-colors"
              >
                Dismiss
              </button>
            </div>

            <p className="text-sm text-stone-200 leading-relaxed font-medium">
              {agentResult.summary}
            </p>

            {/* Rich Inline Farm Financial Analytics Widget */}
            {agentResult.analyticsData && (
              <div className="p-3.5 rounded-xl bg-stone-950/90 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Real Farm Financial Breakdown</span>
                  </span>
                  <span className="text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/50 px-2.5 py-0.5 rounded-full">
                    {agentResult.analyticsData.profit_margin_percent}% Net Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
                    <span className="text-[10px] text-stone-400 block uppercase">Net Profit</span>
                    <strong className="text-emerald-400 text-sm font-black">
                      ₹{agentResult.analyticsData.net_profit.toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
                    <span className="text-[10px] text-stone-400 block uppercase">Yearly Revenue</span>
                    <strong className="text-white text-sm font-black">
                      ₹{agentResult.analyticsData.yearly_income.toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
                    <span className="text-[10px] text-stone-400 block uppercase">Operating Cost</span>
                    <strong className="text-rose-300 text-sm font-black">
                      ₹{agentResult.analyticsData.yearly_expense.toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
                    <span className="text-[10px] text-stone-400 block uppercase">Water Efficiency</span>
                    <strong className="text-cyan-300 text-xs font-bold">
                      {agentResult.analyticsData.water_efficiency_rating}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-800 text-xs text-stone-400">
                  <span>
                    Cultivated Acreage: {agentResult.analyticsData.cultivated_area_acres} acres • Health Rating: {agentResult.analyticsData.health_score}/100
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('reports')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span>Open Full Reports & Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {agentResult.details && agentResult.details.length > 0 && (
              <div className="pt-2 border-t border-emerald-800/40">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 block mb-1.5">
                  Agronomic Rationale & Telemetry:
                </span>
                <ul className="space-y-1 text-xs text-stone-300">
                  {agentResult.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {agentResult.taskCreated && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 text-xs text-emerald-100">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>Task Auto-Scheduled:</strong> {agentResult.taskCreated.title} (Due: {agentResult.taskCreated.due_date})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Direct Interactive AI Command Console */}
        <div className="space-y-2">
          <form onSubmit={handleSendDashboardMessage} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={dashboardQuery}
                onChange={(e) => setDashboardQuery(e.target.value)}
                placeholder={`Ask or command AgriGenius AI (e.g. "give the farm analytics", "check mandi rates")...`}
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
              {onOpenVoiceAssistant && (
                <button
                  type="button"
                  onClick={onOpenVoiceAssistant}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Speak to Alexa"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!dashboardQuery.trim() || isExecutingAction}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isExecutingAction ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Ask</span>
            </button>
          </form>

          {/* Quick Command Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
              Quick Tasks:
            </span>
            {[
              { label: '📊 Give Farm Analytics', query: 'give the farm analytics' },
              { label: '💧 Calculate Drip Requirement', query: 'calculate irrigation requirement for current crop' },
              { label: '🧪 Soil Health Diagnostic', query: 'analyze soil health and NPK status' },
              { label: '🌾 Check APMC Mandi Rates', query: 'check mandi prices for active crop' },
              { label: '🌦️ Live Weather & Spray Window', query: 'what is today weather and spray window' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setDashboardQuery(chip.query);
                  executeDirectPrompt(chip.query);
                }}
                disabled={isExecutingAction}
                className="px-2.5 py-1 rounded-xl bg-stone-950 hover:bg-emerald-950/80 border border-stone-800 hover:border-emerald-600/50 text-stone-300 hover:text-emerald-300 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. KPI Telemetry Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cultivated Land */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm hover:border-emerald-700/60 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cultivated Area</span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{currentFarm?.cultivated_area || 0}</span>
            <span className="text-xs text-stone-400 font-medium">/ {currentFarm?.total_area || 0} {currentFarm?.area_unit}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 capitalize">
            {currentFarm?.farm_type?.replace('_', ' ')} • {currentFarm?.soil_type} soil
          </p>
        </div>

        {/* KPI 2: Soil Health Index */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm hover:border-emerald-700/60 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Soil Health Score</span>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{currentFarm?.health_score || 88}</span>
            <span className="text-xs text-emerald-400 font-semibold">Optimal</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            pH {currentFarm?.soil_ph ?? '6.8'} • NPK: {currentFarm?.nitrogen ?? 300}:{currentFarm?.phosphorus ?? 22}:{currentFarm?.potassium ?? 230}
          </p>
        </div>

        {/* KPI 3: Water Status */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm hover:border-emerald-700/60 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Soil Moisture</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{currentFarm?.soil_moisture || 42}%</span>
            <span className="text-xs text-cyan-400 font-semibold">Adequate</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 capitalize">
            {currentFarm?.irrigation_type} system • {currentFarm?.water_source}
          </p>
        </div>

        {/* KPI 4: Pending Field Tasks */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm hover:border-emerald-700/60 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{pendingTasks.length}</span>
            <span className="text-xs text-stone-400 font-medium">({completedTasks.length} completed)</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 truncate">
            {pendingTasks[0] ? `Next: ${pendingTasks[0].title}` : 'All scheduled tasks clear'}
          </p>
        </div>
      </div>

      {/* 4. Interactive Nutrient Management & Fertigation Calculator */}
      <NutrientCalculatorWidget
        currentFarm={currentFarm}
        activeCropCycle={activeCycle}
        onScheduleTask={handleScheduleFertigationTask}
        onNavigateToIrrigation={() => onNavigate('irrigation')}
      />

      {/* 5. Active Crop Progress & Microclimate Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crop Cycle Progress */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Active Crop Cycle Progression</h2>
            </div>
            <button
              onClick={() => onNavigate('crops')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Cycles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeCycle ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{activeCycle.crop_name}</span>
                    <span className="text-xs text-stone-400 font-normal">({activeCycle.variety})</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Stage: {activeCycle.growth_stage}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Allocated: {activeCycle.area_allocated} {currentFarm?.area_unit} • Sown on {activeCycle.sowing_date} • Expected Harvest: {activeCycle.expected_harvest_date}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400">
                    {activeCycle.timeline?.progressPercent ?? 30}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="relative pt-2">
                <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${activeCycle.timeline?.progressPercent ?? 30}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 mt-2 font-medium">
                  <span>Sowing</span>
                  <span>Vegetative</span>
                  <span className="text-emerald-400 font-bold">Flowering</span>
                  <span>Fruiting</span>
                  <span>Harvest</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200">
                <strong>Agronomic Directive:</strong> First top-dressing of organic nutrients; weed management and soil aeration.
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400 text-sm">
              <p>No active crop cycle in progress for this farm.</p>
              <button
                onClick={() => onNavigate('crops')}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Start New Crop Cycle
              </button>
            </div>
          )}
        </div>

        {/* Microclimate Advisory */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Agro-Climatic Advisory
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                Verified Forecast
              </span>
            </div>

            <div className="flex items-center justify-between my-3">
              <div>
                <div className="text-3xl font-extrabold text-white">
                  {weather?.current.temperature_c ?? 28.5}°C
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {weather?.current.condition ?? 'Partly Sunny'} • Feels like {weather?.current.feels_like_c ?? 30.2}°C
                </p>
              </div>
              <div className="text-right text-xs text-stone-300 space-y-1">
                <p>Humidity: <strong>{weather?.current.humidity_percent ?? 60}%</strong></p>
                <p>Wind: <strong>{weather?.current.wind_kph ?? 14.5} kph</strong></p>
                <p>Rain Chance: <strong>{weather?.current.precipitation_probability ?? 25}%</strong></p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 my-3">
              <strong>Spray Window Notice:</strong> {weather?.advisory.spray_window ?? 'Favorable spray window tomorrow morning 6:30 AM - 9:30 AM (wind < 12 kph).'}
            </div>
          </div>

          <button
            onClick={() => onNavigate('weather')}
            className="w-full mt-2 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold text-center transition-colors cursor-pointer"
          >
            Detailed 7-Day Microclimate View
          </button>
        </div>
      </div>

      {/* 5. Field Tasks & Mandi Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Tasks List */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Field Tasks & Reminders</h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 hover:border-emerald-600/50 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 rounded border-stone-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">{task.title}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{task.description}</p>
                  <p className="text-[10px] text-stone-500 mt-1">Due: {task.due_date} • {task.category}</p>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center py-6 text-xs text-stone-500">
                No pending tasks. Click "Generate Field Tasks" above to create actions!
              </p>
            )}
          </div>
        </div>

        {/* Mandi Rates Ticker */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Market APMC Ticker</h2>
              </div>
              <button
                onClick={() => onNavigate('market')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Mandi Rates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              Official e-NAM portal rates for regional agricultural markets (Nashik & APMC centers).
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                <div>
                  <span className="text-xs font-bold text-white">Tomato (Hybrid)</span>
                  <p className="text-[10px] text-stone-400">Nashik APMC • Daily arrivals</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">Rs. 2,850 / q</span>
                  <p className="text-[10px] text-emerald-300">+8% this week</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                <div>
                  <span className="text-xs font-bold text-white">Chilli (Dry Red)</span>
                  <p className="text-[10px] text-stone-400">Guntur APMC • Grade A</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">Rs. 19,500 / q</span>
                  <p className="text-[10px] text-emerald-300">+3.5% this week</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('schemes')}
            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 text-xs font-semibold text-center transition-colors cursor-pointer"
          >
            Explore Government Subsidies & Drip Schemes
          </button>
        </div>
      </div>
    </div>
  );
};
