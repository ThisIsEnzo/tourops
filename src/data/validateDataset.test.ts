import { describe, expect, it } from 'vitest';
import type { DemoDataset } from '../types/domain';
import { demoDataset } from './demoDataset';
import { validateDemoDataset } from './validateDataset';

describe('demo dataset integrity', () => {
  it('is internally consistent as shipped', () => {
    expect(validateDemoDataset(demoDataset)).toEqual([]);
  });

  it('detects a broken reference', () => {
    const broken: DemoDataset = {
      ...demoDataset,
      enquiries: demoDataset.enquiries.map((enquiry, index) =>
        index === 0 ? { ...enquiry, customerId: 'demo-cus-999' } : enquiry,
      ),
    };
    expect(validateDemoDataset(broken).some((issue) => issue.code === 'broken-ref')).toBe(true);
  });

  it('detects a non-fictional email domain', () => {
    const leaked: DemoDataset = {
      ...demoDataset,
      customers: demoDataset.customers.map((customer, index) =>
        index === 0 ? { ...customer, email: 'guest@real-operator.co.th' } : customer,
      ),
    };
    expect(validateDemoDataset(leaked).some((issue) => issue.code === 'demo-email')).toBe(true);
  });

  it('detects an inconsistent passenger manifest', () => {
    const wrong: DemoDataset = {
      ...demoDataset,
      departures: demoDataset.departures.map((departure, index) =>
        index === 0 ? { ...departure, passengerCount: 99 } : departure,
      ),
    };
    expect(validateDemoDataset(wrong).some((issue) => issue.code === 'passenger-count')).toBe(true);
  });
});
