import React from 'react';
import { ShieldCheck, HeartHandshake, Layers } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const features = [
    {
      icon: HeartHandshake,
      title: 'Zero Training Required',
      description: 'Designed so an elderly business owner can understand every screen in under ten minutes without technical help.'
    },
    {
      icon: ShieldCheck,
      title: 'Plain-English Access',
      description: 'No permission matrices, CRUD tables, or complex setups. Just clear capability cards describing real job duties.'
    },
    {
      icon: Layers,
      title: 'Build Room by Room',
      description: 'Never get overwhelmed by giant ERP dashboards. Start with your team today and add workspace tools as you grow.'
    }
  ];

  return (
    <section className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Built on radical simplicity.
        </h2>
        <p className="text-lg text-zinc-500 mt-3">
          We threw out everything that makes enterprise software frustrating.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-zinc-200/80 p-8 rounded-3xl shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-base text-zinc-500 mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
