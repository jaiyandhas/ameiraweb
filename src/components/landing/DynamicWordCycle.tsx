import React, { useState, useEffect } from 'react';

const WORDS = ['business', 'shop', 'store', 'factory', 'workshop'];

export const DynamicWordCycle: React.FC = () => {
  const [index, setIndex] = useState(0); // Starts on "business"
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'fade' | 'slide-up' | 'slide-down'>('fade');
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
        setIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % WORDS.length;
          // Rotation rules:
          // shop (1) -> store (2): soft cross-fade
          // store (2) -> factory (3): gentle upward slide + fade (translateY 8px -> 0)
          // factory (3) -> workshop (4): gentle downward slide + fade (translateY -8px -> 0)
          // workshop (4) -> business (0): soft cross-fade (opacity only)
          if (nextIndex === 3) {
            setTransitionType('slide-up');
          } else if (nextIndex === 4) {
            setTransitionType('slide-down');
          } else {
            setTransitionType('fade');
          }
          return nextIndex;
        });
        setIsTransitioning(false);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[1.08] max-w-5xl">
        Your business, one workspace.
      </h1>
    );
  }

  const currentWord = WORDS[index];

  let animationClasses = 'inline-block transition-all duration-300 ease-out';
  if (isTransitioning) {
    animationClasses += ' opacity-0';
    if (transitionType === 'slide-up') {
      animationClasses += ' translate-y-2';
    } else if (transitionType === 'slide-down') {
      animationClasses += ' -translate-y-2';
    }
  } else {
    animationClasses += ' opacity-100 translate-y-0';
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Screen reader static version */}
      <span className="sr-only">Your business, one workspace.</span>

      {/* Visual dynamic version */}
      <h1
        aria-hidden="true"
        className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[1.08] max-w-5xl"
      >
        <span>Your </span>
        <span className="inline-block relative text-left min-w-[4.4ch] sm:min-w-[4.6ch]">
          <span className={animationClasses}>
            {currentWord}
          </span>
        </span>
        <span>, one workspace.</span>
      </h1>
    </div>
  );
};
