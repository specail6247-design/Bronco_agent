'use client';

import { motion } from 'framer-motion';
import { ComponentProps, ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  disableMotion?: boolean;
}

export function GlassCard({
  children,
  className = '',
  hover = false,
  disableMotion = false,
  ...rest
}: GlassCardProps) {
  const { onDrag, onDragStart, onDragEnd, ...restProps } = rest;
  const classes = `
        glass-card rounded-2xl p-6
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `;

  if (disableMotion) {
    return (
      <div className={classes} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={classes}
      {...(restProps as Omit<ComponentProps<typeof motion.div>, 'ref'>)}
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
