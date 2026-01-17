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
      <label className="block text-[10px] font-mono font-black uppercase tracking-[0.2em] text-heavy-yellow mb-2">&gt; {label}</label>
      <div className="mt-1 flex justify-center p-6 border-2 border-industrial-gray border-dashed bg-asphalt/50 hover:border-heavy-yellow transition-colors group">
        {preview ? (
          <div className="relative p-2 bg-black/50">
             <img src={preview} alt="Preview" className="max-h-40" />
             <button onClick={handleClear} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-500 shadow-lg border-2 border-black">
                <XIcon className="h-4 w-4" />
             </button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-industrial-gray group-hover:text-heavy-yellow transition-colors" />
            <div className="flex flex-col items-center gap-2 text-sm text-text-muted">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-industrial-gray/50 px-4 py-2 text-text-light font-bold uppercase tracking-wider hover:bg-industrial-gray border border-industrial-gray"
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