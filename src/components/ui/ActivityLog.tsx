'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Terminal, 
  ChevronRight, 
  Search, 
  FileText, 
  Film, 
  Upload, 
  CheckCircle, 
  BarChart3,
  Loader2,
  AlertCircle,
  RotateCw,
  Zap
} from 'lucide-react';
import { AgentName, StepState } from '@/types';

interface ActivityItem {
  id: string;
  type: 'THOUGHT' | 'ACTION' | 'RESULT' | 'ERROR';
  content: string;
  timestamp: string; // ISO string from API
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  agentName: AgentName;
  jobId?: string; // Real jobId to fetch logs for
  isOpen: boolean;
  onClose: () => void;
  status: StepState;
}

const agentIconMap: Record<AgentName, any> = {
  jessica: Search,
  sunny: FileText,
  rovert: Film,
  tim: Upload,
  david: CheckCircle,
  john: BarChart3,
};

export function ActivityLog({ agentName, jobId, isOpen, onClose, status }: ActivityLogProps) {
  const Icon = agentIconMap[agentName];
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchLogs();
      // Set up polling for active steps
      let interval: NodeJS.Timeout;
      if (status === 'WORKING') {
        interval = setInterval(fetchLogs, 3000);
      }
      return () => clearInterval(interval);
    }
  }, [isOpen, jobId, agentName, status]);

  const fetchLogs = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/logs?agentName=${agentName}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch activity logs:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl z-[101] flex flex-col notranslate"
            translate="no"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-800 text-white`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                    {agentName} <span className="text-slate-400 dark:text-slate-500 font-medium">Activity</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {status === 'WORKING' && <Loader2 size={12} className="animate-spin text-amber-500" />}
                    <span className={`text-xs font-medium uppercase tracking-wider ${
                      status === 'WORKING' ? 'text-amber-500' : 
                      status === 'DONE' ? 'text-emerald-500' : 
                      status === 'FAILED' ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={async () => {
                    if (!jobId) return;
                    setLoading(true);
                    try {
                      await fetch(`/api/jobs/${jobId}/resume`, { method: 'POST' });
                      await fetchLogs();
                    } catch (e) {
                      console.error('Wake up failed:', e);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Zap size={14} className={loading ? 'animate-pulse' : 'fill-current'} />
                  <span>깨우기</span>
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                <button 
                  onClick={fetchLogs}
                  disabled={loading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                  title="새로고침"
                >
                  <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200">
                    <Terminal size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-500 dark:text-slate-400">아직 활동 기록이 없습니다</p>
                    <p className="text-xs text-slate-400 mt-1">에이전트가 생각 중이거나 잠들어 있을 수 있습니다.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!jobId) return;
                      setLoading(true);
                      await fetch(`/api/jobs/${jobId}/resume`, { method: 'POST' });
                      await fetchLogs();
                    }}
                    className="mt-2 px-4 py-2 bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
                  >
                    에이전트 깨우기
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                  
                  <div className="space-y-8 relative">
                    {logs.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className={`
                          mt-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center z-10
                          ${item.type === 'THOUGHT' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 
                            item.type === 'ACTION' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 
                            item.type === 'RESULT' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' : 
                            'bg-red-100 dark:bg-red-900/30 text-red-500'}
                        `}>
                          {item.type === 'THOUGHT' && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                          {item.type === 'ACTION' && <ChevronRight size={12} />}
                          {item.type === 'RESULT' && <CheckCircle size={12} />}
                          {item.type === 'ERROR' && <AlertCircle size={12} />}
                        </div>
                        <div className="flex-1 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-slate-300 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-sm font-medium leading-relaxed">
                            {item.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Row: Always show if WORKING */}
              {status === 'WORKING' && (
                <div className="flex gap-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-sm text-amber-600 dark:text-amber-500 font-bold tracking-tight">
                      Agent Brain Online
                    </div>
                    <div className="text-[10px] text-amber-400 font-medium animate-pulse uppercase tracking-widest mt-0.5">
                      Processing patterns...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Artifact Status
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-white">
                    {status === 'DONE' ? 'Successfully Generated' : 
                     status === 'FAILED' ? 'Failed' : 'Building...'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
