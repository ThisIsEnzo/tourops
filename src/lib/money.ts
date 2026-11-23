/**
 * Money helpers. Amounts are integers in satang (1 THB = 100 satang).
 * Pure functions: usable from the data, state and UI layers.
 */
import type { Money, PaymentSummary, QuoteLineItem } from '../types/domain';

export const SATANG_PER_BAHT = 100;

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/** Build a THB amount from baht (up to two decimal places). */
export function thb(baht: number): Money {
  const amountMinor = Math.round(baht * SATANG_PER_BAHT);
  if (!Number.isFinite(amountMinor)) {
    throw new Error(`Invalid amount: ${baht}`);
  }
  return { amountMinor, currency: 'THB' };
}

export function zero(): Money {
  return { amountMinor: 0, currency: 'THB' };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function sumMoney(amounts: readonly Money[]): Money {
  return amounts.reduce<Money>((total, amount) => addMoney(total, amount), zero());
}

export function multiplyMoney(amount: Money, quantity: number): Money {
  return { amountMinor: Math.round(amount.amountMinor * quantity), currency: amount.currency };
}

/** Percentage of an amount, rounded to the nearest satang. */
export function percentOf(amount: Money, percent: number): Money {
  return { amountMinor: Math.round((amount.amountMinor * percent) / 100), currency: amount.currency };
}

export function quoteSubtotal(lineItems: readonly QuoteLineItem[]): Money {
  return sumMoney(lineItems.map((item) => multiplyMoney(item.unitPrice, item.quantity)));
}

export function quoteTotal(lineItems: readonly QuoteLineItem[], discount: Money | null): Money {
  const subtotal = quoteSubtotal(lineItems);
  return discount ? subtractMoney(subtotal, discount) : subtotal;
}

export function amountReceived(payment: PaymentSummary): Money {
  return addMoney(payment.depositReceived, payment.balanceReceived);
}

export function outstandingBalance(payment: PaymentSummary): Money {
  return subtractMoney(payment.total, amountReceived(payment));
}

const FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'THB',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Deterministic display string, e.g. `THB 28,000.00`. */
export function formatMoney(amount: Money): string {
  return FORMATTER.format(amount.amountMinor / SATANG_PER_BAHT);
}
