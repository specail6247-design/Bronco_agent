'use client';

import { motion } from 'framer-motion';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { StepState } from '@/types';

interface StatusBadgeProps {
  status: StepState;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const statusConfig: Record<StepState, {
  label: string;
  icon: typeof Clock;
  className: string;
  animate?: boolean;
}> = {
  WAITING: {
    label: 'Waiting',
    icon: Clock,
    className: 'status-waiting',
  },
  WORKING: {
    label: 'Working',
    icon: Loader2,
    className: 'status-working',
    animate: true,
  },
  DONE: {
    label: 'Done',
    icon: CheckCircle2,
    className: 'status-done',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    className: 'status-failed',
  },
};

export function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <motion.span
      className={`status-badge ${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
      initial={false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      suppressHydrationWarning={true}
    >
      <Icon 
        size={iconSize} 
        className={config.animate ? 'animate-spin' : ''} 
      />
      {showLabel && <span>{config.label}</span>}
    </motion.span>
  );
}
