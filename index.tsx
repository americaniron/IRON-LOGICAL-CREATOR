import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Import all providers
import { AuthProvider } from './contexts/AuthProvider';
import { ConfigProvider } from './contexts/ConfigProvider';
import { SystemStatusProvider } from './contexts/SystemStatusProvider';
import { AssetProvider } from './contexts/AssetProvider';

// --- SYSTEM BOOT LOGGER ---
const logBoot = (msg: string, type: 'info' | 'error' | 'warn' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const prefix = `[SYS_BOOT_${timestamp}]`;
    switch(type) {
        case 'error': console.error(`%c${prefix} CRITICAL: ${msg}`, 'color: #ef4444; font-weight: bold;'); break;
        case 'warn': console.warn(`%c${prefix} WARN: ${msg}`, 'color: #f59e0b; font-weight: bold;'); break;
        default: console.log(`%c${prefix} ${msg}`, 'color: #06b6d4;');
    }
};

const BOOT_SCREEN_ID = 'boot-screen';
const ROOT_ID = 'root';

// --- CINEMATIC ERROR RENDERER ---
// Renders a pure HTML/CSS error screen if React fails to mount or modules fail to load
const renderFatalError = (err: unknown) => {
    const root = document.getElementById(ROOT_ID);
    if (root) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : 'No stack trace available.';
        
        root.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
                body { margin: 0; background: #000; overflow: hidden; }
                .fatal-err-container {
                    height: 100vh;
                    width: 100vw;
                    background-color: #030305;
                    background-image: 
                        linear-gradient(rgba(239, 68, 68, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(239, 68, 68, 0.05) 1px, transparent 1px);
                    background-size: 30px 30px;
                    color: #ef4444;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Share Tech Mono', monospace;
                    text-align: center;
                    padding: 20px;
                    box-sizing: border-box;
                    position: relative;
                }
                .fatal-err-container::after {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at center, transparent 0%, #000 120%);
                    pointer-events: none;
                }
                .err-box {
                    border: 1px solid #ef4444;
                    background: rgba(20, 0, 0, 0.95);
                    padding: 40px;
                    max-width: 900px;
                    width: 90%;
                    box-shadow: 0 0 100px rgba(239, 68, 68, 0.2), inset 0 0 30px rgba(239, 68, 68, 0.1);
                    position: relative;
                    z-index: 10;
                    clip-path: polygon(
                        0 0, 100% 0, 100% 90%, 95% 100%, 0 100%
                    );
                }
                .err-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #7f1d1d;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .err-title {
                    font-size: 24px;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    margin: 0;
                    color: #ef4444;
                    text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
                }
                .err-code {
                    font-size: 12px;
                    background: #7f1d1d;
                    color: black;
                    padding: 4px 8px;
                    font-weight: bold;
                }
                .err-content {
                    text-align: left;
                    margin-bottom: 30px;
                }
                .err-msg {
                    font-size: 18px;
                    margin-bottom: 15px;
                    color: #fff;
                    font-weight: bold;
                }
                .err-stack {
                    background: rgba(0, 0, 0, 0.8);
                    padding: 20px;
                    border-left: 2px solid #ef4444;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #fca5a5;
                    max-height: 200px;
                    overflow-y: auto;
                    font-family: monospace;
                    white-space: pre-wrap;
                }
                .btn {
                    background: #ef4444;
                    color: black;
                    border: none;
                    padding: 16px 40px;
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    cursor: pointer;
                    letter-spacing: 0.2em;
                    transition: all 0.2s;
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                }
                .btn:hover {
                    background: #fff;
                    color: #ef4444;
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
                }
                .scanline {
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 5px;
                    background: rgba(239, 68, 68, 0.3);
                    opacity: 0.5;
                    animation: scan 3s linear infinite;
                    pointer-events: none;
                }
                @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
            </style>
            <div class="fatal-err-container">
                <div class="scanline"></div>
                <div class="err-box">
                    <div class="err-header">
                        <h1 class="err-title">System Critical Failure</h1>
                        <span class="err-code">ERR_CODE: KERNEL_PANIC</span>
                    </div>
                    <div class="err-content">
                        <p class="err-msg">The orchestrator encountered an unrecoverable exception during the initialization sequence.</p>
                        <div class="err-stack">${message}<br/><br/>${stack}</div>
                    </div>
                    <button class="btn" onclick="window.location.reload()">Initiate System Reboot</button>
                </div>
            </div>
        `;
    }
    
    // Ensure boot screen is removed so error is visible
    const bootScreen = document.getElementById(BOOT_SCREEN_ID);
    if (bootScreen) bootScreen.remove();
};

const removeBootScreen = () => {
    const bootScreen = document.getElementById(BOOT_SCREEN_ID);
    if (bootScreen) {
        logBoot("Disengaging boot overlay sequence.");
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            if (bootScreen && bootScreen.parentNode) {
                bootScreen.style.display = 'none';
                bootScreen.remove();
            }
        }, 800);
    }
};

const bootstrap = async () => {
    logBoot("INITIALIZING AURA ORCHESTRATOR v2.4.0...");
    logBoot("Environment: " + (process.env.NODE_ENV || 'development'));

    const container = document.getElementById(ROOT_ID);
    if (!container) {
        logBoot("FATAL: Target root container missing from DOM.", 'error');
        return;
    }

    try {
        logBoot("Constructing React Root...");
        const root = createRoot(container);

        logBoot("Mounting Context Providers & Application Tree...");
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
        
        logBoot("React Mount Successful. Engaging UI...");
        
        // Slight artificial delay to allow app to hydrate visibly behind the fade out
        setTimeout(removeBootScreen, 1200);

    } catch (err) {
        logBoot("FATAL: Render sequence aborted.", 'error');
        console.error(err);
        renderFatalError(err);
    }
};

// --- GLOBAL ERROR TRAPS ---
window.addEventListener('error', (event) => {
    // Specifically catch module loading errors which might not be caught by React ErrorBoundary
    if (
        event.message.toLowerCase().includes('module') || 
        event.message.toLowerCase().includes('import') ||
        event.message.toLowerCase().includes('unexpected token')
    ) {
        renderFatalError(new Error(`Module Integrity Failure: ${event.message}`));
    }
});

// --- EXECUTION START ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}