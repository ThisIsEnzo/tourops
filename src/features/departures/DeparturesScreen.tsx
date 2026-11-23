import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { ScreenProps } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Meter } from '../../components/ui/Meter';
import { DEFAULT_DEPARTURE_FILTER, filterDepartures, statusOptions } from '../../lib/filters';
import type { DepartureFilter } from '../../lib/filters';
import { DEPARTURE_STATUS } from '../../lib/status';
import type { DepartureStatus } from '../../types/domain';
import { dateParts, departureView } from '../../lib/operations';
import { formatTimeRange } from '../../lib/datetime';

const STATUS_OPTIONS = statusOptions(DEPARTURE_STATUS, 'All statuses');

export function DeparturesScreen({ navigate }: ScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const [filter, setFilter] = useState<DepartureFilter>(DEFAULT_DEPARTURE_FILTER);
  const rows = useMemo(() => filterDepartures(dataset, filter), [dataset, filter]);
  const views = useMemo(
    () => rows.map((departure) => departureView(dataset, departure.id)).filter((view) => view !== null),
    [dataset, rows],
  );

  return (
    <div className="page">
      <PageHeader title="Departures" subtitle="Scheduled trips, assigned resources and preparation state"
        crumbs={[{ label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) }, { label: 'Departures' }]} />
      <Panel title={`${views.length} of ${dataset.departures.length} departures`} description="Readiness is derived from the preparation checklist">
        <Toolbar query={filter.query} onQuery={(query) => setFilter((current) => ({ ...current, query }))} placeholder="Search departures, vessels…">
          <FilterSelect label="Status" value={filter.status} options={STATUS_OPTIONS}
            onChange={(status: DepartureStatus | 'all') => setFilter((current) => ({ ...current, status }))} />
        </Toolbar>
        {views.length === 0 ? (
          <EmptyState title="No departures match" hint="Clear the search or choose another status."
            action={{ label: 'Clear filters', onClick: () => setFilter(DEFAULT_DEPARTURE_FILTER) }} />
        ) : (
          <ul className="departure-list departure-list--wide">
            {views.map((view) => {
              const parts = dateParts(view.departure.date);
              return (
                <li key={view.departure.id}>
                  <button type="button" className="departure-row" onClick={() => navigate({ screen: 'departure', id: view.departure.id })}>
                    <span className="date-block">
                      <span className="date-block__weekday">{parts.weekday}</span>
                      <span className="date-block__day">{parts.day}</span>
                      <span className="date-block__month">{parts.month}</span>
                    </span>
                    <span className="departure-row__main">
                      <span className="departure-row__title">{view.experience?.name ?? 'Experience'}</span>
                      <span className="departure-row__meta">
                        {formatTimeRange(view.departure.departureTime, view.departure.returnTime)} · {view.departure.passengerCount} guests ({view.adults}A / {view.children}C) · {view.vessel ? view.vessel.name : 'Vessel not assigned'}
                      </span>
                      <Meter done={view.progress.done} total={view.progress.total} blocked={view.progress.blocked} />
                    </span>
                    <span className="departure-row__side">
                      <StatusBadge presentation={DEPARTURE_STATUS[view.departure.status]} />
                      <span className="departure-row__ref mono">{view.departure.reference}</span>
                      <span className="departure-row__away">{view.daysAway === 0 ? 'today' : `in ${view.daysAway} day(s)`}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}