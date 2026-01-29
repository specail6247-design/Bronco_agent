'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  disableMotion?: boolean;
}

export function GlassCard({
  children,
  className = '',
  onClick,
  hover = false,
  disableMotion = false,
}: GlassCardProps) {
  const classes = `
        glass-card rounded-2xl p-6
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `;

  if (disableMotion) {
    return (
      <div className={classes} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={classes}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

interface LabelCardProps {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  onClick?: () => void;
}

export function LabelCard({ children, className = '', accentColor, onClick }: LabelCardProps) {
  return (
    <motion.div
      className={`label-card p-6 ${className}`}
      style={accentColor ? { '--accent-color': accentColor } as React.CSSProperties : undefined}
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
