import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import { Panel } from '../../components/ui/Panel';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Icon } from '../../components/ui/Icon';
import { CHECKLIST_CATEGORY_LABEL, CHECKLIST_STATUS } from '../../lib/status';
import { checklistFor, checklistProgress } from '../../lib/selectors';
import type { ChecklistCategory, ChecklistItem } from '../../types/domain';
import type { WorkflowResult } from '../../lib/workflow';
import { WorkflowFeedback } from './WorkflowFeedback';

const ORDER: readonly ChecklistCategory[] = ['guest', 'safety', 'provisioning', 'crew', 'documents'];

/** Interactive checklist. Completion and reopening both go through Stage A. */
export function PreparationBoard({ departureId }: { departureId: string }): ReactNode {
  const { dataset, updateChecklistItem } = useDemoData();
  const [result, setResult] = useState<WorkflowResult<ChecklistItem> | null>(null);
  const items = checklistFor(dataset, departureId);
  const progress = checklistProgress(items);
  const groups = ORDER
    .map((category) => ({ category, rows: items.filter((item) => item.category === category) }))
    .filter((group) => group.rows.length > 0);

  return (
    <Panel title="Preparation checklist" description={`${progress.done}/${progress.total} complete · ${progress.requiredOutstanding} mandatory item(s) open`}>
      <Meter done={progress.done} total={progress.total} blocked={progress.blocked} />
      <div className="wf-checklist">
        {groups.map((group) => (
          <section key={group.category}>
            <h3>{CHECKLIST_CATEGORY_LABEL[group.category]}</h3>
            <ul>
              {group.rows.map((item) => (
                <li key={item.id} className={`wf-check is-${item.status}`}>
                  <StatusBadge presentation={CHECKLIST_STATUS[item.status]} />
                  <span className="wf-check__body">
                    <span>{item.label}{item.required ? <em className="wf-tag">required</em> : null}</span>
                    {item.note ? <small>{item.note}</small> : null}
                    <small className="wf-check__owner">{item.ownerRole ?? 'unassigned'}</small>
                  </span>
                  {item.status === 'done' ? (
                    <button type="button" className="wf-ghost" onClick={() => setResult(updateChecklistItem({ itemId: item.id, status: 'pending' }))}>
                      Reopen: {item.label}
                    </button>
                  ) : (
                    <button type="button" className="wf-primary wf-primary--sm" onClick={() => setResult(updateChecklistItem({ itemId: item.id, status: 'done' }))}>
                      <Icon name="check" size={13} /> Complete: {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <WorkflowFeedback result={result} />
    </Panel>
  );
}