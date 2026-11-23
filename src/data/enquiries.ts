/**
 * Fictional enquiry pipeline covering every EnquiryStatus.
 * `demo-enq-001` is the entry point of the walkthrough scenario.
 */
import type { Enquiry } from '../types/domain';
import { thb } from '../lib/money';

export const enquiries: readonly Enquiry[] = [
  {
    id: 'demo-enq-001', reference: 'ENQ-2611-014', customerId: 'demo-cus-001', channel: 'line',
    receivedAt: '2026-11-21T09:12:00+07:00', experienceId: 'demo-exp-001', experienceKind: 'private_charter',
    preferredDate: '2026-12-05', flexibleDates: true, party: { adults: 12, children: 4 },
    pickupLocation: 'Jomtien beachfront hotel (fictional)',
    specialRequests: ['Birthday cake on board', 'Thai-speaking crew'],
    estimatedValue: thb(46000), status: 'pending', quoteId: null, bookingId: null,
    notes: 'Family charter for a 60th birthday. Awaiting quote — scenario entry point.',
  },
  {
    id: 'demo-enq-002', reference: 'ENQ-2611-015', customerId: 'demo-cus-003', channel: 'whatsapp',
    receivedAt: '2026-11-20T18:40:00+07:00', experienceId: 'demo-exp-003', experienceKind: 'snorkelling_trip',
    preferredDate: '2026-11-28', flexibleDates: false, party: { adults: 6, children: 2 },
    pickupLocation: 'Pattaya Bayfront Hotel lobby (fictional)',
    specialRequests: ['Russian-speaking guide if available'],
    estimatedValue: thb(28000), status: 'quoted', quoteId: 'demo-quo-001', bookingId: null,
    notes: 'Quote sent 21 Nov, valid until 26 Nov. Follow-up due before it lapses.',
  },
  {
    id: 'demo-enq-003', reference: 'ENQ-2611-011', customerId: 'demo-cus-002', channel: 'agent',
    receivedAt: '2026-11-14T11:05:00+07:00', experienceId: 'demo-exp-002', experienceKind: 'sunset_cruise',
    preferredDate: '2026-11-25', flexibleDates: false, party: { adults: 14, children: 0 },
    pickupLocation: null, specialRequests: ['Vegetarian canapés for 4 guests'],
    estimatedValue: thb(28000), status: 'converted', quoteId: 'demo-quo-002', bookingId: 'demo-bkg-001',
    notes: 'Agent block converted after the deposit arrived on 17 Nov.',
  },
  {
    id: 'demo-enq-004', reference: 'ENQ-2611-009', customerId: 'demo-cus-004', channel: 'email',
    receivedAt: '2026-11-10T14:22:00+07:00', experienceId: 'demo-exp-001', experienceKind: 'private_charter',
    preferredDate: '2026-11-26', flexibleDates: false, party: { adults: 16, children: 2 },
    pickupLocation: 'Pattaya Bayfront Hotel lobby (fictional)',
    specialRequests: ['Company banner on aft deck', 'No shellfish'],
    estimatedValue: thb(56100), status: 'converted', quoteId: 'demo-quo-003', bookingId: 'demo-bkg-002',
    notes: 'Corporate offsite. Balance reminder scheduled before departure.',
  },
  {
    id: 'demo-enq-005', reference: 'ENQ-2611-006', customerId: 'demo-cus-005', channel: 'phone',
    receivedAt: '2026-11-08T20:15:00+07:00', experienceId: 'demo-exp-004', experienceKind: 'sport_fishing',
    preferredDate: '2026-11-19', flexibleDates: true, party: { adults: 6, children: 0 },
    pickupLocation: null, specialRequests: [], estimatedValue: thb(36400),
    status: 'expired', quoteId: 'demo-quo-004', bookingId: null,
    notes: 'No reply after two follow-ups; the quote lapsed on 13 Nov.',
  },
  {
    id: 'demo-enq-006', reference: 'ENQ-2611-016', customerId: 'demo-cus-006', channel: 'website',
    receivedAt: '2026-11-22T07:55:00+07:00', experienceId: 'demo-exp-005', experienceKind: 'island_transfer',
    preferredDate: '2026-12-12', flexibleDates: false, party: { adults: 4, children: 1 },
    pickupLocation: 'Ban Phe Pier, Rayong', specialRequests: ['Two large suitcases'],
    estimatedValue: thb(12000), status: 'pending', quoteId: null, bookingId: null,
    notes: 'Speedboat Nok Lay is in maintenance until 27 Nov — check the fleet before quoting.',
  },
  {
    id: 'demo-enq-007', reference: 'ENQ-2611-004', customerId: 'demo-cus-003', channel: 'whatsapp',
    receivedAt: '2026-11-05T13:30:00+07:00', experienceId: 'demo-exp-002', experienceKind: 'sunset_cruise',
    preferredDate: '2026-11-15', flexibleDates: false, party: { adults: 8, children: 0 },
    pickupLocation: null, specialRequests: [], estimatedValue: thb(18000),
    status: 'declined', quoteId: null, bookingId: null,
    notes: 'Declined on price; asked to be contacted for low-season offers.',
  },
];
