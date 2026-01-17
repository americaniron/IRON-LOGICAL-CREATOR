import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Import all providers
import { AuthProvider } from './contexts/AuthProvider';
import { ConfigProvider } from './contexts/ConfigProvider';
import { SystemStatusProvider } from './contexts/SystemStatusProvider';
import { AssetProvider } from './contexts/AssetProvider';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
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

    // After React mounts, remove the boot screen for a smooth transition.
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen) {
      console.log("[SYS_BOOT] React mount successful. Engaging UI...");
      setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => bootScreen.remove(), 800);
      }, 100); 
    }
  } catch (error) {
    console.error("FATAL: Failed to render React application.", error);
    // Render a simple fallback error if React fails to mount.
    container.innerHTML = `
      <div style="color: red; padding: 40px; text-align: center; font-family: monospace;">
        <h1>KERNEL_PANIC</h1>
        <p>A critical error occurred while initializing the component tree.</p>
        <pre style="text-align: left; background: #333; padding: 20px; margin-top: 20px;">${error instanceof Error ? error.stack : 'Unknown Error'}</pre>
      </div>
    `;
  }
} else {
  console.error("FATAL: Target root container '#root' missing from DOM.");
}