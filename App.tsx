import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { OutfitCard } from './components/OutfitCard';
import { EditModal } from './components/EditModal';
import { generateOutfitForStyle } from './services/geminiService';
import { OutfitStyle, OutfitResult, OutfitState } from './types';
import { Shirt, Sparkles } from 'lucide-react';

const INITIAL_STATE: OutfitState = {
  [OutfitStyle.CASUAL]: { id: '1', style: OutfitStyle.CASUAL, imageUrl: null, isLoading: false, error: null },
  [OutfitStyle.BUSINESS]: { id: '2', style: OutfitStyle.BUSINESS, imageUrl: null, isLoading: false, error: null },
  [OutfitStyle.NIGHT_OUT]: { id: '3', style: OutfitStyle.NIGHT_OUT, imageUrl: null, isLoading: false, error: null },
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [outfitState, setOutfitState] = useState<OutfitState>(INITIAL_STATE);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitResult | null>(null);

  const handleImageSelected = async (imageData: string) => {
    setOriginalImage(imageData);
    
    // Reset state for new generation
    const loadingState = { ...INITIAL_STATE };
    Object.keys(loadingState).forEach((key) => {
      loadingState[key as OutfitStyle].isLoading = true;
    });
    setOutfitState(loadingState);

    // Trigger generations in parallel
    const styles = [OutfitStyle.CASUAL, OutfitStyle.BUSINESS, OutfitStyle.NIGHT_OUT];
    
    // We don't await here because we want to update UI as they finish individually
    styles.forEach(style => generateStyle(imageData, style));
  };

  const generateStyle = async (imageData: string, style: OutfitStyle) => {
    setOutfitState(prev => ({
      ...prev,
      [style]: { ...prev[style], isLoading: true, error: null }
    }));

    try {
      const generatedImage = await generateOutfitForStyle(imageData, style);
      setOutfitState(prev => ({
        ...prev,
        [style]: { ...prev[style], imageUrl: generatedImage, isLoading: false }
      }));
    } catch (error) {
      setOutfitState(prev => ({
        ...prev,
        [style]: { ...prev[style], isLoading: false, error: "Failed to generate outfit. Try again." }
      }));
    }
  };

  const handleRetry = (style: OutfitStyle) => {
    if (originalImage) {
      generateStyle(originalImage, style);
    }
  };

  const handleUpdateOutfit = (updated: OutfitResult) => {
    setOutfitState(prev => ({
      ...prev,
      [updated.style]: updated
    }));
    setSelectedOutfit(updated);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">VirtualStylist<span className="text-indigo-600">.ai</span></span>
          </div>
          <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero / Upload Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            One Item. <span className="text-indigo-600">Three Looks.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            Don't know what to wear with that tricky piece? Upload a photo, and our AI stylist will create perfect outfits for every occasion.
          </p>
          
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
               {!originalImage ? (
                  <ImageUpload onImageSelected={handleImageSelected} />
               ) : (
                 <div className="flex flex-col items-center">
                   <div className="relative group">
                     <img 
                       src={originalImage} 
                       alt="Uploaded item" 
                       className="w-32 h-32 object-cover rounded-2xl shadow-lg border-4 border-white mb-6"
                     />
                     <button 
                       onClick={() => setOriginalImage(null)}
                       className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-200"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                   </div>
                   <button 
                      onClick={() => setOriginalImage(null)}
                      className="text-sm text-gray-500 hover:text-indigo-600 underline"
                   >
                     Upload a different item
                   </button>
                 </div>
               )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        {originalImage && (
          <section className="animate-fade-in-up">
             <div className="flex items-center gap-3 mb-8">
               <h2 className="text-2xl font-bold text-gray-900">Your Curated Collection</h2>
               <div className="h-px bg-gray-200 flex-grow"></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <OutfitCard 
                 result={outfitState[OutfitStyle.CASUAL]} 
                 onSelect={setSelectedOutfit} 
                 onRetry={handleRetry}
               />
               <OutfitCard 
                 result={outfitState[OutfitStyle.BUSINESS]} 
                 onSelect={setSelectedOutfit} 
                 onRetry={handleRetry}
               />
               <OutfitCard 
                 result={outfitState[OutfitStyle.NIGHT_OUT]} 
                 onSelect={setSelectedOutfit} 
                 onRetry={handleRetry}
               />
             </div>
          </section>
        )}

      </main>

      {/* Editor Modal */}
      {selectedOutfit && (
        <EditModal 
          outfit={selectedOutfit} 
          onClose={() => setSelectedOutfit(null)} 
          onUpdate={handleUpdateOutfit}
        />
      )}
    </div>
  );
}
