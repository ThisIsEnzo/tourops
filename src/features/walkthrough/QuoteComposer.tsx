import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { Route } from '../../app/navigation';
import { Panel } from '../../components/ui/Panel';
import { Icon } from '../../components/ui/Icon';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatMoney, fromMinor, percentOf, quoteSubtotal, quoteTotal } from '../../lib/money';
import type { Quote, QuoteLineItem } from '../../types/domain';
import type { QuoteLineInput, WorkflowResult } from '../../lib/workflow';
import { WorkflowFeedback } from './WorkflowFeedback';

interface EditableLine {
  readonly key: number;
  readonly label: string;
  readonly quantity: string;
  readonly unitPriceBaht: string;
}

function toInput(line: EditableLine): QuoteLineInput {
  return {
    label: line.label,
    quantity: Number.parseInt(line.quantity, 10) || 0,
    unitPriceMinor: Math.round((Number.parseFloat(line.unitPriceBaht) || 0) * 100),
  };
}

/** Quote creation surface. Every number is produced by the shared money utilities. */
export function QuoteComposer({ enquiryId, navigate }: { enquiryId: string; navigate: (route: Route) => void }): ReactNode {
  const { dataset, prepareQuoteFromEnquiry, createQuote } = useDemoData();
  const enquiry = dataset.enquiries.find((row) => row.id === enquiryId) ?? null;
  const [seed] = useState(() => prepareQuoteFromEnquiry(dataset, enquiryId));
  const [lines, setLines] = useState<readonly EditableLine[]>(() =>
    seed.ok
      ? seed.value.lineItems.map((line, index) => ({
        key: index, label: line.label, quantity: String(line.quantity), unitPriceBaht: String(line.unitPriceMinor / 100),
      }))
      : [{ key: 0, label: '', quantity: '1', unitPriceBaht: '0' }],
  );
  const [discountBaht, setDiscountBaht] = useState('0');
  const [depositPercent, setDepositPercent] = useState(seed.ok ? seed.value.suggestedDepositPercent : 30);
  const [validUntil, setValidUntil] = useState(seed.ok ? seed.value.validUntil : dataset.meta.referenceDate);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<WorkflowResult<Quote> | null>(null);

  const preview = useMemo(() => {
    const items: readonly QuoteLineItem[] = lines.map((line) => {
      const input = toInput(line);
      return { id: String(line.key), label: input.label, quantity: input.quantity, unitPrice: fromMinor(input.unitPriceMinor) };
    });
    const discountMinor = Math.round((Number.parseFloat(discountBaht) || 0) * 100);
    const discount = discountMinor > 0 ? fromMinor(discountMinor) : null;
    const subtotal = quoteSubtotal(items);
    const total = quoteTotal(items, discount);
    return { subtotal, discount, total, deposit: percentOf(total, depositPercent) };
  }, [lines, discountBaht, depositPercent]);

  if (!enquiry) {
    return <Panel title="Prepare quote"><EmptyState title="Enquiry unavailable" hint="Pick an enquiry from the pipeline first." /></Panel>;
  }

  if (enquiry.quoteId) {
    const quote = dataset.quotes.find((row) => row.id === enquiry.quoteId);
    return (
      <Panel title="Quote prepared" description={`${enquiry.reference} already carries a quote`}>
        <p className="wf-note"><Icon name="check" size={14} /> Pricing exists for this enquiry. Continue with the quote decision.</p>
        {quote ? (
          <button type="button" className="wf-primary" onClick={() => navigate({ screen: 'quote', id: quote.id })}>
            Open {quote.reference} <Icon name="chevron" size={14} />
          </button>
        ) : null}
        <WorkflowFeedback result={result} />
      </Panel>
    );
  }

  const patchLine = (key: number, patch: Partial<EditableLine>): void =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const submit = (): void => {
    setResult(createQuote({
      enquiryId,
      lineItems: lines.map(toInput),
      discountMinor: Math.round((Number.parseFloat(discountBaht) || 0) * 100),
      depositPercent,
      validUntil,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    }));
  };

  return (
    <Panel title="Prepare quote" description={`${enquiry.reference} · ${enquiry.party.adults + enquiry.party.children} guests · pricing is simulated`}>
      <div className="wf-lines">
        {lines.map((line, index) => (
          <div className="wf-line" key={line.key}>
            <label className="wf-field wf-field--grow">
              <span>Line item {index + 1}</span>
              <input value={line.label} onChange={(event) => patchLine(line.key, { label: event.target.value })} />
            </label>
            <label className="wf-field wf-field--xs">
              <span>Qty</span>
              <input type="number" min={1} step={1} value={line.quantity}
                onChange={(event) => patchLine(line.key, { quantity: event.target.value })} />
            </label>
            <label className="wf-field wf-field--sm">
              <span>Unit THB</span>
              <input type="number" min={0} step={50} value={line.unitPriceBaht}
                onChange={(event) => patchLine(line.key, { unitPriceBaht: event.target.value })} />
            </label>
            <button type="button" className="wf-icon-button" aria-label={`Remove line item ${index + 1}`}
              onClick={() => setLines((current) => current.filter((row) => row.key !== line.key))}>
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="wf-ghost"
        onClick={() => setLines((current) => [...current, { key: current.length + 1000, label: 'Additional service', quantity: '1', unitPriceBaht: '0' }])}>
        <Icon name="arrow" size={13} /> Add line item
      </button>

      <div className="wf-grid">
        <label className="wf-field">
          <span>Discount THB</span>
          <input type="number" min={0} step={100} value={discountBaht} onChange={(event) => setDiscountBaht(event.target.value)} />
        </label>
        <label className="wf-field">
          <span>Valid until</span>
          <input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
        </label>
        <label className="wf-field wf-field--grow">
          <span>Deposit {depositPercent}%</span>
          <input type="range" min={5} max={100} step={5} value={depositPercent}
            onChange={(event) => setDepositPercent(Number.parseInt(event.target.value, 10))} />
        </label>
      </div>

      <label className="wf-field">
        <span>Internal note</span>
        <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional note for the operator, never sent to a guest." />
      </label>

      <dl className="wf-totals">
        <div><dt>Subtotal</dt><dd className="mono">{formatMoney(preview.subtotal)}</dd></div>
        <div><dt>Discount</dt><dd className="mono">{preview.discount ? `−${formatMoney(preview.discount)}` : formatMoney(fromMinor(0))}</dd></div>
        <div className="is-grand"><dt>Total</dt><dd className="mono">{formatMoney(preview.total)}</dd></div>
        <div><dt>Required deposit</dt><dd className="mono">{formatMoney(preview.deposit)}</dd></div>
      </dl>

      <button type="button" className="wf-primary" onClick={submit}>Create quote</button>
      <WorkflowFeedback result={result} />
    </Panel>
  );
}