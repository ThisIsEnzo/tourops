import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { DetailScreenProps } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Field, FieldGrid } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { enquiryCustomer, enquiryExperience } from '../../lib/operations';
import { findById, partySize } from '../../lib/selectors';
import { formatDate, formatDateTime } from '../../lib/datetime';
import { formatMoney } from '../../lib/money';
import { CHANNEL_LABEL, ENQUIRY_STATUS, LANGUAGE_LABEL, QUOTE_STATUS, BOOKING_STATUS } from '../../lib/status';

export function EnquiryDetailScreen({ id, navigate }: DetailScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const enquiry = findById(dataset.enquiries, id);
  if (!enquiry) {
    return (
      <div className="page">
        <PageHeader title="Enquiry not found" back={{ label: 'All enquiries', onClick: () => navigate({ screen: 'enquiries' }) }} />
        <Panel title="Nothing to show"><EmptyState title="Unknown reference" hint="This enquiry is not in the demo dataset." /></Panel>
      </div>
    );
  }

  const customer = enquiryCustomer(dataset, enquiry);
  const experience = enquiryExperience(dataset, enquiry);
  const quote = enquiry.quoteId ? findById(dataset.quotes, enquiry.quoteId) : undefined;
  const booking = enquiry.bookingId ? findById(dataset.bookings, enquiry.bookingId) : undefined;
  const steps = [
    { label: 'Received', done: true, detail: formatDateTime(enquiry.receivedAt) },
    { label: 'Quoted', done: quote !== undefined, detail: quote ? formatDateTime(quote.issuedAt) : 'not yet' },
    { label: 'Booked', done: booking !== undefined, detail: booking?.confirmedAt ? formatDateTime(booking.confirmedAt) : 'not yet' },
  ];

  return (
    <div className="page">
      <PageHeader
        title={customer?.displayName ?? enquiry.reference}
        subtitle={`${enquiry.reference} · received ${formatDateTime(enquiry.receivedAt)}`}
        badge={<StatusBadge presentation={ENQUIRY_STATUS[enquiry.status]} />}
        crumbs={[
          { label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) },
          { label: 'Enquiries', onClick: () => navigate({ screen: 'enquiries' }) },
          { label: enquiry.reference },
        ]}
        back={{ label: 'All enquiries', onClick: () => navigate({ screen: 'enquiries' }) }}
      />

      <ol className="timeline">
        {steps.map((step) => (
          <li key={step.label} className={step.done ? 'timeline-step is-done' : 'timeline-step'}>
            <span className="timeline-step__dot"><Icon name={step.done ? 'check' : 'clock'} size={12} /></span>
            <span className="timeline-step__label">{step.label}</span>
            <span className="timeline-step__detail">{step.detail}</span>
          </li>
        ))}
      </ol>

      <div className="detail-grid">
        <Panel title="Enquiry" description="Read-only view of the guest request">
          <FieldGrid>
            <Field label="Reference"><span className="mono">{enquiry.reference}</span></Field>
            <Field label="Status"><StatusBadge presentation={ENQUIRY_STATUS[enquiry.status]} /></Field>
            <Field label="Experience">{experience?.name ?? 'Not specified'}</Field>
            <Field label="Channel">{CHANNEL_LABEL[enquiry.channel]}</Field>
            <Field label="Preferred date">{formatDate(enquiry.preferredDate)}</Field>
            <Field label="Date flexibility">{enquiry.flexibleDates ? 'Flexible' : 'Fixed date'}</Field>
            <Field label="Guests">{partySize(enquiry.party)} total · {enquiry.party.adults} adults / {enquiry.party.children} children</Field>
            <Field label="Estimated value"><span className="mono">{enquiry.estimatedValue ? formatMoney(enquiry.estimatedValue) : 'Not estimated'}</span></Field>
            <Field label="Pickup" wide>{enquiry.pickupLocation ?? 'Guest makes own way to the marina'}</Field>
            <Field label="Special requests" wide>
              {enquiry.specialRequests.length === 0 ? <span className="cell-sub">None recorded</span> : (
                <span className="chip-row">{enquiry.specialRequests.map((request) => <span className="chip" key={request}>{request}</span>)}</span>
              )}
            </Field>
            <Field label="Notes" wide>{enquiry.notes}</Field>
          </FieldGrid>
        </Panel>

        <div className="stack">
          <Panel title="Customer" description="Synthetic contact record — not a real person">
            <FieldGrid columns={1}>
              <Field label="Name">{customer?.displayName ?? '—'}</Field>
              <Field label="Contact">{customer?.contactName ?? '—'}</Field>
              <Field label="Preferred channel">{customer ? CHANNEL_LABEL[customer.preferredChannel] : '—'}</Field>
              <Field label="Phone"><span className="mono fake-contact">{customer?.phone ?? '—'}</span><span className="chip chip--muted">non-callable placeholder</span></Field>
              <Field label="Email"><span className="mono fake-contact">{customer?.email ?? '—'}</span></Field>
              <Field label="Language">{customer ? LANGUAGE_LABEL[customer.preferredLanguage] : '—'}</Field>
              <Field label="Guest history">{customer?.repeatGuest ? 'Repeat guest' : 'First enquiry'}</Field>
              <Field label="Notes">{customer?.notes ?? '—'}</Field>
            </FieldGrid>
          </Panel>

          <Panel title="Related records">
            <div className="related-list">
              {quote ? (
                <button type="button" className="related-row" onClick={() => navigate({ screen: 'quote', id: quote.id })}>
                  <span className="related-row__kind">Quote</span>
                  <span className="related-row__title mono">{quote.reference}</span>
                  <span className="related-row__meta">{formatMoney(quote.total)}</span>
                  <StatusBadge presentation={QUOTE_STATUS[quote.status]} />
                  <Icon name="chevron" size={14} />
                </button>
              ) : null}
              {booking ? (
                <button type="button" className="related-row" onClick={() => navigate({ screen: 'booking', id: booking.id })}>
                  <span className="related-row__kind">Booking</span>
                  <span className="related-row__title mono">{booking.reference}</span>
                  <span className="related-row__meta">{partySize(booking.party)} guests</span>
                  <StatusBadge presentation={BOOKING_STATUS[booking.status]} />
                  <Icon name="chevron" size={14} />
                </button>
              ) : null}
              {!quote && !booking ? (
                <EmptyState title="No linked records yet" hint="Quotes and bookings appear here once the scenario progresses (TO-01C)." />
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}