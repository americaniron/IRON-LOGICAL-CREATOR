import React, { ErrorInfo, ReactNode } from 'react';
import Button from './common/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SYSTEM_CRITICAL_RENDER_FAULT:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-6 p-10 bg-red-900/20 border-2 border-red-500 shadow-2xl max-w-2xl">
                <p className="text-red-500 font-['Black_Ops_One'] uppercase tracking-widest text-3xl">!! CORE_INTEGRITY_FAILURE !!</p>
                <p className="font-mono text-sm text-red-400 uppercase">A critical error occurred in the component fabrication layer. System integrity is compromised.</p>
                <details className="text-left bg-black/50 p-4 border border-industrial-gray">
                    <summary className="font-mono text-xs uppercase cursor-pointer text-gray-500">View Telemetry Fault Data</summary>
                    <pre className="mt-4 text-xs text-red-300 overflow-auto scrollbar-thin whitespace-pre-wrap">
                        {this.state.error?.toString()}
                    </pre>
                </details>
                <Button onClick={() => this.setState({ hasError: false, error: undefined })} variant="warning" className="mx-auto !text-base !py-4">
                    Attempt Recovery
                </Button>
            </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;