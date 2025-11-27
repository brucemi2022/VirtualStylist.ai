import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (imageData: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
          ${dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300 bg-white hover:bg-gray-50 hover:border-indigo-400"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-50'}`}>
              <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`} />
            </div>
            <p className="mb-2 text-sm text-gray-500 font-medium">
              <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG or JPEG (max. 10MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4">
           <ImageIcon className="w-5 h-5 text-gray-200" />
        </div>
      </div>
    </div>
  );
};
