import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, CheckCircle2, Store, Factory, Shirt, Package } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  const targetIndustries = [
    { label: 'Retailers', icon: Store },
    { label: 'Manufacturers', icon: Factory },
    { label: 'Textile Businesses', icon: Shirt },
    { label: 'Wholesalers', icon: Package },
  ];

  return (
    <section className="pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] max-w-4xl">
        The simple way to run your business.
      </h1>

      {/* Subtitle / Core Value in 10 seconds */}
      <p className="text-xl sm:text-2xl text-zinc-600 mt-6 max-w-2xl leading-relaxed font-normal">
        Ameira gives business owners total control over team members, roles, and operations without enterprise software complexity.
      </p>

      {/* Primary CTA */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <Button size="lg" onClick={onStart} fullWidth className="text-lg py-4 shadow-md">
          Start Your Business Workspace
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Key Guarantees */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No credit card required
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Set up in under 60 seconds
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Zero training needed
        </span>
      </div>

      {/* Target Industry Badges */}
      <div className="mt-16 w-full pt-10 border-t border-zinc-200/80">
        <p className="text-xs uppercase tracking-widest font-semibold text-zinc-400 mb-6">
          Tailored for Indian & Global MSMEs
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {targetIndustries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs text-zinc-800 text-sm font-semibold"
              >
                <Icon className="h-4 w-4 text-zinc-600" />
                {industry.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
