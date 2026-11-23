import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { Route } from '../../app/navigation';
import { Panel } from '../../components/ui/Panel';
import { Icon } from '../../components/ui/Icon';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { QUOTE_STATUS } from '../../lib/status';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/datetime';
import type { Booking, Quote } from '../../types/domain';
import type { ConversionResult, WorkflowResult } from '../../lib/workflow';
import { WorkflowFeedback } from './WorkflowFeedback';

/** Quote decision + conversion. Duplicate conversion is impossible: the button disappears. */
export function QuoteActions({ quoteId, navigate }: { quoteId: string; navigate: (route: Route) => void }): ReactNode {
  const { dataset, sendQuote, acceptQuote, convertQuoteToBooking } = useDemoData();
  const [result, setResult] = useState<WorkflowResult<Quote | ConversionResult> | null>(null);
  const quote = dataset.quotes.find((row) => row.id === quoteId) ?? null;
  if (!quote) return null;

  const booking: Booking | undefined = dataset.bookings.find((row) => row.quoteId === quote.id);

  return (
    <Panel
      title="Quote decision"
      description={`${quote.reference} · ${formatMoney(quote.total)} · valid until ${formatDate(quote.validUntil)}`}
      actions={<StatusBadge presentation={QUOTE_STATUS[quote.status]} />}
    >
      <p className="wf-note">
        <Icon name="alert" size={13} /> Sending is simulated — no message leaves this demo.
      </p>

      <div className="wf-actions">
        {quote.status === 'draft' ? (
          <button type="button" className="wf-primary" onClick={() => setResult(sendQuote(quote.id))}>
            Mark as sent <Icon name="arrow" size={14} />
          </button>
        ) : null}
        {quote.status === 'sent' ? (
          <button type="button" className="wf-primary" onClick={() => setResult(acceptQuote(quote.id))}>
            Accept quote <Icon name="check" size={14} />
          </button>
        ) : null}
        {quote.status === 'accepted' && !booking ? (
          <button type="button" className="wf-primary" onClick={() => setResult(convertQuoteToBooking({ quoteId: quote.id }))}>
            Convert to booking <Icon name="bookings" size={14} />
          </button>
        ) : null}
        <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'quote', id: quote.id })}>
          Open quote document
        </button>
        {booking ? (
          <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'booking', id: booking.id })}>
            Open {booking.reference} <Icon name="chevron" size={13} />
          </button>
        ) : null}
      </div>

      {booking ? <p className="wf-note is-ok"><Icon name="check" size={13} /> Already converted — a second conversion is blocked.</p> : null}
      <WorkflowFeedback result={result} />
    </Panel>
  );
}