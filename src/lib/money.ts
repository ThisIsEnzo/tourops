/**
 * Money helpers. Amounts are integers in satang (1 THB = 100 satang).
 * Pure functions: usable from the data, domain, state and UI layers.
 */
import type { Money, PaymentSummary, QuoteLineItem } from '../types/domain';
import { formatMinorUnits } from '../shared/money/format';

export const SATANG_PER_BAHT = 100;

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/**
 * The single constructor for a THB amount expressed in minor units.
 * Presentation code must use this instead of round-tripping through baht.
 */
export function fromMinor(amountMinor: number): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`Amount in satang must be an integer, received ${amountMinor}`);
  }
  return { amountMinor, currency: 'THB' };
}

/** Build a THB amount from baht (up to two decimal places). */
export function thb(baht: number): Money {
  const amountMinor = Math.round(baht * SATANG_PER_BAHT);
  if (!Number.isFinite(amountMinor)) {
    throw new Error(`Invalid amount: ${baht}`);
  }
  return fromMinor(amountMinor);
}

export function zero(): Money {
  return fromMinor(0);
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return fromMinor(a.amountMinor + b.amountMinor);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return fromMinor(a.amountMinor - b.amountMinor);
}

export function sumMoney(amounts: readonly Money[]): Money {
  return amounts.reduce<Money>((total, amount) => addMoney(total, amount), zero());
}

export function multiplyMoney(amount: Money, quantity: number): Money {
  return fromMinor(Math.round(amount.amountMinor * quantity));
}

/** Percentage of an amount, rounded to the nearest satang. */
export function percentOf(amount: Money, percent: number): Money {
  return fromMinor(Math.round((amount.amountMinor * percent) / 100));
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

/** TourOps currency policy stays here; the formatting engine is market-agnostic. */
const THB_FORMAT = { currency: 'THB', locale: 'en-GB', minorUnitDigits: 2, currencyDisplay: 'code' } as const;
export function formatMoney(amount: Money): string {
  return formatMinorUnits(amount.amountMinor, THB_FORMAT);
}