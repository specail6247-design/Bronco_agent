'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ComponentProps, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disableMotion?: boolean;
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
};

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-lg px-6 py-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon,
    iconPosition = 'left',
    disableMotion = false,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const { onDrag, onDragEnd, onDragStart, ...restProps } = props;

    const classes = `
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
          inline-flex items-center justify-center gap-2
          tap-target
          ${className}
        `;

    if (disableMotion) {
      return (
        <button
          ref={ref}
          className={classes}
          disabled={isDisabled}
          {...restProps}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        {...(restProps as unknown as Omit<ComponentProps<typeof motion.button>, 'ref'>)}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
