import React, { useState, useMemo } from 'react';
import { SealData } from '../types';

interface Props {
  data: SealData[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

const PhaseGallery: React.FC<Props> = ({ data, onBack, onDelete }) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<SealData | null>(null);

  // Derive categories from data
  const categories = useMemo(() => {
    const cats = new Set(data.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [data]);

  const filteredData = useMemo(() => {
    let sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
    if (filter !== 'All') {
      sorted = sorted.filter(item => item.category === filter);
    }
    return sorted;
  }, [data, filter]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to let this memory fade?")) {
          onDelete(id);
          if (selectedItem?.id === id) {
              setSelectedItem(null);
          }
      }
  };

  const renderMedia = (base64: string) => {
    const mime = base64.split(';')[0].split(':')[1];
    const type = mime.split('/')[0];

    if (type === 'image') {
        return <img src={base64} alt="Original context" className="w-full h-auto rounded-md shadow-sm" />;
    } else if (type === 'video') {
        return <video src={base64} controls className="w-full max-h-64 rounded-md shadow-sm bg-black" />;
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
    <div className="w-full h-full flex flex-col animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-10">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-ink transition-colors font-sans text-xs tracking-widest uppercase flex items-center group"
        >
          <span className="group-hover:-translate-x-1 transition-transform mr-2">&larr;</span> Back
        </button>
        <h2 className="font-serif text-2xl text-ink tracking-wide">Hall of Echoes</h2>
        <div className="w-12"></div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-8 mb-8 overflow-x-auto scrollbar-hide pb-2 justify-center z-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-[10px] tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap
              ${filter === cat ? 'text-accent scale-110' : 'text-gray-300 hover:text-ink'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
          <p className="font-serif italic text-xl opacity-50">Silence is also an answer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pb-12 scrollbar-hide px-4">
          {filteredData.map(seal => (
            <div 
                key={seal.id} 
                onClick={() => setSelectedItem(seal)}
                className="group bg-white p-4 rounded-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Image Container */}
              <div className="w-full aspect-square mb-6 overflow-hidden rounded-full max-w-[180px] border-4 border-paper shadow-inner relative">
                 {seal.base64Image ? (
                    <img src={seal.base64Image} alt={seal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 text-3xl font-serif">?</div>
                 )}
                 <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500"></div>
              </div>

              {/* Text Info */}
              <span className="text-[9px] text-gray-300 uppercase tracking-widest mb-2">{new Date(seal.timestamp).toLocaleDateString()}</span>
              <h3 className="font-serif text-xl text-ink mb-2 group-hover:text-accent transition-colors">{seal.title}</h3>
              <p className="text-xs text-gray-400 font-sans line-clamp-2 leading-relaxed max-w-[80%]">
                 {seal.essence}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Modal Overlay */}
      {selectedItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-paper/95 backdrop-blur-sm transition-opacity"
             onClick={() => setSelectedItem(null)}
           ></div>

           {/* Modal Card */}
           <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-sm relative flex flex-col md:flex-row animate-slide-up border border-gray-100">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 text-gray-300 hover:text-ink transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Delete Button inside modal */}
              <button 
                onClick={(e) => handleDelete(e, selectedItem.id)}
                className="absolute top-4 left-4 z-10 text-gray-200 hover:text-red-400 transition-colors flex items-center space-x-1 text-xs uppercase tracking-widest"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <span>Fade</span>
              </button>

              {/* Left/Top: The Wisdom (Result) */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-white to-gray-50 border-b md:border-b-0 md:border-r border-gray-100">
                 <span className="text-[10px] tracking-[0.3em] uppercase text-accent mb-6">{selectedItem.category}</span>
                 
                 <div className="w-48 h-48 md:w-64 md:h-64 mb-8 rounded-full shadow-lg overflow-hidden border-4 border-white">
                    {selectedItem.base64Image && <img src={selectedItem.base64Image} alt={selectedItem.title} className="w-full h-full object-cover" />}
                 </div>

                 <h2 className="font-serif text-3xl md:text-4xl text-ink mb-4">{selectedItem.title}</h2>
                 <p className="font-sans text-sm text-gray-500 mb-6 max-w-xs">{selectedItem.essence}</p>
                 
                 <div className="mt-auto pt-6 border-t border-gray-200 w-full">
                    <p className="font-serif italic text-lg text-ink/80">"{selectedItem.actionPrinciple}"</p>
                 </div>
              </div>

              {/* Right/Bottom: The Seed (Origin) */}
              <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col">
                 <h4 className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-6 flex items-center">
                    <span className="w-2 h-2 bg-gray-200 rounded-full mr-2"></span>
                    The Seed
                 </h4>

                 <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                    {/* Original Media */}
                    {selectedItem.originalMedia && (
                        <div className="rounded-lg overflow-hidden border border-gray-100">
                            {renderMedia(selectedItem.originalMedia)}
                        </div>
                    )}

                    {/* Original Text */}
                    {selectedItem.originalText && (
                        <div className="font-serif text-xl md:text-2xl text-ink/70 leading-relaxed whitespace-pre-wrap">
                            {linkify(selectedItem.originalText)}
                        </div>
                    )}

                    {!selectedItem.originalText && !selectedItem.originalMedia && (
                        <p className="text-gray-300 italic">No artifact recorded.</p>
                    )}
                 </div>
                 
                 <div className="mt-8 text-right">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                        Recorded on {new Date(selectedItem.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PhaseGallery;