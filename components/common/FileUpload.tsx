
import React, { useCallback } from 'react';
import { UploadCloud, X } from './Icons';

interface FileUploadProps {
  label: string;
  onFileChange: (file: File | null) => void;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileChange, preview }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  }, [onFileChange]);
  
  const handleClear = () => {
      onFileChange(null);
  }

  return (
    <div className="relative">
      <div className="rivet absolute -top-1 -right-1"></div>
      <label className="block text-xs font-black uppercase tracking-widest text-[#EBB700] mb-2 font-mono">// {label} _</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-4 border-[#3F4042] border-dashed bg-black/40 hover:bg-black/60 transition-colors group">
        {preview ? (
          <div className="relative border-2 border-[#EBB700] p-2 bg-black shadow-2xl">
             <img src={preview} alt="Preview" className="max-h-48 grayscale hover:grayscale-0 transition-all" />
             <button onClick={handleClear} className="absolute -top-3 -right-3 bg-red-600 rounded-none p-1 text-white hover:bg-red-500 shadow-lg border border-black">
                <X className="h-5 w-5" />
             </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <UploadCloud className="mx-auto h-16 w-16 text-gray-700 group-hover:text-[#EBB700] transition-colors" />
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-[#2D2E30] px-4 py-2 text-white font-black uppercase tracking-wider hover:bg-[#3F4042] border border-[#3F4042]"
              >
                <span>OPEN CARGO</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
              </label>
              <p className="font-mono text-[10px]">DROP ASSET INTO BAY</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
