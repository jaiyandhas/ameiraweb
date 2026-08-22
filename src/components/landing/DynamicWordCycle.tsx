import React, { useState, useEffect } from 'react';

interface WordConfig {
  word: string;
  pillBg: string;
  pillBorder: string;
  textColor: string;
  dotBg: string;
}

const WORD_CONFIGS: WordConfig[] = [
  {
    word: 'business',
    pillBg: 'bg-zinc-100',
    pillBorder: 'border-zinc-300/80',
    textColor: 'text-zinc-900',
    dotBg: 'bg-zinc-800',
  },
  {
    word: 'shop',
    pillBg: 'bg-amber-100/80',
    pillBorder: 'border-amber-300/80',
    textColor: 'text-amber-950',
    dotBg: 'bg-amber-500',
  },
  {
    word: 'store',
    pillBg: 'bg-sky-100/80',
    pillBorder: 'border-sky-300/80',
    textColor: 'text-sky-950',
    dotBg: 'bg-sky-500',
  },
  {
    word: 'factory',
    pillBg: 'bg-emerald-100/80',
    pillBorder: 'border-emerald-300/80',
    textColor: 'text-emerald-950',
    dotBg: 'bg-emerald-500',
  },
  {
    word: 'workshop',
    pillBg: 'bg-indigo-100/80',
    pillBorder: 'border-indigo-300/80',
    textColor: 'text-indigo-950',
    dotBg: 'bg-indigo-500',
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

    // Cycle word every 3 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % WORD_CONFIGS.length);
        setIsTransitioning(false);
      }, 250);
    }, 3000);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  const currentConfig = WORD_CONFIGS[index];

  if (reducedMotion) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[1.15] text-center max-w-4xl">
          <span>Your </span>
          <span className="inline-flex items-center gap-2.5 sm:gap-3.5 px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-zinc-100 border border-zinc-300/80 text-zinc-900 align-middle my-1">
            <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-zinc-800 shrink-0" />
            <span>business</span>
          </span>
          <br />
          <span>One workspace.</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Accessible text for screen readers */}
      <span className="sr-only">Your business, one workspace.</span>

      {/* Visual Notion-style animated headline */}
      <h1
        aria-hidden="true"
        className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[1.15] text-center max-w-5xl"
      >
        <span>Your </span>
        <span
          className={`inline-flex items-center gap-2.5 sm:gap-3.5 px-4 py-1 sm:px-6 sm:py-2 rounded-full border align-middle transition-all duration-500 ease-in-out my-1 ${currentConfig.pillBg} ${currentConfig.pillBorder} ${currentConfig.textColor}`}
        >
          <span
            className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-colors duration-500 shrink-0 ${currentConfig.dotBg}`}
          />
          <span
            className={`inline-block transition-all duration-250 ease-out transform ${
              isTransitioning
                ? 'opacity-0 scale-95'
                : 'opacity-100 scale-100'
            }`}
          >
            {currentConfig.word}
          </span>
        </span>
        <br />
        <span className="block mt-2">One workspace.</span>
      </h1>
    </div>
  );
};
