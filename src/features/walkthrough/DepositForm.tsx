import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import { Panel } from '../../components/ui/Panel';
import { Icon } from '../../components/ui/Icon';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PAYMENT_STATUS } from '../../lib/status';
import { amountReceived, formatMoney, outstandingBalance } from '../../lib/money';
import type { PaymentEntry, PaymentMethod } from '../../types/domain';
import type { WorkflowResult } from '../../lib/workflow';
import { WorkflowFeedback } from './WorkflowFeedback';

const METHODS: readonly { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'agent_voucher', label: 'Agent voucher' },
];

/** Simulated bookkeeping entry. No provider, no funds movement, no card data. */
export function DepositForm({ bookingId }: { bookingId: string }): ReactNode {
  const { dataset, recordDeposit } = useDemoData();
  const booking = dataset.bookings.find((row) => row.id === bookingId) ?? null;
  const sequence = useRef(0);
  const [amountBaht, setAmountBaht] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [result, setResult] = useState<WorkflowResult<PaymentEntry> | null>(null);

  if (!booking) return null;

  const payment = booking.payment;
  const received = amountReceived(payment);
  const outstanding = outstandingBalance(payment);
  const depositGap = payment.depositRequired.amountMinor - payment.depositReceived.amountMinor;
  const settled = outstanding.amountMinor <= 0;

  const submit = (): void => {
    sequence.current += 1;
    setResult(recordDeposit({
      bookingId,
      amountMinor: Math.round((Number.parseFloat(amountBaht) || 0) * 100),
      method,
      submissionId: `ui-${bookingId}-${Date.now()}-${sequence.current}`,
    }));
    setAmountBaht('');
  };

  return (
    <Panel
      title="Simulated deposit"
      description={`${booking.reference} · bookkeeping only, no money is transferred`}
      actions={<StatusBadge presentation={PAYMENT_STATUS[payment.status]} />}
    >
      <Meter done={received.amountMinor} total={payment.total.amountMinor}
        label={`${formatMoney(received)} of ${formatMoney(payment.total)}`} />

      <dl className="wf-totals">
        <div><dt>Required deposit</dt><dd className="mono">{formatMoney(payment.depositRequired)}</dd></div>
        <div><dt>Received</dt><dd className="mono">{formatMoney(received)}</dd></div>
        <div className="is-grand"><dt>Outstanding</dt><dd className="mono">{formatMoney(outstanding)}</dd></div>
      </dl>

      {settled ? (
        <p className="wf-note is-ok"><Icon name="check" size={14} /> This booking is fully settled.</p>
      ) : (
        <>
          <div className="wf-grid">
            <label className="wf-field wf-field--grow">
              <span>Amount THB</span>
              <input type="number" min={0} step={100} value={amountBaht} placeholder="0"
                onChange={(event) => setAmountBaht(event.target.value)} />
            </label>
            <label className="wf-field">
              <span>Method</span>
              <select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
                {METHODS.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
              </select>
            </label>
          </div>
          <div className="wf-actions">
            {depositGap > 0 ? (
              <button type="button" className="wf-ghost" onClick={() => setAmountBaht(String(depositGap / 100))}>
                Fill deposit due
              </button>
            ) : null}
            <button type="button" className="wf-ghost" onClick={() => setAmountBaht(String(outstanding.amountMinor / 100))}>
              Fill full balance
            </button>
            <button type="button" className="wf-primary" onClick={submit}>
              Record simulated payment <Icon name="check" size={14} />
            </button>
          </div>
        </>
      )}
      <WorkflowFeedback result={result} />
    </Panel>
  );
}