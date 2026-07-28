import React from 'react';

export const HowAmeiraWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create your business',
      description: 'Create your workspace in less than a minute.'
    },
    {
      number: '02',
      title: 'Invite your team',
      description: 'Add employees and assign roles with a few clicks.'
    },
    {
      number: '03',
      title: 'Start working',
      description: 'Everyone only sees the tools they need.'
    }
  ];

  return (
    <section className="py-20 bg-white border-y border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            How Ameira Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-zinc-50 border border-zinc-200/80 p-8 sm:p-10 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-4">
                  Step {step.number}
                </span>
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-base text-zinc-600 mt-3 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
