import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { ResourceTab, ScreenProps } from '../../app/navigation';
import { RESOURCE_TABS, RESOURCE_TAB_LABEL, routeToHash } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EQUIPMENT_CONDITION, LANGUAGE_LABEL, ROSTER_STATUS, VESSEL_KIND_LABEL, VESSEL_STATUS } from '../../lib/status';
import type { CrewMember, EquipmentItem, Guide, Vessel } from '../../types/domain';

export function ResourcesScreen({ tab, navigate }: ScreenProps & { tab: ResourceTab }): ReactNode {
  const { dataset } = useDemoData();

  const vesselColumns: readonly Column<Vessel>[] = [
    { key: 'name', header: 'Vessel', render: (row) => <span className="cell-strong">{row.name}</span> },
    { key: 'kind', header: 'Type', render: (row) => VESSEL_KIND_LABEL[row.kind] },
    { key: 'capacity', header: 'Capacity', align: 'right', render: (row) => <span className="mono">{row.passengerCapacity}</span> },
    { key: 'port', header: 'Home port', render: (row) => <span className="cell-sub">{row.homePort}</span> },
    { key: 'ownership', header: 'Ownership', render: (row) => row.ownership === 'owned' ? 'Owned' : `Partner ${row.partnerName ? `· ${row.partnerName}` : ''}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge presentation={VESSEL_STATUS[row.status]} /> },
  ];

  const crewColumns: readonly Column<CrewMember>[] = [
    { key: 'name', header: 'Name', render: (row) => <span className="cell-strong">{row.fullName}</span> },
    { key: 'role', header: 'Role', render: (row) => row.role },
    { key: 'roster', header: 'Roster', render: (row) => <StatusBadge presentation={ROSTER_STATUS[row.rosterStatus]} /> },
    { key: 'certs', header: 'Certifications', render: (row) => <span className="chip-row">{row.certifications.map((item) => <span className="chip" key={item}>{item}</span>)}</span> },
    { key: 'languages', header: 'Languages', render: (row) => row.languages.map((code) => LANGUAGE_LABEL[code]).join(', ') },
  ];

  const guideColumns: readonly Column<Guide>[] = [
    { key: 'name', header: 'Name', render: (row) => <span className="cell-strong">{row.fullName}</span> },
    { key: 'languages', header: 'Languages', render: (row) => row.languages.map((code) => LANGUAGE_LABEL[code]).join(', ') },
    { key: 'specialities', header: 'Specialities', render: (row) => <span className="chip-row">{row.specialities.map((item) => <span className="chip" key={item}>{item}</span>)}</span> },
    { key: 'roster', header: 'Roster', render: (row) => <StatusBadge presentation={ROSTER_STATUS[row.rosterStatus]} /> },
  ];

  const equipmentColumns: readonly Column<EquipmentItem>[] = [
    { key: 'name', header: 'Item', render: (row) => <span className="cell-strong">{row.name}</span> },
    { key: 'category', header: 'Category', render: (row) => row.category },
    { key: 'units', header: 'Units', align: 'right', render: (row) => <span className="mono">{row.totalUnits}</span> },
    { key: 'condition', header: 'Condition', render: (row) => <StatusBadge presentation={EQUIPMENT_CONDITION[row.condition]} /> },
    { key: 'storage', header: 'Storage', render: (row) => <span className="cell-sub">{row.storageLocation}</span> },
  ];

  const summary: Record<ResourceTab, string> = {
    vessels: `${dataset.vessels.length} vessels · ${dataset.vessels.filter((item) => item.status !== 'in_service').length} unavailable`,
    crew: `${dataset.crew.length} crew · ${dataset.crew.filter((item) => item.rosterStatus === 'on_leave').length} on leave`,
    guides: `${dataset.guides.length} guides · ${dataset.guides.filter((item) => item.rosterStatus === 'contractor').length} contracted per trip`,
    equipment: `${dataset.equipment.length} equipment lines · ${dataset.equipment.filter((item) => item.condition !== 'good').length} need attention`,
  };

  return (
    <div className="page">
      <PageHeader title="Resources" subtitle="Fleet, people and equipment recorded for the demo operator"
        crumbs={[{ label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) }, { label: 'Resources' }, { label: RESOURCE_TAB_LABEL[tab] }]} />

      <nav className="tabs" aria-label="Resource categories">
        {RESOURCE_TABS.map((entry) => (
          <a key={entry} href={routeToHash({ screen: 'resources', tab: entry })}
            className={entry === tab ? 'tab is-active' : 'tab'}
            aria-current={entry === tab ? 'page' : undefined}
            onClick={(event) => { event.preventDefault(); navigate({ screen: 'resources', tab: entry }); }}>
            {RESOURCE_TAB_LABEL[entry]}
          </a>
        ))}
      </nav>

      <Panel title={RESOURCE_TAB_LABEL[tab]} description={summary[tab]}>
        {tab === 'vessels' ? <DataTable caption="Vessels" columns={vesselColumns} rows={dataset.vessels} /> : null}
        {tab === 'crew' ? <DataTable caption="Crew" columns={crewColumns} rows={dataset.crew} /> : null}
        {tab === 'guides' ? <DataTable caption="Guides" columns={guideColumns} rows={dataset.guides} /> : null}
        {tab === 'equipment' ? <DataTable caption="Equipment" columns={equipmentColumns} rows={dataset.equipment} /> : null}
        <p className="notice">Read-only roster. Availability, assignment and maintenance updates are intentionally deferred.</p>
      </Panel>
    </div>
  );
}