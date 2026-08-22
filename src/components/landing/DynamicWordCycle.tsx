import React, { useState, useEffect } from 'react';

interface WordConfig {
  word: string;
  gradientClass: string;
}

const WORD_CONFIGS: WordConfig[] = [
  {
    word: 'business',
    gradientClass: 'from-zinc-900 via-zinc-600 to-zinc-900',
  },
  {
    word: 'shop',
    gradientClass: 'from-amber-600 via-orange-600 to-amber-700',
  },
  {
    word: 'store',
    gradientClass: 'from-sky-600 via-blue-600 to-indigo-600',
  },
  {
    word: 'factory',
    gradientClass: 'from-emerald-600 via-teal-600 to-emerald-700',
  },
  {
    word: 'workshop',
    gradientClass: 'from-indigo-600 via-purple-600 to-violet-700',
  },
];

export const DynamicWordCycle: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    // Cycle word every 2.8 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % WORD_CONFIGS.length);
        setIsTransitioning(false);
      }, 250);
    }, 2800);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  const currentConfig = WORD_CONFIGS[index];

  if (reducedMotion) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[1.08] text-center max-w-4xl">
          Your business,
          <br />
          <span className="block mt-2">One workspace.</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Accessible text for screen readers */}
      <span className="sr-only">Your business, one workspace.</span>

      {/* Dynamic typography headline without pill box */}
      <h1
        aria-hidden="true"
        className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[1.08] text-center max-w-5xl"
      >
        <span>Your </span>
        <span className="inline-block relative text-left min-w-[4.4ch] sm:min-w-[4.6ch] align-bottom">
          <span
            className={`inline-block bg-gradient-to-r ${currentConfig.gradientClass} bg-clip-text text-transparent transition-all duration-300 ease-out transform ${
              isTransitioning
                ? 'opacity-0 translate-y-3 scale-95 filter blur-[2px]'
                : 'opacity-100 translate-y-0 scale-100 filter blur-0'
            }`}
          >
            {currentConfig.word}
          </span>
        </span>
        <span>,</span>
        <br />
        <span className="block mt-2">One workspace.</span>
      </h1>
    </div>
  );
};
