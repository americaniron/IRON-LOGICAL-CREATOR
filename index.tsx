import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const bootstrap = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("CRITICAL_BOOT_FAULT: Root container element missing.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("SYSTEM_REPORT: BOOT_SEQUENCE_COMPLETE. INTERFACE_NOMINAL.");
  } catch (err) {
    console.error("SYSTEM_REPORT: CORE_FABRICATION_CRASH.", err);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0d0e11; font-family: 'Roboto Mono', monospace; color: #ef4444; padding: 2rem; text-align: center;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">!! CRITICAL_CORE_FAULT !!</h1>
        <p style="margin-bottom: 2rem;">MODULE_FABRICATION_FAILURE: CHECK_TELEMETRY_LOGS</p>
        <button onclick="window.location.reload()" style="background: #ef4444; color: white; border: none; padding: 1rem 2rem; font-family: inherit; cursor: pointer; text-transform: uppercase; font-weight: bold;">Re-Initialize_System</button>
      </div>
    `;
  }
};

// Execute boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}