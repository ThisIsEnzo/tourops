import type { ReactNode } from 'react';
import type { WorkflowResult } from '../../lib/workflow';
import { Icon } from '../../components/ui/Icon';

/** Renders the exact outcome of a Stage A action: success message or every validation issue. */
export function WorkflowFeedback({ result }: { result: WorkflowResult<unknown> | null }): ReactNode {
  if (!result) return null;
  if (result.ok) {
    return (
      <p className="wf-feedback is-ok" role="status">
        <Icon name="check" size={14} /> {result.message}
      </p>
    );
  }
  return (
    <ul className="wf-feedback is-error" role="alert">
      {result.errors.map((error) => (
        <li key={`${error.code}-${error.field}`}>
          <Icon name="alert" size={13} />
          <span><strong>{error.field}</strong> {error.message}</span>
        </li>
      ))}
    </ul>
  );
}