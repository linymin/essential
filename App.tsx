import React, { useState, useCallback, useEffect } from 'react';
import { AppPhase, Message, SealData } from './types';
import PhaseIntro from './components/PhaseIntro';
import PhaseInput from './components/PhaseInput';
import PhaseChat from './components/PhaseChat';
import PhaseSeal from './components/PhaseSeal';
import PhaseGallery from './components/PhaseGallery';

const STORAGE_KEY = 'essence_gallery_data';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.INTRO);
  const [initialInput, setInitialInput] = useState<string>('');
  const [initialMedia, setInitialMedia] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sealData, setSealData] = useState<SealData | null>(null);
  const [gallery, setGallery] = useState<SealData[]>([]);

  // Load gallery from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setGallery(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load gallery", e);
    }
  }, []);

  const startJourney = useCallback(() => {
    setPhase(AppPhase.INPUT);
  }, []);

  const openGallery = useCallback(() => {
    setPhase(AppPhase.GALLERY);
  }, []);

  const handleInputSubmit = useCallback((text: string, media?: string) => {
    setInitialInput(text);
    setInitialMedia(media);
    setPhase(AppPhase.DIAGNOSIS_AND_CHAT);
  }, []);

  const handleSealCreated = useCallback((partialData: Omit<SealData, 'id' | 'timestamp' | 'originalText' | 'originalMedia'>) => {
    // Robust ID generation that works in all contexts
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const newData: SealData = {
      ...partialData,
      id: generateId(),
      timestamp: Date.now(),
      originalText: initialInput,
      originalMedia: initialMedia,
    };
    
    setSealData(newData);
    
    // Persist immediately
    setGallery(prev => {
      const updated = [newData, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setPhase(AppPhase.CRYSTALLIZATION);
  }, [initialInput, initialMedia]);

  const handleDeleteGalleryItem = useCallback((id: string) => {
      setGallery(prev => {
          const updated = prev.filter(item => item.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
      });
  }, []);

  const resetApp = useCallback(() => {
    setMessages([]);
    setInitialInput('');
    setInitialMedia(undefined);
    setSealData(null);
    setPhase(AppPhase.INTRO);
  }, []);

  return (
    <div className="min-h-screen w-full bg-paper text-ink font-sans selection:bg-accent selection:text-white overflow-hidden relative">
      <main className="h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative max-w-4xl mx-auto">
        
        {phase === AppPhase.INTRO && (
          <PhaseIntro onStart={startJourney} onOpenGallery={openGallery} />
        )}

        {phase === AppPhase.GALLERY && (
          <PhaseGallery 
            data={gallery} 
            onBack={() => setPhase(AppPhase.INTRO)} 
            onDelete={handleDeleteGalleryItem}
          />
        )}

        {phase === AppPhase.INPUT && (
          <PhaseInput onSubmit={handleInputSubmit} />
        )}

        {phase === AppPhase.DIAGNOSIS_AND_CHAT && (
          <PhaseChat 
            initialInput={initialInput}
            initialMedia={initialMedia}
            onCrystallize={handleSealCreated}
          />
        )}

        {phase === AppPhase.CRYSTALLIZATION && sealData && (
          <PhaseSeal 
            data={sealData} 
            onRestart={resetApp} 
          />
        )}

      </main>
    </div>
  );
};

export default App;