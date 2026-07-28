import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { IndustryShowcase } from '../components/landing/IndustryShowcase';
import { ValueProps } from '../components/landing/ValueProps';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* Sticky Accessible Navigation Bar */}
      <LandingNavbar onStart={onStart} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 10-Second Value Proposition Hero */}
        <LandingHero onStart={onStart} />

        {/* Targeted MSME Industry Showcase (Retailers, Manufacturers, Textile, Wholesalers) */}
        <IndustryShowcase />

        {/* Core Design & UX Philosophy */}
        <ValueProps />
      </main>

      {/* Footer Banner */}
      <LandingFooter onStart={onStart} />
    </div>
  );
};
