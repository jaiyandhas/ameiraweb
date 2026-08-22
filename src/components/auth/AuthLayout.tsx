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
    <div className="min-h-screen bg-zinc-50 flex font-sans">

      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[44%] bg-zinc-900 text-white flex-col justify-between p-12 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/ameiratransparent.png" alt="Ameira" className="h-10 w-auto object-contain brightness-200" />
          <span className="font-extrabold text-xl tracking-tight text-white">Ameira</span>
        </div>

        {/* Core Message */}
        <div>
          <blockquote className="text-3xl font-extrabold tracking-tight leading-snug text-white mb-6">
            "Your business.<br />One workspace."
          </blockquote>
          <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
            Bring your people, work and operations into one simple workspace — without the complexity of enterprise software.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-zinc-300 text-sm">Setup in under 60 seconds</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-zinc-300 text-sm">No IT expertise required</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-zinc-300 text-sm">Built for growing businesses</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-zinc-600 text-xs">
          &copy; 2026 Ameira. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <img src="/ameiratransparent.png" alt="Ameira" className="h-10 w-auto object-contain" />
          <span className="font-extrabold text-lg tracking-tight text-zinc-900">Ameira</span>
        </div>

        <div className="w-full max-w-md">
          {/* Back link */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-800 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Ameira
            </button>
          )}

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-zinc-500 mt-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl shadow-sm">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
};
