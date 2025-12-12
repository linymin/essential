import React, { useState } from 'react';
import { SealData } from '../types';

interface Props {
  data: SealData;
  onRestart: () => void;
}

const PhaseSeal: React.FC<Props> = ({ data, onRestart }) => {
  const [showOrigin, setShowOrigin] = useState(false);

  const renderMedia = (base64: string) => {
    const mime = base64.split(';')[0].split(':')[1];
    const type = mime.split('/')[0];

    if (type === 'image') {
        return <img src={base64} alt="Origin" className="w-full h-auto rounded shadow-sm opacity-80" />;
    } else if (type === 'video') {
        return <video src={base64} controls className="w-full max-h-48 rounded shadow-sm bg-black" />;
    } else if (type === 'audio') {
        return <audio src={base64} controls className="w-full mt-2" />;
    }
    return null;
  };

  const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => 
        urlRegex.test(part) ? 
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{part}</a> : 
        part
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md animate-fade-in pb-12">
      {/* The Card */}
      <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border border-gray-100 w-full flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/80"></div>

        <span className="text-xs font-sans tracking-[0.3em] text-gray-400 uppercase mb-8">
          Wisdom Totem • {data.category}
        </span>

        {/* Visual Totem */}
        <div className="w-48 h-48 md:w-64 md:h-64 mb-8 bg-paper flex items-center justify-center overflow-hidden rounded-full shadow-inner border border-gray-50 relative group">
          {data.base64Image ? (
             <img src={data.base64Image} alt="Wisdom Totem" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
          ) : (
             <div className="text-gray-200 text-6xl font-serif">?</div>
          )}
          {/* Overlay gradient for mood */}
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Content */}
        <h2 className="font-serif text-3xl md:text-4xl text-ink mb-4 leading-tight">
          {data.title}
        </h2>
        
        <div className="w-12 h-[1px] bg-accent mb-6"></div>

        <p className="font-sans text-sm md:text-base text-gray-600 mb-8 leading-relaxed max-w-xs mx-auto">
          {data.essence}
        </p>

        {/* Action Principle Box */}
        <div className="bg-paper px-6 py-4 border border-gray-100 w-full">
            <h3 className="text-[10px] uppercase tracking-widest text-accent mb-2">Daily Action</h3>
            <p className="font-serif text-lg italic text-ink">
                "{data.actionPrinciple}"
            </p>
        </div>
        
        {/* Origin Toggle */}
        {(data.originalText || data.originalMedia) && (
            <button 
                onClick={() => setShowOrigin(!showOrigin)}
                className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest hover:text-accent transition-colors flex items-center space-x-1"
            >
                <span>{showOrigin ? 'Hide Origin' : 'View Origin'}</span>
                <span className={`transform transition-transform ${showOrigin ? 'rotate-180' : ''}`}>▼</span>
            </button>
        )}

        {/* Origin Content (Collapsible) */}
        {showOrigin && (data.originalText || data.originalMedia) && (
            <div className="mt-4 w-full bg-gray-50 p-4 rounded text-left animate-slide-up border border-gray-100">
                 {data.originalMedia && (
                    <div className="mb-4">
                        {renderMedia(data.originalMedia)}
                    </div>
                 )}
                 {data.originalText && (
                    <p className="font-serif text-ink/70 text-sm whitespace-pre-wrap leading-relaxed">
                        {linkify(data.originalText)}
                    </p>
                 )}
            </div>
        )}

        {/* Footer Date */}
        <div className="mt-8 text-[10px] text-gray-300 font-sans tracking-widest">
            {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="mt-12 text-gray-400 hover:text-ink transition-colors font-sans text-xs tracking-widest uppercase"
      >
        Home
      </button>
    </div>
  );
};

export default PhaseSeal;