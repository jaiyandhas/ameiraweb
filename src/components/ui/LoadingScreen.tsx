import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'loading ameira...' }) => {
  return (
    <div className="fixed inset-0 bg-zinc-50 flex flex-col items-center justify-center z-50 font-sans">
      <div className="relative flex items-center justify-center mb-6">
        {/* Subtle spinning ring around the logo */}
        <div className="absolute h-24 w-24 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
        
        {/* Prominent Logo */}
        <img 
          src="/ameiralogo.png" 
          alt="Ameira Logo" 
          className="h-14 w-auto object-contain relative z-10"
        />
      </div>

      {/* "ameira" in lowercase small text */}
      <span className="text-sm font-medium text-zinc-500 tracking-wider lowercase">
        {message}
      </span>
    </div>
  );
};
