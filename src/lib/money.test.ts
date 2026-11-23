import { describe, expect, it } from 'vitest';
import type { PaymentSummary, QuoteLineItem } from '../types/domain';
import { formatMoney, outstandingBalance, percentOf, quoteTotal, thb } from './money';

const lineItems: readonly QuoteLineItem[] = [
  { id: 't-1', label: 'Sunset cruise', quantity: 1, unitPrice: thb(18000) },
  { id: 't-2', label: 'Canapés', quantity: 14, unitPrice: thb(450) },
];

describe('money', () => {
  it('stores amounts as integer satang', () => {
    expect(thb(18000).amountMinor).toBe(1800000);
  });

  it('totals line items and applies a discount', () => {
    expect(quoteTotal(lineItems, null).amountMinor).toBe(2430000);
    expect(quoteTotal(lineItems, thb(800)).amountMinor).toBe(2350000);
  });

  it('rounds a deposit percentage to the nearest satang', () => {
    expect(percentOf(thb(28000), 30).amountMinor).toBe(840000);
  });

  it('formats money deterministically', () => {
    expect(formatMoney(thb(28000))).toBe('THB 28,000.00');
  });

  it('computes the outstanding balance', () => {
    const payment: PaymentSummary = {
      status: 'partially_paid', total: thb(56100), depositRequired: thb(28050),
      depositReceived: thb(28050), balanceReceived: thb(10000),
      depositDueOn: null, balanceDueOn: null, method: 'bank_transfer', lastUpdatedAt: null,
    };
    expect(outstandingBalance(payment).amountMinor).toBe(1805000);
  });
});
