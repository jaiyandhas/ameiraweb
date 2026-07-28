import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'neutral' | 'success' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const variants = {
    default: 'bg-zinc-900 text-white font-medium',
    neutral: 'bg-zinc-100 text-zinc-700 font-medium border border-zinc-200',
    success: 'bg-emerald-50 text-emerald-800 font-medium border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 font-medium border border-amber-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-3 py-1 text-xs rounded-lg',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 justify-center tracking-wide',
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
