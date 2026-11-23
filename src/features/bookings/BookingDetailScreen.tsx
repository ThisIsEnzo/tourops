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
import { findById } from '../../lib/selectors';
import { bookingCustomer, bookingExperience, departureView, guestsOf } from '../../lib/operations';
import { amountReceived, formatMoney, outstandingBalance } from '../../lib/money';
import { formatDate, formatDateTime, formatTimeRange } from '../../lib/datetime';
import { ASSIGNMENT_STATUS, BOOKING_STATUS, CHECKLIST_STATUS, PAYMENT_STATUS, QUOTE_STATUS, RESOURCE_KIND_LABEL } from '../../lib/status';

export function BookingDetailScreen({ id, navigate }: DetailScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const booking = findById(dataset.bookings, id);
  if (!booking) {
    return (
      <div className="page">
        <PageHeader title="Booking not found" back={{ label: 'All bookings', onClick: () => navigate({ screen: 'bookings' }) }} />
        <Panel title="Nothing to show"><EmptyState title="Unknown reference" hint="This booking is not in the demo dataset." /></Panel>
      </div>
    );
  }

  const customer = bookingCustomer(dataset, booking);
  const experience = bookingExperience(dataset, booking);
  const view = booking.departureId ? departureView(dataset, booking.departureId) : null;
  const quote = booking.quoteId ? findById(dataset.quotes, booking.quoteId) : undefined;
  const payment = booking.payment;
  const received = amountReceived(payment);
  const outstanding = outstandingBalance(payment);
  const paidPercent = payment.total.amountMinor === 0 ? 0 : Math.round((received.amountMinor / payment.total.amountMinor) * 100);

  return (
    <div className="page">
      <PageHeader title={booking.reference}
        subtitle={`${experience?.name ?? 'Charter'} · ${customer?.displayName ?? 'Guest'}`}
        badge={<StatusBadge presentation={BOOKING_STATUS[booking.status]} />}
        crumbs={[
          { label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) },
          { label: 'Bookings', onClick: () => navigate({ screen: 'bookings' }) },
          { label: booking.reference },
        ]}
        back={{ label: 'All bookings', onClick: () => navigate({ screen: 'bookings' }) }}
        actions={view ? <button type="button" onClick={() => navigate({ screen: 'departure', id: view.departure.id })}>Open run sheet</button> : undefined}
      />

      <div className="detail-grid">
        <div className="stack">
          <Panel title="Trip" description="Read-only booking record">
            <FieldGrid>
              <Field label="Experience">{experience?.name ?? '—'}</Field>
              <Field label="Departure">{view ? `${formatDate(view.departure.date)} · ${formatTimeRange(view.departure.departureTime, view.departure.returnTime)}` : 'Not scheduled'}</Field>
              <Field label="Guests">{guestsOf(booking)} total · {booking.party.adults} adults / {booking.party.children} children</Field>
              <Field label="Vessel">{view?.vessel?.name ?? 'Not assigned'}</Field>
              <Field label="Confirmed">{booking.confirmedAt ? formatDateTime(booking.confirmedAt) : 'Not confirmed'}</Field>
              <Field label="Meeting point">{view?.departure.meetingPoint ?? dataset.meta.homePort}</Field>
              <Field label="Pickup" wide>
                {booking.pickup
                  ? `${booking.pickup.location} at ${booking.pickup.time}${booking.pickup.transferIncluded ? ' · transfer included' : ''}${booking.pickup.note ? ` · ${booking.pickup.note}` : ''}`
                  : 'Guest arranges own transport'}
              </Field>
              <Field label="Special requests" wide>
                {booking.specialRequests.length === 0 ? <span className="cell-sub">None recorded</span>
                  : <span className="chip-row">{booking.specialRequests.map((request) => <span className="chip" key={request}>{request}</span>)}</span>}
              </Field>
              <Field label="Notes" wide>{booking.notes}</Field>
            </FieldGrid>
          </Panel>

          <Panel title="Payment summary" description="Manually recorded — TourOps does not process payments">
            <div className="payment-head">
              <StatusBadge presentation={PAYMENT_STATUS[payment.status]} />
              <span className="payment-head__pct">{paidPercent}% received</span>
            </div>
            <Meter done={received.amountMinor} total={payment.total.amountMinor}
              label={`${formatMoney(received)} of ${formatMoney(payment.total)}`} />
            <FieldGrid>
              <Field label="Booking total"><span className="mono cell-strong">{formatMoney(payment.total)}</span></Field>
              <Field label="Received"><span className="mono">{formatMoney(received)}</span></Field>
              <Field label="Deposit required"><span className="mono">{formatMoney(payment.depositRequired)}</span></Field>
              <Field label="Deposit received"><span className="mono">{formatMoney(payment.depositReceived)}</span></Field>
              <Field label="Outstanding"><span className={outstanding.amountMinor > 0 ? 'mono is-critical' : 'mono'}>{formatMoney(outstanding)}</span></Field>
              <Field label="Method">{payment.method ? payment.method.replace('_', ' ') : 'Not recorded'}</Field>
              <Field label="Deposit due">{payment.depositDueOn ? formatDate(payment.depositDueOn) : '—'}</Field>
              <Field label="Balance due">{payment.balanceDueOn ? formatDate(payment.balanceDueOn) : '—'}</Field>
              <Field label="Last update">{payment.lastUpdatedAt ? formatDateTime(payment.lastUpdatedAt) : '—'}</Field>
              <Field label="Note" wide>{payment.note ?? '—'}</Field>
            </FieldGrid>
          </Panel>
        </div>

        <div className="stack">
          <Panel title="Customer" description="Synthetic contact record">
            <FieldGrid columns={1}>
              <Field label="Name">{customer?.displayName ?? '—'}</Field>
              <Field label="Contact">{customer?.contactName ?? '—'}</Field>
              <Field label="Phone"><span className="mono fake-contact">{customer?.phone ?? '—'}</span><span className="chip chip--muted">non-callable placeholder</span></Field>
              <Field label="Email"><span className="mono fake-contact">{customer?.email ?? '—'}</span></Field>
            </FieldGrid>
          </Panel>

          <Panel title="Related records">
            <div className="related-list">
              {quote ? (
                <button type="button" className="related-row" onClick={() => navigate({ screen: 'quote', id: quote.id })}>
                  <span className="related-row__kind">Quote</span>
                  <span className="related-row__title mono">{quote.reference}</span>
                  <StatusBadge presentation={QUOTE_STATUS[quote.status]} />
                  <Icon name="chevron" size={14} />
                </button>
              ) : null}
              {booking.enquiryId ? (
                <button type="button" className="related-row" onClick={() => navigate({ screen: 'enquiry', id: booking.enquiryId as string })}>
                  <span className="related-row__kind">Enquiry</span>
                  <span className="related-row__title mono">{findById(dataset.enquiries, booking.enquiryId)?.reference ?? booking.enquiryId}</span>
                  <Icon name="chevron" size={14} />
                </button>
              ) : null}
              {view ? (
                <button type="button" className="related-row" onClick={() => navigate({ screen: 'departure', id: view.departure.id })}>
                  <span className="related-row__kind">Departure</span>
                  <span className="related-row__title mono">{view.departure.reference}</span>
                  <span className="related-row__meta">{formatDate(view.departure.date)}</span>
                  <Icon name="chevron" size={14} />
                </button>
              ) : null}
            </div>
          </Panel>

          {view ? (
            <Panel title="Resources & readiness" description="Assignments recorded for this departure">
              <Meter done={view.progress.done} total={view.progress.total} blocked={view.progress.blocked} />
              <ul className="assign-list">
                {dataset.assignments.filter((assignment) => assignment.departureId === view.departure.id).map((assignment) => {
                  const name = assignment.kind === 'vessel' ? findById(dataset.vessels, assignment.resourceId)?.name
                    : assignment.kind === 'crew' ? findById(dataset.crew, assignment.resourceId)?.fullName
                    : assignment.kind === 'guide' ? findById(dataset.guides, assignment.resourceId)?.fullName
                    : findById(dataset.equipment, assignment.resourceId)?.name;
                  return (
                    <li className="assign-row" key={assignment.id}>
                      <span className="assign-row__kind">{RESOURCE_KIND_LABEL[assignment.kind]}</span>
                      <span className="assign-row__name">{name ?? assignment.resourceId}{assignment.units > 1 ? ` × ${assignment.units}` : ''}</span>
                      <StatusBadge presentation={ASSIGNMENT_STATUS[assignment.status]} />
                    </li>
                  );
                })}
              </ul>
              <ul className="check-list">
                {view.checklist.filter((item) => item.status !== 'done').map((item) => (
                  <li className="check-item" key={item.id}>
                    <StatusBadge presentation={CHECKLIST_STATUS[item.status]} />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}