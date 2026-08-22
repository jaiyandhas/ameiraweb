import React from 'react';
import { Check } from 'lucide-react';

export interface SetupStepItem {
  done: boolean;
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface SetupChecklistProps {
  steps: SetupStepItem[];
}

export const SetupChecklist: React.FC<SetupChecklistProps> = ({ steps }) => {
  const allDone = steps.every(s => s.done);
  const completedCount = steps.filter(s => s.done).length;

  if (allDone) return null;

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-zinc-900">Getting Started</h2>
        <span className="text-xs font-semibold text-zinc-400">{completedCount}/{steps.length}</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-zinc-900 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                step.done ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300 bg-white'
              }`}>
                {step.done && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className={`text-sm font-medium ${step.done ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                {step.label}
              </span>
            </div>
            {!step.done && step.actionLabel && step.onAction && (
              <button
                onClick={step.onAction}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {step.actionLabel} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
