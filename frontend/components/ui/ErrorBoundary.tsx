import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erreur de rendu React:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-white p-8 text-black">
          <h1 className="text-2xl font-bold">Erreur au demarrage de l'application</h1>
          <pre className="mt-4 overflow-auto border border-black bg-gray-50 p-4 text-sm">
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
