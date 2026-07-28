import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { HowAmeiraWorks } from '../components/landing/HowAmeiraWorks';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { WorkspacePreview } from '../components/landing/WorkspacePreview';
import { ComingSoonSection } from '../components/landing/ComingSoonSection';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  onStart: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onSignIn }) => {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* Navigation Header */}
      <LandingNavbar onStart={onStart} onSignIn={onSignIn} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Brand Headline & Hero */}
        <LandingHero onStart={onStart} />

        {/* How Ameira Works (3 Step Cards) */}
        <HowAmeiraWorks />

        {/* Before vs With Ameira Comparison */}
        <ComparisonSection />

        {/* Realistic Workspace Preview */}
        <WorkspacePreview />

        {/* Coming Soon Features */}
        <ComingSoonSection />
      </main>

      {/* Footer & CTA */}
      <LandingFooter onStart={onStart} />
    </div>
  );
};
