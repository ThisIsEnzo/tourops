import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { DetailScreenProps } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Field, FieldGrid } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Meter } from '../../components/ui/Meter';
import { Icon } from '../../components/ui/Icon';
import { departureView } from '../../lib/operations';
import { formatDate, formatTimeRange } from '../../lib/datetime';
import { amountReceived, formatMoney } from '../../lib/money';
import { DEPARTURE_STATUS, VESSEL_KIND_LABEL } from '../../lib/status';
import { ResourceAssigner } from '../walkthrough/ResourceAssigner';
import { PreparationBoard } from '../walkthrough/PreparationBoard';
import { ReadinessPanel } from '../walkthrough/ReadinessPanel';

export function DepartureDetailScreen({ id, navigate }: DetailScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const view = departureView(dataset, id);
  if (!view) {
    return (
      <div className="page">
        <PageHeader title="Departure not found" back={{ label: 'All departures', onClick: () => navigate({ screen: 'departures' }) }} />
        <Panel title="Nothing to show"><EmptyState title="Unknown reference" hint="This departure is not in the demo dataset." /></Panel>
      </div>
    );
  }

  const { departure } = view;

  return (
    <div className="page">
      <PageHeader title={departure.reference}
        subtitle={`${formatDate(departure.date)} · ${formatTimeRange(departure.departureTime, departure.returnTime)} · ${view.experience?.name ?? ''}`}
        badge={<StatusBadge presentation={DEPARTURE_STATUS[departure.status]} />}
        crumbs={[
          { label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) },
          { label: 'Departures', onClick: () => navigate({ screen: 'departures' }) },
          { label: departure.reference },
        ]}
        back={{ label: 'All departures', onClick: () => navigate({ screen: 'departures' }) }}
        actions={<button type="button" onClick={() => navigate({ screen: 'walkthrough' })}>Open walkthrough</button>}
      />

      <section className="run-sheet-head">
        <div className="run-sheet-head__cell">
          <span className="metric__label">Vessel</span>
          <strong>{view.vessel ? view.vessel.name : 'Not assigned'}</strong>
          <span className="cell-sub">{view.vessel ? `${VESSEL_KIND_LABEL[view.vessel.kind]} · ${view.vessel.passengerCapacity} pax capacity` : 'Awaiting confirmation'}</span>
        </div>
        <div className="run-sheet-head__cell">
          <span className="metric__label">Manifest</span>
          <strong>{departure.passengerCount} guests</strong>
          <span className="cell-sub">{view.adults} adults / {view.children} children</span>
        </div>
        <div className="run-sheet-head__cell">
          <span className="metric__label">Meeting point</span>
          <strong>{departure.meetingPoint}</strong>
          <span className="cell-sub">Boarding 15 minutes before departure</span>
        </div>
        <div className="run-sheet-head__cell">
          <span className="metric__label">Readiness</span>
          <Meter done={view.progress.done} total={view.progress.total} blocked={view.progress.blocked} />
          <span className="cell-sub">{view.progress.requiredOutstanding} required item(s) open</span>
        </div>
      </section>

      {view.progress.blocked > 0 ? (
        <p className="notice notice--critical"><Icon name="alert" size={14} /> {view.progress.blocked} checklist item(s) are blocked. This departure is not ready to sail.</p>
      ) : null}

      <div className="detail-grid">
        <div className="stack">
          <Panel title="Guest manifest" description="Bookings attached to this departure">
            <ul className="manifest">
              {view.bookings.map((booking) => {
                const customer = view.customers.find((entry) => entry.id === booking.customerId);
                return (
                  <li className="manifest-item" key={booking.id}>
                    <button type="button" className="manifest-item__head" onClick={() => navigate({ screen: 'booking', id: booking.id })}>
                      <span className="cell-strong">{customer?.displayName ?? 'Guest'}</span>
                      <span className="mono cell-sub">{booking.reference}</span>
                      <Icon name="chevron" size={14} />
                    </button>
                    <FieldGrid>
                      <Field label="Party">{booking.party.adults} adults / {booking.party.children} children</Field>
                      <Field label="Received"><span className="mono">{formatMoney(amountReceived(booking.payment))}</span></Field>
                      <Field label="Pickup" wide>{booking.pickup ? `${booking.pickup.location} at ${booking.pickup.time}${booking.pickup.transferIncluded ? ' · transfer included' : ''}` : 'Own transport to marina'}</Field>
                      <Field label="Requests" wide>
                        {booking.specialRequests.length === 0 ? <span className="cell-sub">None</span>
                          : <span className="chip-row">{booking.specialRequests.map((request) => <span className="chip" key={request}>{request}</span>)}</span>}
                      </Field>
                    </FieldGrid>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <PreparationBoard departureId={departure.id} />
        </div>

        <div className="stack">
          <ReadinessPanel departureId={departure.id} />
          <ResourceAssigner departureId={departure.id} />

          <Panel title="Operational notes">
            <FieldGrid columns={1}>
              <Field label="Departure note">{departure.notes}</Field>
              <Field label="Experience inclusions">
                <span className="chip-row">{(view.experience?.includes ?? []).map((item) => <span className="chip" key={item}>{item}</span>)}</span>
              </Field>
            </FieldGrid>
            <p className="notice"><Icon name="alert" size={14} /> Availability is not live. Resources shown are recorded assignments in a synthetic scenario.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}