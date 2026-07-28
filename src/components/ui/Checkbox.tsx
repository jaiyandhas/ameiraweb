import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className,
  id,
  checked,
  onChange,
  ...props
}, ref) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      <label 
        htmlFor={checkboxId}
        className="inline-flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="relative">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className={twMerge(
            clsx(
              'h-5 w-5 rounded-md border border-zinc-300 bg-white transition-all flex items-center justify-center',
              'peer-focus:ring-2 peer-focus:ring-zinc-900 peer-focus:ring-offset-1',
              'peer-checked:bg-zinc-900 peer-checked:border-zinc-900',
              'group-hover:border-zinc-400',
              error && 'border-red-500',
              className
            )
          )}>
            <Check className={clsx(
              'h-3.5 w-3.5 stroke-[3] transition-opacity',
              checked ? 'text-white opacity-100' : 'opacity-0'
            )} />
          </div>
        </div>

        {label && (
          <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
            {label}
          </span>
        )}
      </label>

      {error && <p className="text-xs font-medium text-red-600 ml-8">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
