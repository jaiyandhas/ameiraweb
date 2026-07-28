import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';
import type { CapabilityDefinition } from '../../types';

interface CapabilityCardProps {
  capability: CapabilityDefinition;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const CapabilityCard: React.FC<CapabilityCardProps> = ({
  capability,
  isSelected,
  onToggle,
  disabled = false
}) => {
  return (
    <div
      onClick={() => !disabled && onToggle()}
      className={twMerge(
        clsx(
          'relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer select-none',
          isSelected 
            ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
            : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300',
          disabled && 'opacity-60 cursor-not-allowed'
        )
      )}
    >
      <div 
        className={clsx(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all',
          isSelected
            ? 'bg-white border-white text-zinc-900'
            : 'bg-zinc-100 border-zinc-300 text-transparent'
        )}
      >
        <Check className="h-4 w-4 stroke-[3]" />
      </div>

      <div className="flex-1">
        <h4 className={clsx('text-base font-semibold', isSelected ? 'text-white' : 'text-zinc-900')}>
          {capability.title}
        </h4>
        <p className={clsx('text-sm mt-1 leading-relaxed', isSelected ? 'text-zinc-300' : 'text-zinc-500')}>
          {capability.description}
        </p>
      </div>
    </div>
  );
};
