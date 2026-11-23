import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import { validateDemoDataset } from '../data/validateDataset';
import type { DemoDataset } from '../types/domain';
import { findById, outstandingBalance } from './selectors';
import { nextSequence, nextSequences } from './ids';
import * as workflow from './workflow';
import type { WorkflowResult } from './workflow';

function unwrap<T>(result: WorkflowResult<T>): T {
  if (!result.ok) throw new Error(`expected success, got: ${result.errors.map((error) => error.code).join(', ')}`);
  return result.value;
}

function commit<T>(result: WorkflowResult<T>): DemoDataset {
  if (!result.ok) throw new Error(`expected success, got: ${result.errors.map((error) => error.code).join(', ')}`);
  return result.dataset;
}

function codes(result: WorkflowResult<unknown>): readonly string[] {
  return result.ok ? [] : result.errors.map((error) => error.code);
}

const LINES = [
  { label: 'Private catamaran charter', quantity: 1, unitPriceMinor: 4200000 },
  { label: 'Premium catering', quantity: 16, unitPriceMinor: 65000 },
];

function quotedScenario(): { dataset: DemoDataset; quoteId: string } {
  const created = commit(workflow.createQuote(demoDataset, {
    enquiryId: 'demo-enq-001', lineItems: LINES, discountMinor: 100000, depositPercent: 30,
  }));
  const quote = created.quotes[created.quotes.length - 1];
  if (!quote) throw new Error('quote was not appended');
  const sent = commit(workflow.sendQuote(created, quote.id));
  return { dataset: commit(workflow.acceptQuote(sent, quote.id)), quoteId: quote.id };
}

describe('ids', () => {
  it('allocates deterministic sequences', () => {
    expect(nextSequence(['demo-quo-001', 'demo-quo-004'], 'demo-quo-')).toBe('demo-quo-005');
    expect(nextSequence([], 'demo-pay-')).toBe('demo-pay-001');
    expect(nextSequences(['demo-chk-016'], 'demo-chk-', 3)).toEqual(['demo-chk-017', 'demo-chk-018', 'demo-chk-019']);
  });
});

describe('quote creation', () => {
  it('prepares a draft from a pending enquiry', () => {
    const draft = unwrap(workflow.prepareQuoteFromEnquiry(demoDataset, 'demo-enq-001'));
    expect(draft.lineItems[0]?.unitPriceMinor).toBe(4200000);
    expect(draft.suggestedDepositPercent).toBe(30);
  });

  it('calculates totals, discount and deposit through money utilities', () => {
    const quote = unwrap(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: LINES, discountMinor: 100000, depositPercent: 30,
    }));
    expect(quote.total.amountMinor).toBe(5140000);
    expect(quote.depositRequired.amountMinor).toBe(1542000);
    expect(quote.status).toBe('draft');
  });

  it('supports an explicit deposit amount', () => {
    const quote = unwrap(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: LINES, depositAmountMinor: 2000000,
    }));
    expect(quote.depositRequired.amountMinor).toBe(2000000);
  });

  it('links the enquiry without mutating the input dataset', () => {
    const result = workflow.createQuote(demoDataset, { enquiryId: 'demo-enq-001', lineItems: LINES });
    const next = commit(result);
    const quote = unwrap(result);
    expect(findById(next.enquiries, 'demo-enq-001')?.quoteId).toBe(quote.id);
    expect(findById(demoDataset.enquiries, 'demo-enq-001')?.quoteId).toBeNull();
    expect(validateDemoDataset(next)).toEqual([]);
  });

  it('rejects invalid input and never returns a dataset', () => {
    expect(codes(workflow.createQuote(demoDataset, { enquiryId: 'missing', lineItems: LINES }))).toContain('enquiry-not-found');
    expect(codes(workflow.createQuote(demoDataset, { enquiryId: 'demo-enq-001', lineItems: [] }))).toContain('line-items-required');
    expect(codes(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: [{ label: 'x', quantity: 0, unitPriceMinor: 100 }],
    }))).toContain('quantity-invalid');
    expect(codes(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: [{ label: 'x', quantity: 1, unitPriceMinor: -5 }],
    }))).toContain('unit-price-invalid');
    expect(codes(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: LINES, discountMinor: 99999999,
    }))).toContain('discount-exceeds-subtotal');
    expect(codes(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: LINES, depositPercent: 0,
    }))).toContain('deposit-percent-invalid');
    expect(codes(workflow.createQuote(demoDataset, {
      enquiryId: 'demo-enq-001', lineItems: LINES, depositAmountMinor: 99999999,
    }))).toContain('deposit-exceeds-total');
    expect(codes(workflow.createQuote(demoDataset, { enquiryId: 'demo-enq-002', lineItems: LINES }))).toContain('quote-exists');
    expect(workflow.createQuote(demoDataset, { enquiryId: 'demo-enq-001', lineItems: [] }).ok).toBe(false);
  });
});

describe('quote acceptance and conversion', () => {
  it('requires the sent state before acceptance', () => {
    const created = commit(workflow.createQuote(demoDataset, { enquiryId: 'demo-enq-001', lineItems: LINES }));
    const quote = created.quotes[created.quotes.length - 1];
    if (!quote) throw new Error('missing quote');
    expect(codes(workflow.acceptQuote(created, quote.id))).toContain('invalid-transition');
    const sent = commit(workflow.sendQuote(created, quote.id));
    expect(findById(sent.enquiries, 'demo-enq-001')?.status).toBe('quoted');
    expect(unwrap(workflow.acceptQuote(sent, quote.id)).status).toBe('accepted');
  });

  it('rejects accepting twice', () => {
    const { dataset, quoteId } = quotedScenario();
    expect(codes(workflow.acceptQuote(dataset, quoteId))).toContain('already-accepted');
  });

  it('converts an accepted quote into a booking, departure and checklist', () => {
    const { dataset, quoteId } = quotedScenario();
    const conversion = unwrap(workflow.convertQuoteToBooking(dataset, { quoteId }));
    const next = commit(workflow.convertQuoteToBooking(dataset, { quoteId }));
    expect(conversion.booking.status).toBe('tentative');
    expect(conversion.booking.party).toEqual({ adults: 12, children: 4 });
    expect(conversion.departure.passengerCount).toBe(16);
    expect(conversion.checklist).toHaveLength(7);
    expect(findById(next.enquiries, 'demo-enq-001')?.status).toBe('converted');
    expect(validateDemoDataset(next)).toEqual([]);
  });

  it('rejects duplicate conversion and unaccepted quotes', () => {
    const { dataset, quoteId } = quotedScenario();
    const converted = commit(workflow.convertQuoteToBooking(dataset, { quoteId }));
    expect(codes(workflow.convertQuoteToBooking(converted, { quoteId }))).toContain('already-converted');
    expect(codes(workflow.convertQuoteToBooking(demoDataset, { quoteId: 'demo-quo-001' }))).toContain('invalid-transition');
  });

  it('leaves state untouched after a failed transition', () => {
    const before = workflow.cloneDataset(demoDataset);
    const result = workflow.convertQuoteToBooking(demoDataset, { quoteId: 'demo-quo-001' });
    expect(result.ok).toBe(false);
    expect(demoDataset).toEqual(before);
  });
});

describe('deposit simulation', () => {
  it('records a valid deposit and confirms the booking', () => {
    const entry = unwrap(workflow.recordDeposit(demoDataset, {
      bookingId: 'demo-bkg-003', amountMinor: 780000, method: 'bank_transfer', submissionId: 'sub-1',
    }));
    const next = commit(workflow.recordDeposit(demoDataset, {
      bookingId: 'demo-bkg-003', amountMinor: 780000, method: 'bank_transfer', submissionId: 'sub-1',
    }));
    expect(entry.kind).toBe('deposit');
    const booking = findById(next.bookings, 'demo-bkg-003');
    expect(booking?.payment.status).toBe('deposit_paid');
    expect(booking?.status).toBe('confirmed');
    expect(validateDemoDataset(next)).toEqual([]);
  });

  it('derives partial and full payment states', () => {
    const partial = commit(workflow.recordDeposit(demoDataset, {
      bookingId: 'demo-bkg-003', amountMinor: 400000, method: 'cash', submissionId: 'sub-partial',
    }));
    expect(findById(partial.bookings, 'demo-bkg-003')?.payment.status).toBe('partially_paid');
    expect(findById(partial.bookings, 'demo-bkg-003')?.status).toBe('tentative');

    const full = commit(workflow.recordDeposit(demoDataset, {
      bookingId: 'demo-bkg-003', amountMinor: 2600000, method: 'bank_transfer', submissionId: 'sub-full',
    }));
    expect(findById(full.bookings, 'demo-bkg-003')?.payment.status).toBe('paid_in_full');
    const booking = findById(full.bookings, 'demo-bkg-003');
    expect(booking ? outstandingBalance(booking.payment).amountMinor : -1).toBe(0);
  });

  it('rejects zero, negative, excessive and replayed amounts', () => {
    const base = { bookingId: 'demo-bkg-003', method: 'cash' as const };
    expect(codes(workflow.recordDeposit(demoDataset, { ...base, amountMinor: 0, submissionId: 'a' }))).toContain('amount-invalid');
    expect(codes(workflow.recordDeposit(demoDataset, { ...base, amountMinor: -100, submissionId: 'b' }))).toContain('amount-invalid');
    expect(codes(workflow.recordDeposit(demoDataset, { ...base, amountMinor: 2600001, submissionId: 'c' }))).toContain('amount-exceeds-balance');
    expect(codes(workflow.recordDeposit(demoDataset, { ...base, amountMinor: 100, submissionId: 'demo-sub-001' }))).toContain('duplicate-submission');
  });
});

describe('resource assignment', () => {
  it('assigns a valid resource and mirrors the vessel', () => {
    const next = commit(workflow.assignResource(demoDataset, {
      departureId: 'demo-dep-003', kind: 'vessel', resourceId: 'demo-vsl-001',
    }));
    expect(findById(next.departures, 'demo-dep-003')?.vesselId).toBe('demo-vsl-001');
    expect(validateDemoDataset(next)).toEqual([]);
  });

  it('rejects missing resources and duplicates', () => {
    expect(codes(workflow.assignResource(demoDataset, {
      departureId: 'demo-dep-001', kind: 'crew', resourceId: 'demo-crew-999',
    }))).toContain('resource-not-found');
    expect(codes(workflow.assignResource(demoDataset, {
      departureId: 'demo-dep-001', kind: 'vessel', resourceId: 'demo-vsl-002',
    }))).toContain('duplicate-assignment');
  });

  it('rejects unavailable resources', () => {
    expect(codes(workflow.assignResource(demoDataset, {
      departureId: 'demo-dep-003', kind: 'vessel', resourceId: 'demo-vsl-004',
    }))).toContain('vessel-unavailable');
    expect(codes(workflow.assignResource(demoDataset, {
      departureId: 'demo-dep-001', kind: 'crew', resourceId: 'demo-crew-006',
    }))).toContain('crew-on-leave');
    expect(codes(workflow.assignResource(demoDataset, {
      departureId: 'demo-dep-001', kind: 'equipment', resourceId: 'demo-eqp-006', units: 3,
    }))).toContain('equipment-units');
  });

  it('rejects exclusive resources committed to an overlapping departure', () => {
    const copy = workflow.cloneDataset(demoDataset);
    const dataset: DemoDataset = {
      ...copy,
      departures: copy.departures.map((departure) =>
        departure.id === 'demo-dep-002'
          ? { ...departure, date: '2026-11-25', departureTime: '18:00', returnTime: '22:00' }
          : departure),
    };
    expect(codes(workflow.assignResource(dataset, {
      departureId: 'demo-dep-002', kind: 'crew', resourceId: 'demo-crew-004',
    }))).toContain('resource-conflict');
  });
});

describe('checklist state', () => {
  it('completes and reopens items', () => {
    const done = commit(workflow.updateChecklistItem(demoDataset, { itemId: 'demo-chk-004', status: 'done' }));
    expect(findById(done.checklist, 'demo-chk-004')?.status).toBe('done');
    const reopened = commit(workflow.updateChecklistItem(done, { itemId: 'demo-chk-004', status: 'pending' }));
    expect(findById(reopened.checklist, 'demo-chk-004')?.status).toBe('pending');
  });

  it('validates existence and no-op transitions', () => {
    expect(codes(workflow.updateChecklistItem(demoDataset, { itemId: 'missing', status: 'done' }))).toContain('item-not-found');
    expect(codes(workflow.updateChecklistItem(demoDataset, { itemId: 'demo-chk-001', status: 'done' }))).toContain('unchanged');
  });

  it('promotes the departure to ready once mandatory items are done', () => {
    let dataset = demoDataset;
    for (const itemId of ['demo-chk-004', 'demo-chk-005', 'demo-chk-006']) {
      dataset = commit(workflow.updateChecklistItem(dataset, { itemId, status: 'done' }));
    }
    expect(findById(dataset.departures, 'demo-dep-001')?.status).toBe('ready');
    expect(validateDemoDataset(dataset)).toEqual([]);
  });
});

describe('reset and isolation', () => {
  it('clones without shared references', () => {
    const copy = workflow.cloneDataset(demoDataset);
    expect(copy).toEqual(demoDataset);
    expect(copy).not.toBe(demoDataset);
    expect(copy.bookings[0]).not.toBe(demoDataset.bookings[0]);
    expect(copy.bookings[0]?.payment).not.toBe(demoDataset.bookings[0]?.payment);
  });

  it('restores the seeded scenario after mutations', () => {
    const mutated = commit(workflow.recordDeposit(demoDataset, {
      bookingId: 'demo-bkg-003', amountMinor: 780000, method: 'cash', submissionId: 'reset-check',
    }));
    expect(mutated.payments).toHaveLength(demoDataset.payments.length + 1);
    const restored = workflow.createWalkthroughDataset(demoDataset);
    expect(restored).toEqual(demoDataset);
    expect(restored.payments).toHaveLength(demoDataset.payments.length);
    expect(validateDemoDataset(restored)).toEqual([]);
  });
});