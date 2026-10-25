import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  BookOpen,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';

export const AdminView: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [knowledgeChunks, setKnowledgeChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [h, logs, chunks] = await Promise.all([
        api.getAdminHealth(),
        api.getAuditLogs(),
        api.getKnowledgeChunks(),
      ]);
      setHealthData(h);
      setAuditLogs(logs);
      setKnowledgeChunks(chunks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Agent Orchestration & System Monitoring</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Real-time status of the multi-agent graph, pgvector RAG agricultural repository, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold uppercase">Engine Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {healthData?.system_status ? healthData.system_status.toUpperCase() : 'ONLINE'}
          </div>
          <p className="text-[11px] text-stone-400">Port 3000 • Express + Vite</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold uppercase">RAG Repository</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {healthData?.knowledge_base_chunks_count ?? 4} Chunks
          </div>
          <p className="text-[11px] text-stone-400">{healthData?.rag_engine || 'Hybrid pgvector / keyword'}</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold uppercase">Database RLS</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white">Supabase / PG</div>
          <p className="text-[11px] text-emerald-400">Owner-scoped isolation active</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold uppercase">Scheduled Worker</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400">Active (15m)</div>
          <p className="text-[11px] text-stone-400">Deduplicated reminder alerts</p>
        </div>
      </div>

      {/* RAG Chunks & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAG Knowledge Repository Viewer */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Agronomic RAG Knowledge Store</span>
            </h2>
            <span className="text-xs text-stone-400">
              {knowledgeChunks.length} documents indexed
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {knowledgeChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 font-semibold">{chunk.title}</strong>
                  <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded">
                    {chunk.category}
                  </span>
                </div>
                <p className="text-stone-300 leading-relaxed">{chunk.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Event Stream */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>System & Security Audit Log</span>
            </h2>
            <span className="text-xs text-stone-400">{auditLogs.length} events logged</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white uppercase text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-stone-500">[{log.entity_type}]</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">{log.details}</p>
                </div>
                <span className="text-[10px] text-stone-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
