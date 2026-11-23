import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import type { DemoDataset } from '../types/domain';
import { zero } from './money';
import { calculateDepartureReadiness } from './readiness';
import * as workflow from './workflow';
import type { WorkflowResult } from './workflow';

function commit<T>(result: WorkflowResult<T>): DemoDataset {
  if (!result.ok) throw new Error(`expected success, got: ${result.errors.map((error) => error.code).join(', ')}`);
  return result.dataset;
}

function keys(dataset: DemoDataset, departureId: string): readonly string[] {
  const readiness = calculateDepartureReadiness(dataset, departureId);
  return readiness ? readiness.outstanding.map((requirement) => requirement.key) : [];
}

describe('departure readiness', () => {
  it('returns null for an unknown departure', () => {
    expect(calculateDepartureReadiness(demoDataset, 'demo-dep-999')).toBeNull();
  });

  it('is not ready while mandatory checklist items are open', () => {
    const readiness = calculateDepartureReadiness(demoDataset, 'demo-dep-001');
    expect(readiness?.isReady).toBe(false);
    expect(keys(demoDataset, 'demo-dep-001')).toEqual(['checklist']);
    expect(readiness?.reasons.length).toBeGreaterThan(0);
  });

  it('becomes ready after the checklist is completed', () => {
    let dataset = demoDataset;
    for (const itemId of ['demo-chk-004', 'demo-chk-005', 'demo-chk-006']) {
      dataset = commit(workflow.updateChecklistItem(dataset, { itemId, status: 'done' }));
    }
    const readiness = calculateDepartureReadiness(dataset, 'demo-dep-001');
    expect(readiness?.isReady).toBe(true);
    expect(readiness?.outstanding).toHaveLength(0);
    expect(readiness?.completed.length).toBe(readiness?.requirements.length);
  });

  it('reports every gap for the tentative agent hold', () => {
    const outstanding = keys(demoDataset, 'demo-dep-003');
    expect(outstanding).toContain('booking');
    expect(outstanding).toContain('deposit');
    expect(outstanding).toContain('vessel');
    expect(outstanding).toContain('crew');
    expect(outstanding).toContain('guide');
    expect(outstanding).toContain('checklist');
  });

  it('flags a missing booking', () => {
    const copy = workflow.cloneDataset(demoDataset);
    const dataset: DemoDataset = {
      ...copy,
      departures: copy.departures.map((departure) =>
        departure.id === 'demo-dep-001' ? { ...departure, bookingIds: [] } : departure),
    };
    expect(keys(dataset, 'demo-dep-001')).toContain('booking');
  });

  it('flags an insufficient deposit', () => {
    const copy = workflow.cloneDataset(demoDataset);
    const dataset: DemoDataset = {
      ...copy,
      payments: copy.payments.filter((entry) => entry.bookingId !== 'demo-bkg-001'),
      bookings: copy.bookings.map((booking) =>
        booking.id === 'demo-bkg-001'
          ? {
            ...booking,
            payment: { ...booking.payment, status: 'unpaid', depositReceived: zero(), balanceReceived: zero() },
          }
          : booking),
    };
    expect(keys(dataset, 'demo-dep-001')).toContain('deposit');
  });

  it('reacts to a newly recorded deposit', () => {
    const before = keys(demoDataset, 'demo-dep-003').includes('deposit');
    const after = commit(workflow.recordDeposit(demoDataset, {
      bookingId: 'demo-bkg-003', amountMinor: 780000, method: 'bank_transfer', submissionId: 'readiness-1',
    }));
    expect(before).toBe(true);
    expect(keys(after, 'demo-dep-003')).not.toContain('deposit');
    expect(keys(after, 'demo-dep-003')).not.toContain('booking');
  });
});