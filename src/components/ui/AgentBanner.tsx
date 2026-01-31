'use client';

import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Film, 
  Upload, 
  CheckCircle, 
  BarChart3,
  LucideIcon
} from 'lucide-react';
import { AgentName, StepState } from '@/types';
import { StatusBadge } from './StatusBadge';

interface AgentInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
}

const agentInfoMap: Record<AgentName, AgentInfo> = {
  jessica: {
    name: 'Jessica',
    description: 'Research & Trending Keywords',
    icon: Search,
    color: '#E8B4B8',
    bgGradient: 'from-rose-50 to-pink-50',
  },
  sunny: {
    name: 'Sunny',
    description: 'Long-form Script Writer',
    icon: FileText,
    color: '#FFD93D',
    bgGradient: 'from-amber-50 to-yellow-50',
  },
  rovert: {
    name: 'Rovert',
    description: 'Storyboard & Shot List',
    icon: Film,
    color: '#6BCB77',
    bgGradient: 'from-emerald-50 to-green-50',
  },
  tim: {
    name: 'Tim',
    description: 'Upload Package & Metadata',
    icon: Upload,
    color: '#4D96FF',
    bgGradient: 'from-blue-50 to-sky-50',
  },
  david: {
    name: 'David',
    description: 'Post-publish QA Checks',
    icon: CheckCircle,
    color: '#9B59B6',
    bgGradient: 'from-purple-50 to-violet-50',
  },
  john: {
    name: 'John',
    description: 'Performance Report',
    icon: BarChart3,
    color: '#34495E',
    bgGradient: 'from-slate-50 to-gray-50',
  },
};

interface AgentBannerProps {
  agent: AgentName;
  status?: StepState;
  onClick?: () => void;
  compact?: boolean;
}

export function AgentBanner({ agent, status = 'WAITING', onClick, compact = false }: AgentBannerProps) {
  // Fallback to jessica if agent name is unknown to prevent crash
  const info = agentInfoMap[agent] || agentInfoMap['jessica'];
  const Icon = info.icon;

  return (
    <motion.div
      className={`
        agent-${agent} label-card cursor-pointer notranslate
        bg-gradient-to-br ${info.bgGradient}
        ${compact ? 'p-4' : 'p-6'}
      `}
      translate="no"
      suppressHydrationWarning={true}
      style={{ '--accent-color': info.color } as React.CSSProperties}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${info.color}20` }}
        >
          <Icon 
            size={compact ? 24 : 32} 
            style={{ color: info.color }}
            strokeWidth={2}
          />
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Agent Info */}
      <div className="space-y-1">
        <h3 
          className={`heading-display text-slate-800 ${compact ? 'text-lg' : 'text-xl'}`}
          style={{ color: '#333' }}
        >
          {info.name}
        </h3>
        <p className="text-sm text-slate-600" style={{ color: '#666' }}>
          {info.description}
        </p>
      </div>

      {/* Decorative element */}
      <div 
        className="absolute bottom-0 right-0 w-24 h-24 opacity-10 rounded-tl-full"
        style={{ backgroundColor: info.color }}
      />
    </motion.div>
  );
}

export function AgentBannerGrid({ 
  statuses = {},
  onAgentClick,
}: { 
  statuses?: Partial<Record<AgentName, StepState>>;
  onAgentClick?: (agent: AgentName) => void;
}) {
  const agents: AgentName[] = ['jessica', 'sunny', 'rovert', 'tim', 'david', 'john'];

  return (
    <div className="agent-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {agents.map((agent) => (
        <AgentBanner 
          key={agent}
          agent={agent} 
          status={statuses[agent] || 'WAITING'}
          onClick={() => onAgentClick?.(agent)}
        />
      ))}
    </div>
  );
}
