import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Log to error reporting service in production
        if (import.meta.env.PROD) {
            // TODO: Send to error tracking service (e.g., Sentry)
            console.log('Production error:', error);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <div className="error-icon">⚠️</div>
                        <h1>Oops! Something went wrong</h1>
                        <p>We're sorry for the inconvenience. The application encountered an unexpected error.</p>

                        <div className="error-actions">
                            <button
                                className="btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => window.location.href = '/'}
                            >
                                Go Home
                            </button>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <pre className="error-stack">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
