import React, { useCallback } from 'react';
import { UploadCloud, X } from './Icons';
import Button from './Button';

interface FileUploadProps {
  label: string;
  onFileChange: (file: File | null) => void;
  preview?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileChange, preview, disabled }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [onFileChange]);
  
  const handleClear = () => {
      onFileChange(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <div className="mt-1 flex justify-center p-6 border-2 border-[var(--border-primary)] border-dashed rounded-md bg-[var(--bg-input)] hover:border-[var(--accent-primary)] transition-colors group">
        {preview ? (
          <div className="relative">
             <img src={preview} alt="Preview" className="max-h-40 rounded-md" />
             <button onClick={handleClear} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-500 shadow-lg border-2 border-[var(--bg-secondary)]" aria-label="Remove image">
                <X className="h-4 w-4" />
             </button>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
            <div className="flex text-sm text-[var(--text-secondary)]">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-[var(--bg-secondary)] rounded-md font-medium text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] px-2"
              >
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={disabled} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;