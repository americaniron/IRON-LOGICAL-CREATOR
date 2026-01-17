import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary class to catch rendering errors in the component tree.
 */
class ErrorBoundary extends Component<Props, State> {
  // FIX: Switched to class property syntax for state initialization and method binding.
  // This modern approach correctly binds `this` and resolves issues with type resolution for `state`, `setState`, and `props`.
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log errors for telemetry
    console.error("SYSTEM_CRITICAL_RENDER_FAULT:", error, errorInfo);
  }

  // Bound handler to recover from error state
  public handleRecovery = (): void => {
    // Re-initialize state to recover from the error boundary
    this.setState({ hasError: false, error: undefined });
    window.location.hash = '#/';
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Minimal HTML structure to ensure it renders even if other components are broken
      return (
        <div className="flex items-center justify-center h-full w-full p-8 bg-asphalt blueprint-grid">
            <div className="text-center space-y-6 p-10 bg-red-900/20 border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] max-w-3xl w-full">
                <p className="text-red-500 font-heading uppercase tracking-widest text-3xl">!! CORE_INTEGRITY_FAILURE !!</p>
                <p className="font-body text-sm text-red-400 uppercase">A critical error occurred in the component fabrication layer.</p>
                
                <div className="text-left bg-black/80 p-6 border border-red-900/50">
                    <p className="font-body text-xs uppercase text-gray-500 mb-2">FAULT_TELEMETRY:</p>
                    <pre className="text-xs text-red-300 overflow-auto whitespace-pre-wrap font-mono break-all max-h-60">
                        {this.state.error?.toString() || "Unknown Error"}
                    </pre>
                </div>

                <button 
                    onClick={this.handleRecovery} 
                    className="px-8 py-4 bg-orange-500 border-2 border-black border-t-orange-300 border-l-orange-300 text-black font-heading uppercase tracking-widest font-black transition-all shadow-[0_6px_0_#c2410c] active:shadow-[0_2px_0_#c2410c] hover:bg-orange-400 active:translate-y-[4px]"
                >
                    ATTEMPT_SYSTEM_RECOVERY
                </button>
            </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
