/**
 * Fictional quotes. Totals and deposits are derived with the money helpers so
 * the dataset can never drift from its own arithmetic.
 */
import type { Quote, QuoteLineItem } from '../types/domain';
import { percentOf, quoteTotal, thb } from '../lib/money';

const items001: readonly QuoteLineItem[] = [
  { id: 'demo-qli-001-1', label: 'Snorkelling day trip — private boat', quantity: 1, unitPrice: thb(26000) },
  { id: 'demo-qli-001-2', label: 'Snorkel gear set', quantity: 8, unitPrice: thb(350) },
  { id: 'demo-qli-001-3', label: 'Hotel transfer — round trip', quantity: 1, unitPrice: thb(1800) },
];

const items002: readonly QuoteLineItem[] = [
  { id: 'demo-qli-002-1', label: 'Sunset cruise — Sea Quartz', quantity: 1, unitPrice: thb(18000) },
  { id: 'demo-qli-002-2', label: 'Canapés service', quantity: 14, unitPrice: thb(450) },
  { id: 'demo-qli-002-3', label: 'Acoustic duo (2 hours)', quantity: 1, unitPrice: thb(4500) },
];

const items003: readonly QuoteLineItem[] = [
  { id: 'demo-qli-003-1', label: 'Private catamaran charter — Blue Horizon', quantity: 1, unitPrice: thb(42000) },
  { id: 'demo-qli-003-2', label: 'Premium catering', quantity: 18, unitPrice: thb(650) },
  { id: 'demo-qli-003-3', label: 'Paddleboard rental', quantity: 2, unitPrice: thb(1200) },
];

const items004: readonly QuoteLineItem[] = [
  { id: 'demo-qli-004-1', label: 'Sport fishing — Rayong banks', quantity: 1, unitPrice: thb(34000) },
  { id: 'demo-qli-004-2', label: 'Bait and tackle', quantity: 6, unitPrice: thb(400) },
];

const discount002 = thb(800);
const total001 = quoteTotal(items001, null);
const total002 = quoteTotal(items002, discount002);
const total003 = quoteTotal(items003, null);
const total004 = quoteTotal(items004, null);

export const quotes: readonly Quote[] = [
  {
    id: 'demo-quo-001', reference: 'QUO-2611-031', enquiryId: 'demo-enq-002', status: 'sent',
    issuedAt: '2026-11-21T10:05:00+07:00', validUntil: '2026-11-26',
    lineItems: items001, discount: null, total: total001, depositRequired: percentOf(total001, 30),
    terms: '30% deposit to confirm. Balance on departure day. Free cancellation up to 72 hours before.',
    notes: 'Russian-speaking guide is provisional — confirm before the guest replies.',
  },
  {
    id: 'demo-quo-002', reference: 'QUO-2611-027', enquiryId: 'demo-enq-003', status: 'accepted',
    issuedAt: '2026-11-15T09:30:00+07:00', validUntil: '2026-11-20',
    lineItems: items002, discount: discount002, total: total002, depositRequired: percentOf(total002, 30),
    terms: 'Agent rate. 30% deposit to confirm, balance on departure day.',
    notes: 'THB 800 agent discount applied.',
  },
  {
    id: 'demo-quo-003', reference: 'QUO-2611-024', enquiryId: 'demo-enq-004', status: 'accepted',
    issuedAt: '2026-11-11T13:10:00+07:00', validUntil: '2026-11-16',
    lineItems: items003, discount: null, total: total003, depositRequired: percentOf(total003, 50),
    terms: 'Corporate booking: 50% deposit, balance 48 hours before departure. Invoice on request.',
  },
  {
    id: 'demo-quo-004', reference: 'QUO-2611-019', enquiryId: 'demo-enq-005', status: 'expired',
    issuedAt: '2026-11-09T08:45:00+07:00', validUntil: '2026-11-13',
    lineItems: items004, discount: null, total: total004, depositRequired: percentOf(total004, 30),
    terms: '30% deposit to confirm. Weather-dependent; free reschedule if the operator cancels.',
    notes: 'Lapsed without a reply.',
  },
];
