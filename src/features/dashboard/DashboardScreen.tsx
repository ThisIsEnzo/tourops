import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { ScreenProps } from '../../app/navigation';
import { routeForEntity } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Icon } from '../../components/ui/Icon';
import { attentionItems } from '../../lib/attention';
import { dashboardMetrics, dateParts, upcomingDepartureViews } from '../../lib/operations';
import { formatDate, formatTimeRange } from '../../lib/datetime';
import { formatMoney } from '../../lib/money';
import { sortEnquiries } from '../../lib/filters';
import { DEPARTURE_STATUS, ENQUIRY_STATUS } from '../../lib/status';
import { findById, partySize } from '../../lib/selectors';
import type { Enquiry } from '../../types/domain';

export function DashboardScreen({ navigate }: ScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const metrics = useMemo(() => dashboardMetrics(dataset), [dataset]);
  const attention = useMemo(() => attentionItems(dataset), [dataset]);
  const departures = useMemo(() => upcomingDepartureViews(dataset, dataset.meta.referenceDate), [dataset]);
  const recent = useMemo(() => sortEnquiries(dataset.enquiries, 'received-desc').slice(0, 5), [dataset]);

  const columns: readonly Column<Enquiry>[] = [
    { key: 'ref', header: 'Reference', render: (row) => <span className="mono cell-strong">{row.reference}</span> },
    { key: 'guest', header: 'Customer', render: (row) => findById(dataset.customers, row.customerId)?.displayName ?? '—' },
    { key: 'trip', header: 'Experience', render: (row) => <span className="cell-sub">{row.experienceId ? findById(dataset.experiences, row.experienceId)?.name ?? '—' : '—'}</span> },
    { key: 'date', header: 'Requested', render: (row) => formatDate(row.preferredDate) },
    { key: 'pax', header: 'Guests', align: 'right', render: (row) => partySize(row.party) },
    { key: 'value', header: 'Est. value', align: 'right', render: (row) => <span className="mono">{row.estimatedValue ? formatMoney(row.estimatedValue) : '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge presentation={ENQUIRY_STATUS[row.status]} /> },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Operations overview"
        subtitle={`${dataset.meta.operatorName} · ${formatDate(dataset.meta.referenceDate)} · simulated workspace`}
        actions={<button type="button" onClick={() => navigate({ screen: 'departures' })}>Open departures</button>}
      />

      <section className="metric-band" aria-label="Operational summary">
        <div className="metric"><span className="metric__label">Upcoming departures</span><span className="metric__value">{metrics.upcomingDepartures}</span><span className="metric__hint">{metrics.guestsNextSevenDays} guests in 7 days</span></div>
        <div className="metric"><span className="metric__label">Pending enquiries</span><span className="metric__value">{metrics.pendingEnquiries}</span><span className="metric__hint">awaiting a quote</span></div>
        <div className="metric"><span className="metric__label">Quotes awaiting reply</span><span className="metric__value">{metrics.quotesAwaitingResponse}</span><span className="metric__hint">sent, not accepted</span></div>
        <div className="metric"><span className="metric__label">Deposits outstanding</span><span className="metric__value metric__value--money">{formatMoney(metrics.depositsOutstanding)}</span><span className="metric__hint">across {metrics.upcomingBookings} bookings</span></div>
        <div className="metric"><span className="metric__label">Open pipeline</span><span className="metric__value metric__value--money">{formatMoney(metrics.openPipeline)}</span><span className="metric__hint">pending + quoted</span></div>
      </section>

      <div className="dashboard-grid">
        <div className="col-attention">
          <Panel title="Needs attention" description={`${attention.length} signals derived from the demo dataset`}>
            <ul className="attention-list">
              {attention.map((item) => (
                <li key={item.id}>
                  <button type="button" className={`attention-item severity-${item.severity}`}
                    onClick={() => navigate(routeForEntity(item.target.entity, item.target.id))}>
                    <span className="attention-item__rail" aria-hidden="true" />
                    <span className="attention-item__body">
                      <span className="attention-item__title">{item.title}</span>
                      <span className="attention-item__detail">{item.detail}</span>
                    </span>
                    <Icon name="chevron" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="col-departures">
          <Panel title="Upcoming departures" description="Readiness reflects the preparation checklist"
            actions={<button type="button" onClick={() => navigate({ screen: 'departures' })}>All departures</button>}>
            <ul className="departure-list">
              {departures.map((view) => {
                const parts = dateParts(view.departure.date);
                return (
                  <li key={view.departure.id}>
                    <button type="button" className="departure-row"
                      onClick={() => navigate({ screen: 'departure', id: view.departure.id })}>
                      <span className="date-block">
                        <span className="date-block__weekday">{parts.weekday}</span>
                        <span className="date-block__day">{parts.day}</span>
                        <span className="date-block__month">{parts.month}</span>
                      </span>
                      <span className="departure-row__main">
                        <span className="departure-row__title">{view.experience?.name ?? 'Experience'}</span>
                        <span className="departure-row__meta">
                          {formatTimeRange(view.departure.departureTime, view.departure.returnTime)} · {view.departure.passengerCount} guests · {view.vessel ? view.vessel.name : 'Vessel not assigned'}
                        </span>
                        <Meter done={view.progress.done} total={view.progress.total} blocked={view.progress.blocked} />
                      </span>
                      <span className="departure-row__side">
                        <StatusBadge presentation={DEPARTURE_STATUS[view.departure.status]} />
                        <span className="departure-row__ref mono">{view.departure.reference}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Recent enquiries" description="Newest first"
        actions={<button type="button" onClick={() => navigate({ screen: 'enquiries' })}>All enquiries</button>}>
        <DataTable caption="Recent enquiries" columns={columns} rows={recent}
          onSelect={(row) => navigate({ screen: 'enquiry', id: row.id })} />
      </Panel>
    </div>
  );
}