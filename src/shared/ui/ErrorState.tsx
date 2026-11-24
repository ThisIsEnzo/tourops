import type { ReactNode } from 'react';
import './errorState.css';
export interface ErrorStateProps {
  readonly error: Error; readonly title?: string; readonly message?: string;
  readonly onRetry?: () => void; readonly onReload?: () => void;
}
/** Product-neutral error presentation; products supply copy and recovery actions when needed. */
export function ErrorState({
  error, title = 'Something went wrong',
  message = 'This part of the application could not be displayed. You can try again or reload the application.',
  onRetry, onReload,
}: ErrorStateProps): ReactNode {
  const reload = (): void => {
    if (onReload) onReload();
    else if (typeof window !== 'undefined') window.location.reload();
  };
  return (
    <section className="shared-error-state" role="alert" aria-live="assertive">
      <div className="shared-error-state__mark" aria-hidden="true">!</div>
      <div className="shared-error-state__content">
        <p className="shared-error-state__eyebrow">Application error</p>
        <h2 className="shared-error-state__title">{title}</h2>
        <p className="shared-error-state__message">{message}</p>
      </div>
      <div className="shared-error-state__actions">
        {onRetry ? <button type="button" onClick={onRetry}>Try again</button> : null}
        <button type="button" className="shared-error-state__secondary" onClick={reload}>Reload app</button>
      </div>
      <details className="shared-error-state__details">
        <summary>Technical detail</summary><pre>{error.name}: {error.message}</pre>
      </details>
    </section>
  );
}
