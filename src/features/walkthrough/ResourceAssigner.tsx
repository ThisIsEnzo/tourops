import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import { Panel } from '../../components/ui/Panel';
import { Icon } from '../../components/ui/Icon';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ASSIGNMENT_STATUS, EQUIPMENT_CONDITION, RESOURCE_KIND_LABEL, ROSTER_STATUS, VESSEL_KIND_LABEL, VESSEL_STATUS } from '../../lib/status';
import { assignmentsFor, findById } from '../../lib/selectors';
import type { AssignmentStatus, ResourceAssignment, ResourceKind } from '../../types/domain';
import type { WorkflowResult } from '../../lib/workflow';
import { WorkflowFeedback } from './WorkflowFeedback';

const KINDS: readonly ResourceKind[] = ['vessel', 'crew', 'guide', 'equipment'];

/** Assignment form + live register. All validation comes from Stage A `assignResource`. */
export function ResourceAssigner({ departureId }: { departureId: string }): ReactNode {
  const { dataset, assignResource } = useDemoData();
  const [kind, setKind] = useState<ResourceKind>('vessel');
  const [resourceId, setResourceId] = useState('');
  const [units, setUnits] = useState('1');
  const [status, setStatus] = useState<AssignmentStatus>('confirmed');
  const [result, setResult] = useState<WorkflowResult<ResourceAssignment> | null>(null);

  const departure = findById(dataset.departures, departureId) ?? null;

  const options = useMemo(() => {
    if (kind === 'vessel') {
      return dataset.vessels.map((vessel) => ({
        value: vessel.id,
        label: `${vessel.name} · ${VESSEL_KIND_LABEL[vessel.kind]} · ${vessel.passengerCapacity} pax · ${VESSEL_STATUS[vessel.status].label}`,
      }));
    }
    if (kind === 'crew') {
      return dataset.crew.map((member) => ({
        value: member.id, label: `${member.fullName} · ${member.role} · ${ROSTER_STATUS[member.rosterStatus].label}`,
      }));
    }
    if (kind === 'guide') {
      return dataset.guides.map((guide) => ({
        value: guide.id, label: `${guide.fullName} · ${guide.specialities.join(', ')} · ${ROSTER_STATUS[guide.rosterStatus].label}`,
      }));
    }
    return dataset.equipment.map((item) => ({
      value: item.id, label: `${item.name} · ${item.totalUnits} units · ${EQUIPMENT_CONDITION[item.condition].label}`,
    }));
  }, [dataset, kind]);

  if (!departure) return null;

  const current = assignmentsFor(dataset, departureId);
  const selected = resourceId === '' ? (options[0]?.value ?? '') : resourceId;

  const nameOf = (assignment: ResourceAssignment): string => {
    if (assignment.kind === 'vessel') return findById(dataset.vessels, assignment.resourceId)?.name ?? assignment.resourceId;
    if (assignment.kind === 'crew') return findById(dataset.crew, assignment.resourceId)?.fullName ?? assignment.resourceId;
    if (assignment.kind === 'guide') return findById(dataset.guides, assignment.resourceId)?.fullName ?? assignment.resourceId;
    return findById(dataset.equipment, assignment.resourceId)?.name ?? assignment.resourceId;
  };

  const submit = (): void => {
    setResult(assignResource({
      departureId,
      kind,
      resourceId: selected,
      units: kind === 'equipment' ? Number.parseInt(units, 10) || 0 : 1,
      status,
    }));
  };

  return (
    <Panel title="Assign resources" description={`${departure.reference} · ${departure.passengerCount} guests · conflicts are validated by the workflow engine`}>
      <div className="wf-grid">
        <label className="wf-field">
          <span>Resource type</span>
          <select value={kind} onChange={(event) => { setKind(event.target.value as ResourceKind); setResourceId(''); }}>
            {KINDS.map((entry) => <option key={entry} value={entry}>{RESOURCE_KIND_LABEL[entry]}</option>)}
          </select>
        </label>
        <label className="wf-field wf-field--grow">
          <span>Resource</span>
          <select value={selected} onChange={(event) => setResourceId(event.target.value)}>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        {kind === 'equipment' ? (
          <label className="wf-field wf-field--xs">
            <span>Units</span>
            <input type="number" min={1} step={1} value={units} onChange={(event) => setUnits(event.target.value)} />
          </label>
        ) : null}
        <label className="wf-field">
          <span>Assignment status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as AssignmentStatus)}>
            <option value="confirmed">Confirmed</option>
            <option value="proposed">Proposed</option>
          </select>
        </label>
      </div>

      <button type="button" className="wf-primary" onClick={submit} disabled={selected === ''}>
        Assign resource <Icon name="check" size={14} />
      </button>
      <WorkflowFeedback result={result} />

      <ul className="wf-register">
        {current.length === 0 ? <li className="wf-note">Nothing assigned to this departure yet.</li> : null}
        {current.map((assignment) => (
          <li key={assignment.id}>
            <span className="wf-register__kind">{RESOURCE_KIND_LABEL[assignment.kind]}</span>
            <span className="wf-register__name">
              {nameOf(assignment)}{assignment.units > 1 ? ` × ${assignment.units}` : ''}
              {assignment.role ? <em>{assignment.role}</em> : null}
            </span>
            <StatusBadge presentation={ASSIGNMENT_STATUS[assignment.status]} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}