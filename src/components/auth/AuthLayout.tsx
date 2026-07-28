import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBackToLanding?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  onBackToLanding
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full">
        {/* Back link */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Ameira
          </button>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/ameiralogo.png"
            alt="Ameira Operating System"
            className="h-12 w-auto object-contain mb-4"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-zinc-500 mt-2 max-w-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};
