import React from 'react';
import { ShoppingBag, Truck, BarChart3 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ComingSoonSection: React.FC = () => {
  const upcomingFeatures = [
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Connect with suppliers and service providers.'
    },
    {
      icon: Truck,
      title: 'Orders',
      description: 'Track customer orders from request to delivery.'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Understand how your business is performing.'
    }
  ];

  return (
    <section className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Growing with your business.
        </h2>
        <p className="text-base text-zinc-500 mt-2">
          Future workspace tools coming as your operations expand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upcomingFeatures.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-zinc-200/80 p-8 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="neutral" size="sm">
                    Coming Soon
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
