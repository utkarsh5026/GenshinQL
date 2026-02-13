import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
          {/* Animated background stars */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-celestial-400 rounded-full animate-pulse" />
            <div
              className="absolute top-1/3 right-1/3 w-1 h-1 bg-starlight-400 rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-celestial-500 rounded-full animate-pulse"
              style={{ animationDelay: '2s' }}
            />
            <div
              className="absolute top-2/3 right-1/4 w-1 h-1 bg-starlight-300 rounded-full animate-pulse"
              style={{ animationDelay: '1.5s' }}
            />
          </div>

          <div className="max-w-2xl w-full relative z-10">
            {/* Game-style decorative corners */}
            <div className="relative">
              {/* Top-left corner */}
              <div className="absolute -top-3 -left-3 w-8 h-8 border-l-2 border-t-2 border-celestial-500/60" />
              {/* Top-right corner */}
              <div className="absolute -top-3 -right-3 w-8 h-8 border-r-2 border-t-2 border-celestial-500/60" />
              {/* Bottom-left corner */}
              <div className="absolute -bottom-3 -left-3 w-8 h-8 border-l-2 border-b-2 border-celestial-500/60" />
              {/* Bottom-right corner */}
              <div className="absolute -bottom-3 -right-3 w-8 h-8 border-r-2 border-b-2 border-celestial-500/60" />

              {/* Main Card */}
              <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl rounded-lg border border-border/50 shadow-2xl overflow-hidden">
                {/* Header with game-style divider */}
                <div className="px-8 py-6 relative">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-celestial-500/20 to-starlight-500/20 border border-celestial-500/30 flex items-center justify-center shrink-0">
                      <svg
                        className="w-7 h-7 text-celestial-600 dark:text-celestial-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-foreground tracking-wide">
                        Connection Interrupted
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1.5">
                        An unexpected error has occurred in the system
                      </p>
                    </div>
                  </div>

                  {/* Decorative line */}
                  <div className="mt-6 h-px bg-linear-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Content */}
                <div className="px-8 pb-6 space-y-5">
                  {/* Error message */}
                  <div className="bg-muted/30 dark:bg-muted/20 border border-border/50 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-warning-500 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-foreground/90 font-mono text-sm wrap-break-word flex-1">
                        {this.state.error?.message || 'Unknown error occurred'}
                      </p>
                    </div>
                  </div>

                  {/* Technical details (collapsed by default) */}
                  {this.state.error?.stack && (
                    <details className="group">
                      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2 select-none">
                        <svg
                          className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        Technical Details
                      </summary>
                      <div className="mt-3 bg-background/50 rounded border border-border/30 p-3 overflow-auto max-h-48">
                        <pre className="text-xs font-mono text-muted-foreground/80 whitespace-pre-wrap wrap-break-word">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </details>
                  )}

                  {/* Decorative divider */}
                  <div className="h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={this.handleReset}
                      className="flex-1 group relative overflow-hidden bg-linear-to-r from-celestial-600 to-celestial-500 hover:from-celestial-500 hover:to-celestial-400 text-white font-medium py-2.5 px-5 rounded transition-all"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Return Home
                      </span>
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-muted/50 hover:bg-muted text-foreground font-medium py-2.5 px-5 rounded border border-border/50 hover:border-border transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Retry
                      </span>
                    </button>
                  </div>

                  {/* Error ID - game style */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="h-px w-8 bg-border/30" />
                    <span className="text-xs text-muted-foreground/60 font-mono">
                      ERR-{Date.now().toString(36).toUpperCase()}
                    </span>
                    <div className="h-px w-8 bg-border/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
