import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Oups ! Une erreur est survenue.</h1>
          <p className="text-[#a0a0cc] text-sm mb-8">
            L'application a rencontré un problème inattendu.
          </p>
          <pre className="bg-[#1a1a3e] p-4 rounded-xl text-xs text-left overflow-auto max-w-full mb-8 text-red-400">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#7c3aed] rounded-xl font-bold"
          >
            Recharger l'application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
