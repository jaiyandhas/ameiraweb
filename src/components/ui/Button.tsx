import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-black focus:ring-zinc-900 shadow-sm',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 focus:ring-zinc-400',
    outline: 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100 focus:ring-zinc-400 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-600 shadow-sm',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-300'
  };

  const sizes = {
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5', // Large click target for elderly / first-time users
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  );
};
