'use client';

import React from 'react';
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
  Loader2
} from 'lucide-react';
import { AgentName, StepState } from '@/types';

interface ActivityItem {
  id: string;
  type: 'THOUGHT' | 'ACTION' | 'RESULT' | 'ERROR';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  agentName: AgentName;
  isOpen: boolean;
  onClose: () => void;
  status: StepState;
}

const mockActivity: Record<AgentName, ActivityItem[]> = {
  jessica: [
    { id: '1', type: 'THOUGHT', content: 'Analyzing trending topics for "AI Productivity Tools"', timestamp: new Date(Date.now() - 300000) },
    { id: '2', type: 'ACTION', content: 'Scraping YouTube Top 10 for "Digital Nomad" niche', timestamp: new Date(Date.now() - 240000) },
    { id: '3', type: 'ACTION', content: 'Identified 12 high-intent keywords: "workflow", "automation", "notion"...', timestamp: new Date(Date.now() - 180000) },
    { id: '4', type: 'THOUGHT', content: 'Cross-referencing with TikTok virality scores', timestamp: new Date(Date.now() - 120000) },
    { id: '5', type: 'RESULT', content: 'Finalized Research Artifact: 3 content angles generated', timestamp: new Date(Date.now() - 60000) },
  ],
  sunny: [
    { id: 's1', type: 'THOUGHT', content: 'Reading Jessica\'s Research Artifact...', timestamp: new Date(Date.now() - 500000) },
    { id: 's2', type: 'ACTION', content: 'Drafting structure for "5 AI tools for Nomads"', timestamp: new Date(Date.now() - 400000) },
    { id: 's3', type: 'THOUGHT', content: 'Optimizing hook for 15-second retention boost', timestamp: new Date(Date.now() - 300000) },
    { id: 's4', type: 'ACTION', content: 'Writing script section: Tool 1 - Perplexity AI', timestamp: new Date(Date.now() - 200000) },
    { id: 's5', type: 'ACTION', content: 'Writing script section: Tool 2 - Raycast', timestamp: new Date(Date.now() - 100000) },
  ],
  rovert: [
    { id: 'r1', type: 'THOUGHT', content: 'Waiting for Sunny to finish script...', timestamp: new Date(Date.now() - 1000) },
  ],
  tim: [],
  david: [],
  john: [],
};

const agentIconMap: Record<AgentName, any> = {
  jessica: Search,
  sunny: FileText,
  rovert: Film,
  tim: Upload,
  david: CheckCircle,
  john: BarChart3,
};

export function ActivityLog({ agentName, isOpen, onClose, status }: ActivityLogProps) {
  const Icon = agentIconMap[agentName];
  const logs = mockActivity[agentName] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col notranslate"
            translate="no"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-800 text-white`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 capitalize">
                    <span>{agentName}</span>
                    <span className="ml-2">Activity</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {status === 'WORKING' && <Loader2 size={12} className="animate-spin text-amber-500" />}
                    <span className={`text-xs font-medium uppercase tracking-wider ${
                      status === 'WORKING' ? 'text-amber-500' : 
                      status === 'DONE' ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                      <span>{status}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2">
                  <Terminal size={40} />
                  <p><span>No activity recorded yet</span></p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
                  
                  <div className="space-y-8 relative">
                    {logs.map((item, idx) => (
                      <div key={item.id} className="flex gap-4">
                        <div className={`
                          mt-1 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10
                          ${item.type === 'THOUGHT' ? 'bg-slate-200 text-slate-500' : 
                            item.type === 'ACTION' ? 'bg-blue-100 text-blue-500' : 
                            item.type === 'RESULT' ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}
                        `}>
                          {item.type === 'THOUGHT' && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                          {item.type === 'ACTION' && <ChevronRight size={12} />}
                          {item.type === 'RESULT' && <CheckCircle size={12} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              <span>{item.type}</span>
                            </span>
                            <span className="text-[10px] text-slate-300">
                              <span>{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 font-medium leading-relaxed">
                            <span>{item.content}</span>
                          </div>
                          
                          {/* Code-like snippet for certain actions */}
                          {item.id === '3' && (
                            <div className="mt-2 bg-slate-900 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                              <span className="text-slate-500">// Identified Keywords</span>
                              <br />
                              <span className="text-emerald-400">const</span> keywords = [<br />
                              &nbsp;&nbsp;<span className="text-amber-200">"digital nomad tools"</span>,<br />
                              &nbsp;&nbsp;<span className="text-amber-200">"ai productivity"</span>,<br />
                              &nbsp;&nbsp;<span className="text-amber-200">"remote work 2024"</span><br />
                              ];
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {status === 'WORKING' && (
                      <div className="flex gap-4">
                        <div className="mt-1 w-6 h-6 rounded-full border-2 border-white shadow-sm bg-amber-100 text-amber-500 flex items-center justify-center z-10">
                          <Loader2 size={12} className="animate-spin" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-amber-600 font-medium animate-pulse">
                            <span>Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>Artifact Status</span>
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    <span>{status === 'DONE' ? 'Generated' : 'Pending...'}</span>
                  </p>
                </div>
                {status === 'DONE' && (
                  <button className="text-blue-500 text-xs font-bold hover:underline">
                    <span>View Artifact</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
