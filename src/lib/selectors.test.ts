import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import {
  checklistFor, checklistProgress, confirmedCrew, confirmedVessel,
  departuresFrom, enquiryStatusCounts, openPipelineValue,
} from './selectors';

describe('selectors', () => {
  it('counts enquiries by status', () => {
    expect(enquiryStatusCounts(demoDataset)).toEqual({
      pending: 2, quoted: 1, converted: 2, declined: 1, expired: 1,
    });
  });

  it('values the open pipeline', () => {
    expect(openPipelineValue(demoDataset).amountMinor).toBe(8600000);
  });

  it('orders upcoming departures by date and time', () => {
    expect(departuresFrom(demoDataset, '2026-11-23').map((d) => d.id)).toEqual([
      'demo-dep-001', 'demo-dep-002', 'demo-dep-003',
    ]);
  });

  it('returns only confirmed resources', () => {
    expect(confirmedVessel(demoDataset, 'demo-dep-003')).toBeNull();
    expect(confirmedVessel(demoDataset, 'demo-dep-002')?.name).toBe('Blue Horizon');
    expect(confirmedCrew(demoDataset, 'demo-dep-001')).toHaveLength(3);
  });

  it('summarises checklist readiness', () => {
    expect(checklistProgress(checklistFor(demoDataset, 'demo-dep-002'))).toEqual({
      total: 6, done: 2, blocked: 2, requiredOutstanding: 4, complete: false,
    });
  });
});
