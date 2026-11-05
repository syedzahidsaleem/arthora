'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="neo-box p-8 bg-white border-2 border-black max-w-lg mx-auto my-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-neo-rust border-2 border-black text-white flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-black mb-2 uppercase tracking-tight">Something went wrong</h3>
          <p className="text-sm font-mono text-black/70 mb-6">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="neo-btn bg-neo-mint text-black font-bold text-sm inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
