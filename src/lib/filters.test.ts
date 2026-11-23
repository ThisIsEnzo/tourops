import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import {
  DEFAULT_BOOKING_FILTER, DEFAULT_ENQUIRY_FILTER, DEFAULT_QUOTE_FILTER,
  filterBookings, filterDepartures, filterEnquiries, filterQuotes, matchesQuery, searchAll, sortEnquiries,
} from './filters';

describe('matchesQuery', () => {
  it('is case-insensitive and trims', () => {
    expect(matchesQuery('  NORD ', ['Nordwind Reisen'])).toBe(true);
    expect(matchesQuery('', ['anything'])).toBe(true);
    expect(matchesQuery('zzz', ['Nordwind Reisen', null, undefined])).toBe(false);
  });
});

describe('enquiry filters', () => {
  it('filters by status and channel', () => {
    expect(filterEnquiries(demoDataset, { ...DEFAULT_ENQUIRY_FILTER, status: 'pending' })).toHaveLength(2);
    expect(filterEnquiries(demoDataset, { ...DEFAULT_ENQUIRY_FILTER, channel: 'whatsapp' })).toHaveLength(2);
  });

  it('searches customer names and references', () => {
    expect(filterEnquiries(demoDataset, { ...DEFAULT_ENQUIRY_FILTER, query: 'nordwind' })).toHaveLength(1);
    expect(filterEnquiries(demoDataset, { ...DEFAULT_ENQUIRY_FILTER, query: 'ENQ-2611-014' })).toHaveLength(1);
  });

  it('sorts by value descending', () => {
    const rows = sortEnquiries(demoDataset.enquiries, 'value-desc');
    expect(rows[0]?.id).toBe('demo-enq-004');
  });
});

describe('quote filters', () => {
  it('filters accepted quotes and finds by reference', () => {
    expect(filterQuotes(demoDataset, { ...DEFAULT_QUOTE_FILTER, status: 'accepted' })).toHaveLength(2);
    expect(filterQuotes(demoDataset, { ...DEFAULT_QUOTE_FILTER, query: 'QUO-2611-031' })).toHaveLength(1);
  });
});

describe('booking filters', () => {
  it('filters by payment state', () => {
    expect(filterBookings(demoDataset, { ...DEFAULT_BOOKING_FILTER, payment: 'partially_paid' })).toHaveLength(1);
  });

  it('sorts by outstanding balance', () => {
    const rows = filterBookings(demoDataset, { ...DEFAULT_BOOKING_FILTER, sort: 'outstanding-desc' });
    expect(rows[0]?.id).toBe('demo-bkg-003');
  });
});

describe('departures and global search', () => {
  it('finds departures by vessel name', () => {
    expect(filterDepartures(demoDataset, { query: 'Blue Horizon', status: 'all' })).toHaveLength(1);
  });

  it('returns cross-entity hits', () => {
    const hits = searchAll(demoDataset, 'nordwind');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((hit) => hit.entity === 'booking')).toBe(true);
    expect(searchAll(demoDataset, '   ')).toHaveLength(0);
  });
});