import React, { useState } from 'react';
import { Store, Factory, Shirt, Package, Check } from 'lucide-react';

export const IndustryShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const industries = [
    {
      id: 'retail',
      label: 'Retailers',
      icon: Store,
      title: 'Built for Retail Stores & Outlets',
      description: 'Manage store managers, cashiers, and inventory assistants with zero confusion.',
      bullets: [
        'Assign clear roles to floor staff and cashiers',
        'Prevent unauthorized setting changes',
        'One-click WhatsApp invite for new employees'
      ]
    },
    {
      id: 'manufacturing',
      label: 'Manufacturers',
      icon: Factory,
      title: 'Built for Factory & Unit Operations',
      description: 'Organize supervisors, machine operators, and procurement leads across your unit.',
      bullets: [
        'Separate admin controls from operational workers',
        'Keep business contact and settings secure',
        'Add custom job titles to fit your factory layout'
      ]
    },
    {
      id: 'textile',
      label: 'Textile Companies',
      icon: Shirt,
      title: 'Built for Mills, Traders & Garment Houses',
      description: 'Empower sales managers, cloth weavers, and dispatch heads without ERP overhead.',
      bullets: [
        'Clear human terms instead of technical database scopes',
        'Effortless access setup for seasonal staff',
        'Designed for quick multi-department coordination'
      ]
    },
    {
      id: 'wholesale',
      label: 'Wholesalers',
      icon: Package,
      title: 'Built for Distributors & Bulk Traders',
      description: 'Control warehouse managers, billing personnel, and field sales teams.',
      bullets: [
        'Restricted views for external or contract workers',
        'Full business owner control over permissions',
        'Calm workspace that scales as your trade grows'
      ]
    }
  ];

  const current = industries[activeTab];
  const CurrentIcon = current.icon;

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Designed for how your business works.
          </h2>
          <p className="text-lg text-zinc-500 mt-3">
            Whether you run a retail outlet, a factory, a wholesale hub, or a garment business, Ameira adapts instantly.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {industries.map((ind, index) => {
            const Icon = ind.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-base transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                {ind.label}
              </button>
            );
          })}
        </div>

        {/* Active Industry Card */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start justify-between gap-8 shadow-xs">
          <div className="flex-1">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-6">
              <CurrentIcon className="h-6 w-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {current.title}
            </h3>
            <p className="text-lg text-zinc-600 mt-3 leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="w-full md:w-80 shrink-0 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-2xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Key Capabilities
            </h4>
            <div className="flex flex-col gap-3">
              {current.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm font-semibold text-zinc-800">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
