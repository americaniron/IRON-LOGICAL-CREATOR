
import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const MessageSquare: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <path d="M21 15v4a2 2 0 0 1-2 2H5l-3 3V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
    <line x1="7" y1="8" x2="17" y2="8"></line>
    <line x1="7" y1="12" x2="17" y2="12"></line>
  </svg>
);

export const Image: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="1" strokeWidth="3"></rect>
    <circle cx="9" cy="9" r="2"></circle>
    <path d="M21 15l-5-5L5 21"></path>
    <path d="M12 2v2"></path><path d="M12 20v2"></path>
  </svg>
);

export const Video: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M23 7l-7 5 7 5V7z" strokeLinejoin="round"></path>
    <rect x="1" y="5" width="15" height="14" rx="0" strokeWidth="3"></rect>
    <circle cx="8" cy="12" r="2"></circle>
  </svg>
);

export const Film: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="4" y="2" width="16" height="20" rx="1" strokeWidth="3"></rect>
    <line x1="4" y1="7" x2="20" y2="7"></line>
    <line x1="4" y1="17" x2="20" y2="17"></line>
    <path d="M9 2v20"></path><path d="M15 2v20"></path>
  </svg>
);

export const Speaker: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"></path>
    <path d="M15 8.5c1.5 1.5 1.5 4.5 0 6"></path>
    <path d="M18 5c3 3 3 11 0 14"></path>
  </svg>
);

export const Microphone: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="1" width="6" height="12" rx="3" strokeWidth="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

export const Send: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
  </svg>
);

export const User: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4" strokeWidth="3"></circle>
  </svg>
);

export const IndustrialBot: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="5" y="8" width="14" height="12" rx="2" strokeWidth="3"></rect>
        <path d="M9 8V5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v3"></path>
        <circle cx="12" cy="14" r="2"></circle>
        <line x1="12" y1="2" x2="12" y2="3"></line>
    </svg>
);

export const Bot: React.FC<IconProps> = IndustrialBot;


export const UploadCloud: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M16 16l-4-4-4 4M12 12v9"></path>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
  </svg>
);

export const X: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const Crane: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M3 21h18M6 21V3l12 3v3h-3v12"></path>
    <path d="M15 6h4l2 3"></path>
    <circle cx="18" cy="12" r="2"></circle>
  </svg>
);

export const Bulldozer: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M2 17h20M4 17V7l10-1v11M14 6h4l4 4v7H14"></path>
    <circle cx="7" cy="17" r="2"></circle>
    <circle cx="12" cy="17" r="2"></circle>
    <circle cx="17" cy="17" r="2"></circle>
    <path d="M2 13h4M18 13h4M2 10h3"></path>
  </svg>
);

export const Gear: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1-1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export const Play: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const Pause: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const Menu: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

export const Download: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export const BrainCircuit: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"></path>
      <path d="M12 13v1M15 11v1M9 11v1M12 7V6"></path>
      <path d="M5 10H4M19 10h1M12 18v1"></path>
    </svg>
  );
  
export const XIcon: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

export const Maximize: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);
