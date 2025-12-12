import React from 'react';

interface Props {
  onStart: () => void;
  onOpenGallery: () => void;
}

const PhaseIntro: React.FC<Props> = ({ onStart, onOpenGallery }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in space-y-12 relative w-full h-full justify-center">
      
      {/* Top Right Gallery Link */}
      <button 
        onClick={onOpenGallery}
        className="absolute top-0 right-0 p-4 text-xs text-gray-300 hover:text-ink uppercase tracking-widest transition-colors"
      >
        History
      </button>

      <div className="flex flex-col items-center space-y-8">
        <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide leading-tight text-ink/90">
          Today,<br />
          what is the <span className="italic text-accent">one thing</span><br />
          you decide to keep?
        </h1>
        
        <p className="text-sm md:text-base text-gray-400 tracking-widest uppercase opacity-80 max-w-xs">
          Data • Information • Knowledge • Wisdom
        </p>

        <button 
          onClick={onStart}
          className="group relative px-8 py-3 overflow-hidden rounded-full bg-transparent border border-ink/20 hover:border-accent transition-colors duration-500 ease-out"
        >
          <span className="absolute inset-0 w-full h-full bg-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500"></span>
          <span className="relative text-sm font-medium tracking-widest text-ink group-hover:text-accent transition-colors duration-300">
            BEGIN
          </span>
        </button>
      </div>
    </div>
  );
};

export default PhaseIntro;