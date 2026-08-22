import React from 'react';

interface WelcomeHeaderProps {
  userName?: string;
  businessName?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, businessName }) => {
  const greeting = getGreeting();
  const firstName = userName?.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="mb-10">
      <p className="text-sm font-medium text-zinc-400 mb-1">{today}</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
        {greeting}, {firstName}.
      </h1>
      {businessName && (
        <p className="text-base text-zinc-500 mt-2">
          Here is what happened in <span className="font-semibold text-zinc-700">{businessName}</span> today.
        </p>
      )}
    </div>
  );
};
