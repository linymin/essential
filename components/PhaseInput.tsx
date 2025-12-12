import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onSubmit: (text: string, media?: string) => void;
}

const PhaseInput: React.FC<Props> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim().length > 0 || selectedMedia) {
      onSubmit(text, selectedMedia || undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent submission if using IME (e.g. Chinese Pinyin)
      if ((e.nativeEvent as any).isComposing) return;
      
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.split('/')[0]; // 'image', 'video', 'audio'
      if (type === 'image' || type === 'video' || type === 'audio') {
          setMediaType(type as any);
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedMedia(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
    }
  };

  const clearMedia = () => {
      setSelectedMedia(null);
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="w-full max-w-2xl animate-slide-up flex flex-col items-center">
      <div className="w-full relative flex flex-col items-center">
        
        {/* Media Preview */}
        {selectedMedia && (
          <div className="mb-8 relative group w-full flex justify-center">
            {mediaType === 'image' && (
                <img src={selectedMedia} alt="Preview" className="max-h-64 rounded-lg shadow-md object-contain" />
            )}
            {mediaType === 'video' && (
                <video src={selectedMedia} controls className="max-h-64 rounded-lg shadow-md bg-black" />
            )}
            {mediaType === 'audio' && (
                <div className="w-full max-w-md bg-white p-4 rounded-full shadow-md flex items-center justify-center">
                    <audio src={selectedMedia} controls className="w-full" />
                </div>
            )}
            
            <button 
                onClick={clearMedia}
                className="absolute -top-2 -right-2 bg-ink text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste a link, a thought, or a paragraph here..."
          className="w-full bg-transparent text-xl md:text-3xl font-serif text-ink placeholder-gray-300 border-none outline-none resize-none text-center leading-relaxed"
          rows={1}
          autoFocus
        />
        
        {/* Underline animation */}
        <div className={`h-[1px] bg-gray-200 w-full mt-4 transition-all duration-700 ${text.length > 0 || selectedMedia ? 'bg-accent/50' : ''}`} />
        
        {/* Tools */}
        <div className="mt-4 flex items-center space-x-4">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-accent transition-colors flex items-center space-x-2"
                title="Upload media"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
             </button>
             <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
             />
        </div>

      </div>

      <div className={`mt-12 transition-opacity duration-700 ${text.length > 0 || selectedMedia ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handleSubmit}
          className="text-gray-400 hover:text-accent transition-colors duration-300 font-sans text-sm tracking-widest uppercase"
        >
          Diagnose Intent &rarr;
        </button>
      </div>
    </div>
  );
};

export default PhaseInput;