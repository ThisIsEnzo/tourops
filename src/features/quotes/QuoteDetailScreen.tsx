import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { DetailScreenProps } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Field, FieldGrid } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { findById } from '../../lib/selectors';
import { quoteBooking, quoteCustomer, quoteEnquiry, quoteExperience } from '../../lib/operations';
import { formatMoney, multiplyMoney, quoteSubtotal, subtractMoney } from '../../lib/money';
import { formatDate, formatDateTime } from '../../lib/datetime';
import { BOOKING_STATUS, QUOTE_STATUS } from '../../lib/status';

export function QuoteDetailScreen({ id, navigate }: DetailScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const quote = findById(dataset.quotes, id);
  if (!quote) {
    return (
      <div className="page">
        <PageHeader title="Quote not found" back={{ label: 'All quotes', onClick: () => navigate({ screen: 'quotes' }) }} />
        <Panel title="Nothing to show"><EmptyState title="Unknown reference" hint="This quote is not in the demo dataset." /></Panel>
      </div>
    );
  }

  const customer = quoteCustomer(dataset, quote);
  const enquiry = quoteEnquiry(dataset, quote);
  const experience = quoteExperience(dataset, quote);
  const booking = quoteBooking(dataset, quote);
  const subtotal = quoteSubtotal(quote.lineItems);
  const balance = subtractMoney(quote.total, quote.depositRequired);
  const depositPercent = quote.total.amountMinor === 0 ? 0 : Math.round((quote.depositRequired.amountMinor / quote.total.amountMinor) * 100);

  return (
    <div className="page">
      <PageHeader title={quote.reference} subtitle={`${experience?.name ?? 'Charter'} · issued ${formatDateTime(quote.issuedAt)}`}
        badge={<StatusBadge presentation={QUOTE_STATUS[quote.status]} />}
        crumbs={[
          { label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) },
          { label: 'Quotes', onClick: () => navigate({ screen: 'quotes' }) },
          { label: quote.reference },
        ]}
        back={{ label: 'All quotes', onClick: () => navigate({ screen: 'quotes' }) }}
      />

      <article className="quote-doc">
        <header className="quote-doc__head">
          <div>
            <p className="quote-doc__eyebrow">Charter quotation · concept demo</p>
            <h2 className="quote-doc__title">{experience?.name ?? 'Private charter'}</h2>
            <p className="quote-doc__ref mono">{quote.reference} · valid until {formatDate(quote.validUntil)}</p>
          </div>
          <div className="quote-doc__seal"><Icon name="anchor" size={22} /><span>Synthetic</span></div>
        </header>

        <div className="quote-parties">
          <div className="quote-party">
            <span className="quote-party__label">Operator</span>
            <strong>{dataset.meta.operatorName}</strong>
            <span>{dataset.meta.homePort}</span>
            <span>{dataset.meta.timezone} · THB</span>
          </div>
          <div className="quote-party">
            <span className="quote-party__label">Prepared for</span>
            <strong>{customer?.displayName ?? 'Guest'}</strong>
            <span>{customer?.contactName ?? ''}</span>
            <span className="mono fake-contact">{customer?.email ?? ''}</span>
          </div>
          <div className="quote-party">
            <span className="quote-party__label">Linked enquiry</span>
            {enquiry ? (
              <button type="button" className="link-button mono" onClick={() => navigate({ screen: 'enquiry', id: enquiry.id })}>
                {enquiry.reference} <Icon name="arrow" size={13} />
              </button>
            ) : <span>—</span>}
            <span>{enquiry ? formatDate(enquiry.preferredDate) : ''}</span>
            <span>{enquiry ? `${enquiry.party.adults} adults / ${enquiry.party.children} children` : ''}</span>
          </div>
        </div>

        <table className="quote-lines">
          <thead>
            <tr><th>Description</th><th className="is-right">Qty</th><th className="is-right">Unit price</th><th className="is-right">Line total</th></tr>
          </thead>
          <tbody>
            {quote.lineItems.map((line) => (
              <tr key={line.id}>
                <td data-label="Description">{line.label}</td>
                <td data-label="Qty" className="is-right mono">{line.quantity}</td>
                <td data-label="Unit price" className="is-right mono">{formatMoney(line.unitPrice)}</td>
                <td data-label="Line total" className="is-right mono cell-strong">{formatMoney(multiplyMoney(line.unitPrice, line.quantity))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="quote-totals">
          <div className="quote-total-row"><span>Subtotal</span><span className="mono">{formatMoney(subtotal)}</span></div>
          {quote.discount ? (
            <div className="quote-total-row is-discount"><span>Discount</span><span className="mono">−{formatMoney(quote.discount)}</span></div>
          ) : null}
          <div className="quote-total-row quote-total-row--grand"><span>Total</span><span className="mono">{formatMoney(quote.total)}</span></div>
          <div className="quote-total-row"><span>Deposit required ({depositPercent}%)</span><span className="mono">{formatMoney(quote.depositRequired)}</span></div>
          <div className="quote-total-row"><span>Balance</span><span className="mono">{formatMoney(balance)}</span></div>
        </div>

        <div className="quote-terms">
          <FieldGrid columns={1}>
            <Field label="Terms">{quote.terms}</Field>
            {quote.notes ? <Field label="Internal notes">{quote.notes}</Field> : null}
          </FieldGrid>
        </div>

        <p className="notice"><Icon name="alert" size={14} /> Presentation view. Sending, PDF export, acceptance and payment capture are deliberately not implemented in this concept demo.</p>
      </article>

      {booking ? (
        <Panel title="Converted booking">
          <button type="button" className="related-row" onClick={() => navigate({ screen: 'booking', id: booking.id })}>
            <span className="related-row__kind">Booking</span>
            <span className="related-row__title mono">{booking.reference}</span>
            <span className="related-row__meta">{formatMoney(booking.payment.total)}</span>
            <StatusBadge presentation={BOOKING_STATUS[booking.status]} />
            <Icon name="chevron" size={14} />
          </button>
        </Panel>
      ) : null}
    </div>
  );
}