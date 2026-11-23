import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import { Panel } from '../../components/ui/Panel';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { EmptyState } from '../../components/ui/EmptyState';
import { calculateDepartureReadiness } from '../../lib/readiness';

/** Read-only projection of the Stage A readiness calculation. No manual override exists. */
export function ReadinessPanel({ departureId }: { departureId: string }): ReactNode {
  const { dataset } = useDemoData();
  const readiness = calculateDepartureReadiness(dataset, departureId);

  if (!readiness) {
    return <Panel title="Departure readiness"><EmptyState title="No departure yet" hint="Convert the accepted quote to create a departure." /></Panel>;
  }

  return (
    <Panel
      title="Departure readiness"
      description="Derived from bookings, payments, assignments and the checklist"
      actions={<Badge tone={readiness.isReady ? 'positive' : 'critical'}>{readiness.isReady ? 'Ready to sail' : 'Not ready'}</Badge>}
    >
      <div className="wf-readiness">
        <section>
          <h3><Icon name="check" size={13} /> Completed ({readiness.completed.length})</h3>
          <ul className="is-done">
            {readiness.completed.map((requirement) => <li key={requirement.key}>{requirement.label}</li>)}
            {readiness.completed.length === 0 ? <li className="wf-note">Nothing satisfied yet.</li> : null}
          </ul>
        </section>
        <section>
          <h3><Icon name="alert" size={13} /> Outstanding ({readiness.outstanding.length})</h3>
          <ul className="is-open">
            {readiness.outstanding.map((requirement) => (
              <li key={requirement.key}><strong>{requirement.label}</strong><span>{requirement.reason}</span></li>
            ))}
            {readiness.outstanding.length === 0 ? <li className="wf-note">Every requirement is satisfied.</li> : null}
          </ul>
        </section>
      </div>
    </Panel>
  );
}