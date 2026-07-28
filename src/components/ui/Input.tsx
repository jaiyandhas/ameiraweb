import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-base font-semibold text-zinc-900"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        ref={ref}
        className={twMerge(
          clsx(
            'w-full px-4 py-3.5 text-base text-zinc-900 bg-white border border-zinc-300 rounded-xl transition-all',
            'placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent',
            error && 'border-red-500 focus:ring-red-500',
            className
          )
        )}
        {...props}
      />

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-zinc-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
