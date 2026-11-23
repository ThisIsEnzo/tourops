import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import { crumbsFor, navKeyFor, parseRoute, routeForEntity, routeToHash } from './navigation';
import type { Route } from './navigation';

const ROUTES: readonly Route[] = [
  { screen: 'dashboard' },
  { screen: 'enquiries' },
  { screen: 'enquiry', id: 'demo-enq-001' },
  { screen: 'quotes' },
  { screen: 'quote', id: 'demo-quo-001' },
  { screen: 'bookings' },
  { screen: 'booking', id: 'demo-bkg-001' },
  { screen: 'departures' },
  { screen: 'departure', id: 'demo-dep-001' },
  { screen: 'resources', tab: 'crew' },
];

describe('navigation', () => {
  it('round-trips every route through the hash', () => {
    for (const route of ROUTES) {
      expect(parseRoute(routeToHash(route))).toEqual(route);
    }
  });

  it('falls back safely for unknown or empty hashes', () => {
    expect(parseRoute('')).toEqual({ screen: 'dashboard' });
    expect(parseRoute('#/nonsense')).toEqual({ screen: 'dashboard' });
    expect(parseRoute('#/resources/spaceships')).toEqual({ screen: 'resources', tab: 'vessels' });
  });

  it('maps detail routes to their navigation section', () => {
    expect(navKeyFor({ screen: 'enquiry', id: 'x' })).toBe('enquiries');
    expect(navKeyFor({ screen: 'departure', id: 'x' })).toBe('departures');
    expect(routeForEntity('resource', 'demo-vsl-001')).toEqual({ screen: 'resources', tab: 'vessels' });
  });

  it('builds breadcrumbs with real references', () => {
    expect(crumbsFor({ screen: 'enquiry', id: 'demo-enq-001' }, demoDataset).map((crumb) => crumb.label))
      .toEqual(['Overview', 'Enquiries', 'ENQ-2611-014']);
    expect(crumbsFor({ screen: 'quote', id: 'missing' }, demoDataset).map((crumb) => crumb.label))
      .toEqual(['Overview', 'Quotes', 'Not found']);
  });
});