/**
 * Fictional departures, resource assignments and preparation checklists.
 *
 * Built-in edge cases for TO-01B/TO-01C:
 * - dep-002 has a deckhand on leave (proposed assignment) and service-due paddleboards;
 * - dep-003 is a tentative agent hold with no confirmed vessel, captain or guide;
 * - dep-001 is close to ready but still has safety and provisioning items open.
 */
import type { ChecklistItem, Departure, ResourceAssignment } from '../types/domain';

export const departures: readonly Departure[] = [
  {
    id: 'demo-dep-001', reference: 'DEP-2611-025', date: '2026-11-25',
    departureTime: '16:30', returnTime: '19:30', experienceId: 'demo-exp-002', vesselId: 'demo-vsl-002',
    bookingIds: ['demo-bkg-001'], status: 'preparing', meetingPoint: 'Ocean Marina Pattaya — Berth A-04',
    passengerCount: 14, notes: 'Sunset 17:52. Guests arrive 16:15; boarding closes 16:25.',
  },
  {
    id: 'demo-dep-002', reference: 'DEP-2611-026', date: '2026-11-26',
    departureTime: '09:00', returnTime: '17:00', experienceId: 'demo-exp-001', vesselId: 'demo-vsl-001',
    bookingIds: ['demo-bkg-002'], status: 'preparing', meetingPoint: 'Ocean Marina Pattaya — Berth C-12',
    passengerCount: 18, notes: 'Corporate charter. Banner rigging on the aft deck; fixed 17:00 return.',
  },
  {
    id: 'demo-dep-003', reference: 'DEP-2611-029', date: '2026-11-29',
    departureTime: '08:30', returnTime: '15:30', experienceId: 'demo-exp-003', vesselId: null,
    bookingIds: ['demo-bkg-003'], status: 'scheduled', meetingPoint: 'Ocean Marina Pattaya — Berth C-12',
    passengerCount: 14, notes: 'Tentative agent hold. Vessel, captain and guide are still proposals.',
  },
];

export const assignments: readonly ResourceAssignment[] = [
  { id: 'demo-asg-001', departureId: 'demo-dep-001', kind: 'vessel', resourceId: 'demo-vsl-002', role: null, units: 1, status: 'confirmed' },
  { id: 'demo-asg-002', departureId: 'demo-dep-001', kind: 'crew', resourceId: 'demo-crew-002', role: 'captain', units: 1, status: 'confirmed' },
  { id: 'demo-asg-003', departureId: 'demo-dep-001', kind: 'crew', resourceId: 'demo-crew-003', role: 'steward', units: 1, status: 'confirmed' },
  { id: 'demo-asg-004', departureId: 'demo-dep-001', kind: 'crew', resourceId: 'demo-crew-004', role: 'deckhand', units: 1, status: 'confirmed' },
  { id: 'demo-asg-005', departureId: 'demo-dep-001', kind: 'equipment', resourceId: 'demo-eqp-005', role: null, units: 18, status: 'confirmed' },
  { id: 'demo-asg-006', departureId: 'demo-dep-001', kind: 'equipment', resourceId: 'demo-eqp-006', role: null, units: 1, status: 'confirmed' },

  { id: 'demo-asg-007', departureId: 'demo-dep-002', kind: 'vessel', resourceId: 'demo-vsl-001', role: null, units: 1, status: 'confirmed' },
  { id: 'demo-asg-008', departureId: 'demo-dep-002', kind: 'crew', resourceId: 'demo-crew-001', role: 'captain', units: 1, status: 'confirmed' },
  { id: 'demo-asg-009', departureId: 'demo-dep-002', kind: 'crew', resourceId: 'demo-crew-006', role: 'deckhand', units: 1, status: 'proposed', note: 'On leave until 26 Nov — replace before confirming.' },
  { id: 'demo-asg-010', departureId: 'demo-dep-002', kind: 'crew', resourceId: 'demo-crew-003', role: 'steward', units: 1, status: 'confirmed' },
  { id: 'demo-asg-011', departureId: 'demo-dep-002', kind: 'guide', resourceId: 'demo-guide-001', role: 'snorkel guide', units: 1, status: 'confirmed' },
  { id: 'demo-asg-012', departureId: 'demo-dep-002', kind: 'equipment', resourceId: 'demo-eqp-001', role: null, units: 20, status: 'confirmed' },
  { id: 'demo-asg-013', departureId: 'demo-dep-002', kind: 'equipment', resourceId: 'demo-eqp-004', role: null, units: 2, status: 'proposed', note: 'Service due — confirm condition before departure.' },
  { id: 'demo-asg-014', departureId: 'demo-dep-002', kind: 'equipment', resourceId: 'demo-eqp-005', role: null, units: 22, status: 'confirmed' },

  { id: 'demo-asg-015', departureId: 'demo-dep-003', kind: 'vessel', resourceId: 'demo-vsl-001', role: null, units: 1, status: 'proposed' },
  { id: 'demo-asg-016', departureId: 'demo-dep-003', kind: 'crew', resourceId: 'demo-crew-002', role: 'captain', units: 1, status: 'proposed' },
  { id: 'demo-asg-017', departureId: 'demo-dep-003', kind: 'guide', resourceId: 'demo-guide-002', role: 'snorkel guide', units: 1, status: 'proposed', note: 'Contractor — 24-hour notice required.' },
  { id: 'demo-asg-018', departureId: 'demo-dep-003', kind: 'equipment', resourceId: 'demo-eqp-001', role: null, units: 16, status: 'proposed' },
];

export const checklist: readonly ChecklistItem[] = [
  { id: 'demo-chk-001', departureId: 'demo-dep-001', label: 'Final passenger count confirmed with agent', category: 'guest', status: 'done', required: true, ownerRole: 'charter coordinator' },
  { id: 'demo-chk-002', departureId: 'demo-dep-001', label: 'Vegetarian canapés for 4 agreed with the kitchen', category: 'guest', status: 'done', required: true, ownerRole: 'steward' },
  { id: 'demo-chk-003', departureId: 'demo-dep-001', label: 'Life jackets counted and stowed (18)', category: 'safety', status: 'done', required: true, ownerRole: 'deckhand' },
  { id: 'demo-chk-004', departureId: 'demo-dep-001', label: 'Safety briefing card printed (EN/DE)', category: 'safety', status: 'pending', required: true, ownerRole: 'captain' },
  { id: 'demo-chk-005', departureId: 'demo-dep-001', label: 'Ice, drinking water and soft drinks loaded', category: 'provisioning', status: 'pending', required: true, ownerRole: 'deckhand' },
  { id: 'demo-chk-006', departureId: 'demo-dep-001', label: 'Guest manifest filed with the marina office', category: 'documents', status: 'pending', required: true, ownerRole: 'charter coordinator' },
  { id: 'demo-chk-007', departureId: 'demo-dep-001', label: 'Crew call time 15:30 acknowledged', category: 'crew', status: 'done', required: false, ownerRole: 'captain' },

  { id: 'demo-chk-008', departureId: 'demo-dep-002', label: 'Banner rigging point agreed with the client', category: 'guest', status: 'done', required: true, ownerRole: 'charter coordinator' },
  { id: 'demo-chk-009', departureId: 'demo-dep-002', label: 'No-shellfish note sent to the galley', category: 'guest', status: 'done', required: true, ownerRole: 'steward' },
  { id: 'demo-chk-010', departureId: 'demo-dep-002', label: 'Weather window reviewed (NE monsoon swell)', category: 'safety', status: 'pending', required: true, ownerRole: 'captain' },
  { id: 'demo-chk-011', departureId: 'demo-dep-002', label: 'Replace deckhand who is on leave', category: 'crew', status: 'blocked', required: true, ownerRole: 'operations', note: 'Ploy Chaiyasit is on leave until 26 Nov.' },
  { id: 'demo-chk-012', departureId: 'demo-dep-002', label: 'Paddleboards serviced and inflated', category: 'provisioning', status: 'blocked', required: true, ownerRole: 'deckhand', note: 'Two units flagged service due.' },
  { id: 'demo-chk-013', departureId: 'demo-dep-002', label: 'Balance payment reminder sent', category: 'documents', status: 'pending', required: true, ownerRole: 'charter coordinator' },

  { id: 'demo-chk-014', departureId: 'demo-dep-003', label: 'Deposit recorded before the hold expires', category: 'documents', status: 'pending', required: true, ownerRole: 'charter coordinator' },
  { id: 'demo-chk-015', departureId: 'demo-dep-003', label: 'Captain and guide availability confirmed', category: 'crew', status: 'pending', required: true, ownerRole: 'operations' },
  { id: 'demo-chk-016', departureId: 'demo-dep-003', label: 'Snorkel gear inventory check', category: 'provisioning', status: 'pending', required: false, ownerRole: 'deckhand' },
];
