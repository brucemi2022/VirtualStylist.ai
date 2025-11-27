import React from 'react';
import { OutfitStyle, OutfitResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { Maximize2, RefreshCw } from 'lucide-react';

interface OutfitCardProps {
  result: OutfitResult;
  onSelect: (result: OutfitResult) => void;
  onRetry: (style: OutfitStyle) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ result, onSelect, onRetry }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">{result.style}</h3>
        {result.isLoading && <span className="text-xs text-indigo-500 font-medium animate-pulse">Designing...</span>}
      </div>

      <div className="relative flex-grow min-h-[300px] bg-gray-50 group">
        {result.isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <LoadingSpinner />
            <p className="mt-4 text-sm">AI Stylist is working...</p>
          </div>
        ) : result.error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-red-500 text-sm mb-4">{result.error}</p>
            <button
              onClick={() => onRetry(result.style)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : result.imageUrl ? (
          <>
            <img
              src={result.imageUrl}
              alt={`${result.style} Outfit`}
              className="w-full h-full object-cover"
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onSelect(result)}
                className="transform scale-90 group-hover:scale-100 transition-all px-6 py-3 bg-white text-gray-900 rounded-full font-medium shadow-lg hover:bg-indigo-50 flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> View & Edit
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
