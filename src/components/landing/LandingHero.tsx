import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { DynamicWordCycle } from './DynamicWordCycle';

interface LandingHeroProps {
  onStart: () => void;
  onWatchDemo?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onWatchDemo }) => {
  return (
    <section className="pt-16 pb-20 sm:pt-24 sm:pb-32 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
      {/* Brand Headline with Dynamic Word Cycle */}
      <DynamicWordCycle />

      {/* Supporting Paragraph */}
      <p className="text-xl sm:text-2xl text-zinc-600 mt-8 max-w-2xl leading-relaxed font-normal">
        Stop switching between WhatsApp, spreadsheets and disconnected tools. Manage your people, work and operations from one simple workspace.
      </p>

      {/* Call to Actions */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <Button size="lg" onClick={onStart} fullWidth className="text-lg py-4 shadow-sm">
          Start Your Workspace
          <ArrowRight className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="lg" onClick={onWatchDemo || onStart} fullWidth className="text-lg py-4">
          <Play className="h-4 w-4 fill-zinc-900" />
          Watch Demo
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-zinc-600 font-medium">
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-zinc-900" />
          Setup in under 60 seconds
        </span>
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-zinc-900" />
          No IT expertise required
        </span>
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-zinc-900" />
          Built for growing businesses
        </span>
      </div>
    </section>
  );
};
