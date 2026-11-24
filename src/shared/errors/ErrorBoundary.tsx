import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '../ui/ErrorState';
interface ErrorBoundaryProps {
  readonly children: ReactNode; readonly title?: string; readonly message?: string;
  readonly onError?: (error: Error, info: ErrorInfo) => void;
  readonly renderFallback?: (error: Error, reset: () => void) => ReactNode;
}
interface ErrorBoundaryState { readonly error: Error | null; }
/** React render-error containment. Key by route to reset after navigation. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo): void { this.props.onError?.(error, info); }
  private readonly reset = (): void => { this.setState({ error: null }); };
  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { renderFallback, title, message } = this.props;
    if (renderFallback) return renderFallback(error, this.reset);
    return <div className="shared-error-boundary"><ErrorState error={error} title={title} message={message} onRetry={this.reset} /></div>;
  }
}
