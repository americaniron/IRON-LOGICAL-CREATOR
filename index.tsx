import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Import all providers
import { AuthProvider } from './contexts/AuthProvider';
import { ConfigProvider } from './contexts/ConfigProvider';
import { SystemStatusProvider } from './contexts/SystemStatusProvider';
import { AssetProvider } from './contexts/AssetProvider';

console.log("BOOT: Module index.tsx entered execution.");

const bootstrap = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("BOOT_CRITICAL: root element not found.");
    return;
  }

  console.log("BOOT: React root container identified.");
  const root = createRoot(rootElement);

  // Failsafe: Remove boot screen after 2.5 seconds regardless of React rendering status
  const removeBootScreen = () => {
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen) {
      console.log("BOOT: Hiding boot overlay.");
      bootScreen.style.opacity = '0';
      setTimeout(() => { 
        if (bootScreen && bootScreen.parentNode) {
          bootScreen.style.display = 'none'; 
        }
      }, 500);
    }
  };

  setTimeout(removeBootScreen, 2500);

  console.log("BOOT: Rendering React tree.");
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <ConfigProvider>
            <SystemStatusProvider>
              <AuthProvider>
                <AssetProvider>
                  <App />
                </AssetProvider>
              </AuthProvider>
            </SystemStatusProvider>
          </ConfigProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("BOOT: React tree mounting initiated.");
  } catch (err) {
    console.error("BOOT_FATAL: Application failed to render.", err);
  }
};

// Initiate bootstrap sequence
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}