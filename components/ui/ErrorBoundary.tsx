import React, { Component, ReactNode } from 'react';
import Button from './Button';
import GlassCard from './GlassCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Provides a fallback UI when errors occur instead of crashing the app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    this.setState({ error, errorInfo });

    // In production, you might want to log this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg">
          <GlassCard className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                Er is iets misgegaan
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                We hebben een onverwachte fout gedetecteerd. Probeer de pagina te vernieuwen.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.handleReset} variant="primary" fullWidth>
                Probeer opnieuw
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="secondary" 
                fullWidth
              >
                Pagina vernieuwen
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Technische details (alleen in ontwikkeling)
                </summary>
                <pre className="mt-2 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;