import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  onStart: () => void;
  onSignIn: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onStart, onSignIn }) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-md border-b border-zinc-200/60 transition-all">
      <div className="max-w-6xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Branding */}
        <div className="flex items-center gap-3">
          <img 
            src="/ameiralogo.png" 
            alt="Ameira Operating System for MSMEs" 
            className="h-10 w-auto object-contain" 
          />
          <span className="font-bold text-2xl tracking-tight text-zinc-900">
            Ameira
          </span>
        </div>

        {/* Minimal Navigation & Primary Action */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="md" onClick={onSignIn} className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button variant="primary" size="md" onClick={onStart}>
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
