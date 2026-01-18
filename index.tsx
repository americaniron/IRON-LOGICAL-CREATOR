
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('IRON MEDIA ORCHESTRATOR :: SYSTEM BOOT SEQUENCE INITIATED');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('IRON MEDIA ORCHESTRATOR :: CRITICAL ERROR - ROOT ELEMENT MISSING');
  throw new Error("Could not find root element to mount to");
}

console.log('IRON MEDIA ORCHESTRATOR :: DOM ROOT DETECTED');

try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('IRON MEDIA ORCHESTRATOR :: MOUNTING REACT APPLICATION...');
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('IRON MEDIA ORCHESTRATOR :: RENDER CYCLE INITIATED');
} catch (e) {
    console.error('IRON MEDIA ORCHESTRATOR :: STARTUP FAILURE', e);
}
