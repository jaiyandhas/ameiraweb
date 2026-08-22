import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

interface LandingFooterProps {
  onStart: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onStart }) => {
  return (
    <footer className="bg-zinc-900 text-white pt-16 pb-12 border-t border-zinc-800 font-sans">
      <div className="max-w-5xl mx-auto px-6">
        {/* Bottom CTA Box */}
        <div className="bg-zinc-800 border border-zinc-700/80 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center mb-16 shadow-xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
            Your business.<br />One workspace.
          </h2>
          <p className="text-lg text-zinc-400 mt-4 max-w-xl">
            Bring your people, work, and operations into one simple workspace.
          </p>
          <div className="mt-8 w-full max-w-xs">
            <Button size="lg" onClick={onStart} fullWidth className="bg-white text-zinc-900 hover:bg-zinc-100 text-lg font-bold py-4">
              Start Your Workspace
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-800/80 text-sm text-zinc-500">
          <div className="flex items-center gap-3.5">
            <img 
              src="/ameiralogo-white.png" 
              alt="Ameira" 
              className="h-10 w-auto object-contain" 
            />
            <span className="font-extrabold text-2xl tracking-tight text-white">Ameira</span>
          </div>

          <p className="text-zinc-400">
            Ameira &copy; 2026. The operating system for MSMEs.
          </p>
        </div>
      </div>
    </footer>
  );
};
