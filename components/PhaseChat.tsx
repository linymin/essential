import React, { useEffect, useState, useRef } from 'react';
import { Message, Sender, SealData } from '../types';
import { startDiagnosisChat, sendMessage, generateSealData, generateTotemImage } from '../geminiService';

interface Props {
  initialInput: string;
  initialMedia?: string;
  onCrystallize: (data: Omit<SealData, 'id' | 'timestamp'>) => void;
}

const PhaseChat: React.FC<Props> = ({ initialInput, initialMedia, onCrystallize }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSealing, setIsSealing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    let mounted = true;
    
    const initChat = async () => {
      // Design choice: Show the input as the first user bubble.
      const firstUserMsg: Message = {
        id: '1',
        text: initialInput,
        media: initialMedia,
        sender: Sender.USER,
        timestamp: Date.now()
      };
      
      if (mounted) setMessages([firstUserMsg]);

      const aiResponseText = await startDiagnosisChat(initialInput, initialMedia);
      
      if (mounted) {
        const firstAiMsg: Message = {
          id: '2',
          text: aiResponseText,
          sender: Sender.AI,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, firstAiMsg]);
        setIsLoading(false);
      }
    };

    initChat();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; // Cap height
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedMedia) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      media: selectedMedia || undefined,
      sender: Sender.USER,
      timestamp: Date.now()
    };

    // Update UI immediately
    setMessages(prev => [...prev, newMsg]);
    const currentInputText = inputText;
    const currentInputMedia = selectedMedia || undefined;

    // Reset input
    setInputText('');
    setSelectedMedia(null);
    setMediaType(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    setIsLoading(true);

    // FIX: Pass 'messages' (current state before update) to avoid duplicating the new message in history.
    // sendMessage appends the new content itself.
    const reply = await sendMessage(messages, currentInputText, currentInputMedia);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: reply,
      sender: Sender.AI,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent sending if using IME (e.g. Pinyin)
        if ((e.nativeEvent as any).isComposing) return;

        e.preventDefault();
        handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.split('/')[0];
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
      if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleCrystallize = async () => {
    setIsSealing(true);
    try {
        const data = await generateSealData(messages);
        
        if (data.visualPrompt) {
            const imageBase64 = await generateTotemImage(data.visualPrompt);
            if (imageBase64) {
                // @ts-ignore
                data.base64Image = imageBase64;
            }
        }
        
        onCrystallize(data);
    } catch (e) {
        console.error("Crystallization failed", e);
        setIsSealing(false); // Reset on error so user can try again
    }
  };

  const renderMedia = (base64: string) => {
    // Determine type from base64 header if possible, or use simple heuristics if needed
    // The format is data:[mime];base64,
    const mime = base64.split(';')[0].split(':')[1];
    const type = mime.split('/')[0];

    if (type === 'image') {
        return <img src={base64} alt="User upload" className="w-full h-auto" />;
    } else if (type === 'video') {
        return <video src={base64} controls className="w-full h-auto max-h-[300px] bg-black" />;
    } else if (type === 'audio') {
        return <audio src={base64} controls className="w-full mt-1" />;
    }
    return null;
  };

  if (isSealing) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-pulse space-y-4">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif text-lg text-ink/70 italic">Distilling essence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-2xl animate-fade-in relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}
          >
            {/* Media Bubble */}
            {msg.media && (
                <div className={`mb-2 max-w-[85%] md:max-w-[70%] rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-white p-1 ${msg.sender === Sender.USER ? 'rounded-tr-sm' : ''}`}>
                    {renderMedia(msg.media)}
                </div>
            )}
            
            {/* Text Bubble */}
            {(msg.text || !msg.media) && msg.text && (
                <div 
                className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-lg leading-relaxed shadow-sm
                ${msg.sender === Sender.USER 
                    ? 'bg-white text-ink rounded-tr-sm border border-gray-100' 
                    : 'bg-transparent text-ink font-serif italic text-xl md:text-2xl border-l-2 border-accent/30 pl-6 rounded-none shadow-none'
                }`}
                >
                {msg.text}
                </div>
            )}
            
            <span className="text-xs text-gray-300 mt-2 px-1">
              {msg.sender === Sender.AI ? 'Essence' : 'You'}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex space-x-2 pl-6 py-4">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 pt-4 pb-2 bg-gradient-to-t from-paper to-transparent">
        
        {/* Preview in Chat Input */}
        {selectedMedia && (
            <div className="mb-2 mx-4 inline-block relative bg-white p-1 rounded border border-gray-200 shadow-sm">
                {mediaType === 'image' && <img src={selectedMedia} alt="Preview" className="h-16 rounded object-cover" />}
                {mediaType === 'video' && <video src={selectedMedia} className="h-16 rounded bg-black" />}
                {mediaType === 'audio' && <div className="h-16 w-32 flex items-center justify-center bg-gray-50 text-xs text-gray-500">Audio</div>}
                
                <button 
                    onClick={clearMedia}
                    className="absolute -top-2 -right-2 bg-ink text-white rounded-full p-0.5 shadow-md z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}

        <div className="flex items-end space-x-2 bg-white border border-gray-200 rounded-[26px] px-2 py-2 shadow-sm focus-within:ring-1 focus-within:ring-accent transition-shadow">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-ink transition-colors mb-0.5"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
             </svg>
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reflection..."
            className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-ink placeholder-gray-400 resize-none overflow-hidden max-h-32 leading-relaxed"
            rows={1}
            disabled={isLoading}
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedMedia) || isLoading}
            className="p-2 rounded-full bg-ink text-white hover:bg-accent disabled:opacity-30 transition-colors mb-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>

        {/* Crystallize Button - Only shows after a few exchanges */}
        {messages.length > 2 && !isLoading && (
          <div className="flex justify-center mt-4">
            <button 
              onClick={handleCrystallize}
              className="text-xs tracking-[0.2em] text-accent uppercase hover:text-ink transition-colors border-b border-transparent hover:border-ink pb-1"
            >
              Crystallize &amp; Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseChat;