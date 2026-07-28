import React from 'react';
import { X, Check } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const beforeItems = [
    'WhatsApp for communication',
    'Excel for inventory',
    'Paper records',
    'Phone calls for approvals',
    'Multiple disconnected apps'
  ];

  const afterItems = [
    'One shared workspace',
    'Role-based access',
    'Real-time activity',
    'Organised business operations',
    'Everything in one place'
  ];

  return (
    <section className="py-20 sm:py-28 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
          From scattered tools to one workspace.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Before */}
        <div className="bg-zinc-100/70 border border-zinc-200 p-8 sm:p-10 rounded-3xl">
          <h3 className="text-xl font-bold text-zinc-500 mb-6 uppercase tracking-wider text-xs">
            Before
          </h3>
          <ul className="flex flex-col gap-4">
            {beforeItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-base text-zinc-600 font-medium">
                <div className="h-6 w-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center shrink-0">
                  <X className="h-3.5 w-3.5" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: With Ameira */}
        <div className="bg-zinc-900 text-white border border-zinc-900 p-8 sm:p-10 rounded-3xl shadow-lg">
          <h3 className="text-xl font-bold text-zinc-400 mb-6 uppercase tracking-wider text-xs">
            With Ameira
          </h3>
          <ul className="flex flex-col gap-4">
            {afterItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-base text-white font-medium">
                <div className="h-6 w-6 rounded-full bg-white text-zinc-900 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
