import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  message,
  className
}) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800 icon:text-red-600',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon:text-emerald-600',
    info: 'bg-zinc-100 border-zinc-200 text-zinc-800 icon:text-zinc-600',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div 
      role="alert" 
      className={clsx(
        'p-4 rounded-xl border flex items-start gap-3 text-sm font-medium transition-all',
        styles[type],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
};
