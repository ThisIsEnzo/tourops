/**
 * Seeded simulated payment ledger. Amounts reconcile exactly with the payment
 * summaries in src/data/bookings.ts. Synthetic bookkeeping only.
 */
import type { PaymentEntry } from '../types/domain';
import { thb } from '../lib/money';

export const payments: readonly PaymentEntry[] = [
  {
    id: 'demo-pay-001',
    bookingId: 'demo-bkg-001',
    kind: 'deposit',
    amount: thb(8400),
    method: 'bank_transfer',
    recordedAt: '2026-11-17T15:20:00+07:00',
    submissionId: 'demo-sub-001',
    note: 'Agent transfer received; balance collected on the day.',
  },
  {
    id: 'demo-pay-002',
    bookingId: 'demo-bkg-002',
    kind: 'deposit',
    amount: thb(28050),
    method: 'bank_transfer',
    recordedAt: '2026-11-13T10:05:00+07:00',
    submissionId: 'demo-sub-002',
    note: 'Corporate deposit (50%).',
  },
  {
    id: 'demo-pay-003',
    bookingId: 'demo-bkg-002',
    kind: 'balance',
    amount: thb(10000),
    method: 'bank_transfer',
    recordedAt: '2026-11-20T11:40:00+07:00',
    submissionId: 'demo-sub-003',
    note: 'Part payment of the balance.',
  },
];