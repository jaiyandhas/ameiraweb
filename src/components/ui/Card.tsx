import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm',
          hoverable && 'hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
