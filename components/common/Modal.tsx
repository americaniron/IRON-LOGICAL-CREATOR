import React, { useEffect, useRef } from 'react';
import { X } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl bg-[var(--bg-secondary)] border-4 border-[var(--border-primary)] shadow-[0_0_60px_rgba(0,0,0,0.9)] relative animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--accent-primary)] p-4 border-b-4 border-black flex justify-between items-center">
            <h2 id="modal-title" className="text-xl font-['Black_Ops_One'] text-black tracking-widest uppercase">
                {title}
            </h2>
            <button
                onClick={onClose}
                className="p-2 bg-black/20 text-black hover:bg-black/40 transition-colors"
                aria-label="Close dialog"
            >
                <X className="h-6 w-6" />
            </button>
        </div>
        <div className="p-6 sm:p-8">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;