/**
 * Fictional bookings. Payment state is a manually recorded snapshot:
 * TourOps does not process payments and stores no card data.
 */
import type { Booking } from '../types/domain';
import { thb } from '../lib/money';

export const bookings: readonly Booking[] = [
  {
    id: 'demo-bkg-001', reference: 'BKG-2611-007', enquiryId: 'demo-enq-003', quoteId: 'demo-quo-002',
    customerId: 'demo-cus-002', experienceId: 'demo-exp-002', departureId: 'demo-dep-001',
    status: 'confirmed', party: { adults: 14, children: 0 }, confirmedAt: '2026-11-16T10:12:00+07:00',
    pickup: { location: 'Ocean Marina Pattaya — Berth C-12', time: '16:15', transferIncluded: false },
    specialRequests: ['Vegetarian canapés for 4 guests'],
    payment: {
      status: 'deposit_paid', total: thb(28000), depositRequired: thb(8400),
      depositReceived: thb(8400), balanceReceived: thb(0),
      depositDueOn: '2026-11-18', balanceDueOn: '2026-11-25',
      method: 'bank_transfer', lastUpdatedAt: '2026-11-17T15:20:00+07:00',
      note: 'Agent transfer received; balance collected on the day.',
    },
    notes: 'Sunset cruise, 14 guests. Acoustic duo confirmed for 17:00–19:00.',
  },
  {
    id: 'demo-bkg-002', reference: 'BKG-2611-006', enquiryId: 'demo-enq-004', quoteId: 'demo-quo-003',
    customerId: 'demo-cus-004', experienceId: 'demo-exp-001', departureId: 'demo-dep-002',
    status: 'confirmed', party: { adults: 16, children: 2 }, confirmedAt: '2026-11-12T09:05:00+07:00',
    pickup: {
      location: 'Pattaya Bayfront Hotel lobby (fictional)', time: '08:15', transferIncluded: true,
      note: 'Minibus for 18, one child seat.',
    },
    specialRequests: ['Company banner on aft deck', 'No shellfish'],
    payment: {
      status: 'partially_paid', total: thb(56100), depositRequired: thb(28050),
      depositReceived: thb(28050), balanceReceived: thb(10000),
      depositDueOn: '2026-11-14', balanceDueOn: '2026-11-24',
      method: 'bank_transfer', lastUpdatedAt: '2026-11-20T11:40:00+07:00',
      note: 'Part payment of the balance received; THB 18,050 still outstanding.',
    },
    notes: 'Corporate charter. Fixed return time 17:00 for the coach connection.',
  },
  {
    id: 'demo-bkg-003', reference: 'BKG-2611-008', enquiryId: null, quoteId: null,
    customerId: 'demo-cus-002', experienceId: 'demo-exp-003', departureId: 'demo-dep-003',
    status: 'tentative', party: { adults: 10, children: 4 }, confirmedAt: null,
    pickup: null, specialRequests: ['Two vegetarian lunch boxes'],
    payment: {
      status: 'deposit_requested', total: thb(26000), depositRequired: thb(7800),
      depositReceived: thb(0), balanceReceived: thb(0),
      depositDueOn: '2026-11-25', balanceDueOn: '2026-11-29',
      method: null, lastUpdatedAt: null,
      note: 'Hold expires if the deposit is not recorded by 25 Nov.',
    },
    notes: 'Agent block held by email, no formal quote. Vessel and crew still provisional.',
  },
];
