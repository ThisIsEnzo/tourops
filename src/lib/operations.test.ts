import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import { dashboardMetrics, dateParts, daysBetween, departureView, upcomingDepartureViews } from './operations';

describe('date helpers', () => {
  it('counts whole days between ISO dates', () => {
    expect(daysBetween('2026-11-23', '2026-11-26')).toBe(3);
    expect(daysBetween('2026-11-23', '2026-11-20')).toBe(-3);
  });

  it('splits a date for the departure blocks', () => {
    expect(dateParts('2026-11-25')).toEqual({ day: '25', month: 'Nov', weekday: 'Wed' });
  });
});

describe('dashboard metrics', () => {
  it('derives every metric from the dataset', () => {
    const metrics = dashboardMetrics(demoDataset);
    expect(metrics.upcomingDepartures).toBe(3);
    expect(metrics.pendingEnquiries).toBe(2);
    expect(metrics.quotesAwaitingResponse).toBe(1);
    expect(metrics.upcomingBookings).toBe(3);
    expect(metrics.depositsOutstanding.amountMinor).toBe(6365000);
    expect(metrics.openPipeline.amountMinor).toBe(8600000);
    expect(metrics.guestsNextSevenDays).toBe(46);
  });
});

describe('departure view', () => {
  it('assembles the run sheet for a preparing departure', () => {
    const view = departureView(demoDataset, 'demo-dep-002');
    expect(view).not.toBeNull();
    expect(view?.vessel?.name).toBe('Blue Horizon');
    expect(view?.crew).toHaveLength(3);
    expect(view?.guides).toHaveLength(1);
    expect(view?.equipment).toHaveLength(3);
    expect(view?.adults).toBe(16);
    expect(view?.children).toBe(2);
    expect(view?.progress.requiredOutstanding).toBe(4);
    expect(view?.daysAway).toBe(3);
  });

  it('leaves the vessel unassigned while proposals are pending', () => {
    expect(departureView(demoDataset, 'demo-dep-003')?.vessel).toBeNull();
  });

  it('returns null for unknown ids and orders upcoming departures', () => {
    expect(departureView(demoDataset, 'demo-dep-999')).toBeNull();
    expect(upcomingDepartureViews(demoDataset, '2026-11-23').map((view) => view.departure.id))
      .toEqual(['demo-dep-001', 'demo-dep-002', 'demo-dep-003']);
  });
});