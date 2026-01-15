
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

export const Bot: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2L12 5M12 7c-4 0-7 3-7 7v5h14v-5c0-4-3-7-7-7z"></path>
    <rect x="9" y="14" width="6" height="3" rx="1"></rect>
    <circle cx="8" cy="10" r="1"></circle>
    <circle cx="16" cy="10" r="1"></circle>
  </svg>
);

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

export const Gear: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1-1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
