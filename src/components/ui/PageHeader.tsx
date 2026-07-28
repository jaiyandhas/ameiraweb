import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  action
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0 flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};
