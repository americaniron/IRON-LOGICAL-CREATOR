
import React, { useCallback } from 'react';
import { UploadCloud, XIcon } from './Icons';

interface FileUploadProps {
  label: string;
  onFileChange: (file: File | null) => void;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileChange, preview }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
    event.target.value = ''; // Allow re-uploading the same file
  }, [onFileChange]);
  
  const handleClear = () => {
      onFileChange(null);
  }

  return (
    <div className="relative">
      <label className="block text-xs font-heading uppercase tracking-widest text-aura-cyan mb-2">{label}</label>
      <div className="mt-1 flex justify-center p-6 border-2 border-aura-mauve border-dashed rounded-md bg-aura-indigo/50 hover:border-aura-violet transition-colors group">
        {preview ? (
          <div className="relative p-2 bg-black/50 rounded-md">
             <img src={preview} alt="Preview" className="max-h-40" />
             <button onClick={handleClear} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-500 shadow-lg">
                <XIcon className="h-4 w-4" />
             </button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-aura-mauve group-hover:text-aura-violet transition-colors" />
            <div className="flex flex-col items-center gap-2 text-sm text-aura-gray">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-aura-mauve/50 px-4 py-2 text-aura-light font-bold uppercase tracking-wider hover:bg-aura-mauve rounded-md border border-aura-mauve"
              >
                <span>Select File</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
              </label>
              <p className="font-body text-xs">or drag and drop</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
