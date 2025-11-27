import React, { useState, useEffect } from 'react';
import { OutfitResult } from '../types';
import { X, Sparkles, Download, ArrowRight, Palette } from 'lucide-react';
import { editOutfitImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface EditModalProps {
  outfit: OutfitResult;
  onClose: () => void;
  onUpdate: (updatedOutfit: OutfitResult) => void;
}

const COLOR_THEMES = [
  { label: 'Warm', value: 'warm tones (red, orange, yellow)', class: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  { label: 'Cool', value: 'cool tones (blue, green, purple)', class: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Monochrome', value: 'monochromatic black and white', class: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { label: 'Earthy', value: 'earth tones (brown, beige, olive)', class: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { label: 'Pastel', value: 'soft pastel colors', class: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { label: 'Vibrant', value: 'vibrant, bold colors', class: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
];

export const EditModal: React.FC<EditModalProps> = ({ outfit, onClose, onUpdate }) => {
  const [image, setImage] = useState<string | null>(outfit.imageUrl);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImage(outfit.imageUrl);
    setPrompt('');
    setError(null);
  }, [outfit]);

  const handleEdit = async () => {
    if (!prompt.trim() || !image) return;

    setIsProcessing(true);
    setError(null);

    try {
      const newImage = await editOutfitImage(image, prompt);
      setImage(newImage);
      // We don't necessarily update the parent immediately unless we want to "save" it there.
      // For this flow, let's update local state to allow iterative edits.
      onUpdate({ ...outfit, imageUrl: newImage });
    } catch (err: any) {
      // Display the actual error message from the service (which might be the model's refusal reason)
      setError(err.message || "Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
      setPrompt(''); // Clear prompt after success
    }
  };

  const handleDownload = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = `virtual-stylist-${outfit.style.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!outfit.imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{outfit.style} Look</h2>
            <p className="text-sm text-gray-500">AI Generated Flat Lay</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Image Area */}
          <div className="relative flex-grow bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                 <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                    <LoadingSpinner />
                    <span className="font-medium text-gray-700">Applying changes...</span>
                 </div>
              </div>
            )}
            <img 
              src={image || ''} 
              alt="Current Design" 
              className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
            />
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-80 bg-white border-l border-gray-100 flex flex-col p-6 z-20">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Refine Result
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Ask the AI to adjust colors, add accessories, or apply filters.
              </p>
              
              {/* Color Palette Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Quick Color Themes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.label}
                      onClick={() => setPrompt(`Change the color palette to ${theme.value}`)}
                      className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-all hover:scale-105 ${theme.class}`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 'Add a retro filter' or 'Swap the shoes for sneakers'"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
                />
                <button
                  onClick={handleEdit}
                  disabled={!prompt.trim() || isProcessing}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Apply Changes <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
               <button
                onClick={handleDownload}
                className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
               >
                 <Download className="w-4 h-4" /> Download Image
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};