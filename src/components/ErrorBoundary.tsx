// React error boundary for crash recovery.
// Wraps key routes (BuilderPage, ViewerPage, GardenPage) to catch render errors
// and show a fallback instead of a white screen.

import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log for debugging — could be replaced with a monitoring service later
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <h1 className="text-lg uppercase tracking-widest font-bold mb-4">
            Something went wrong
          </h1>
          <p className="text-sm text-subtitle mb-8 max-w-md">
            We hit an unexpected error. Please try again or return to the home
            page.
          </p>
          <Link
            to="/"
            className="bg-rose text-white px-6 py-3 text-xs uppercase tracking-widest font-bold no-underline rounded-lg hover:bg-rose-dark hover:scale-[1.02] hover:shadow-md transition-all duration-200"
            onClick={() => this.setState({ hasError: false })}
          >
            Return Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
