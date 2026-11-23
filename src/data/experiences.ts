/** Fictional product catalogue for Siam Blue Charters (synthetic demo data). */
import type { Experience } from '../types/domain';
import { thb } from '../lib/money';

export const experiences: readonly Experience[] = [
  {
    id: 'demo-exp-001', name: 'Private Catamaran Charter — Koh Larn', kind: 'private_charter',
    durationHours: 8, basePrice: thb(42000), maxPassengers: 24, departurePort: 'Ocean Marina Pattaya',
    summary: 'Full-day private catamaran charter with an anchor stop at Koh Larn.',
    includes: ['Captain and crew', 'Fuel and marina fees', 'Snorkel gear', 'Drinking water and ice'],
  },
  {
    id: 'demo-exp-002', name: 'Sunset Cruise — Pattaya Bay', kind: 'sunset_cruise',
    durationHours: 3, basePrice: thb(18000), maxPassengers: 18, departurePort: 'Ocean Marina Pattaya',
    summary: 'Three-hour evening cruise along Pattaya Bay with canapés service.',
    includes: ['Captain and crew', 'Welcome drink', 'Sound system'],
  },
  {
    id: 'demo-exp-003', name: 'Snorkelling Day Trip — Koh Sak & Koh Krok', kind: 'snorkelling_trip',
    durationHours: 7, basePrice: thb(26000), maxPassengers: 20, departurePort: 'Ocean Marina Pattaya',
    summary: 'Two snorkelling stops with a guide, beach lunch and gear.',
    includes: ['Captain and crew', 'Snorkel guide', 'Lunch box', 'Snorkel gear'],
  },
  {
    id: 'demo-exp-004', name: 'Sport Fishing — Rayong Banks', kind: 'sport_fishing',
    durationHours: 9, basePrice: thb(34000), maxPassengers: 8, departurePort: 'Sattahip Pier',
    summary: 'Trolling and bottom fishing on the Rayong banks with tackle provided.',
    includes: ['Captain and crew', 'Rods and reels', 'Bait and ice'],
  },
  {
    id: 'demo-exp-005', name: 'Island Transfer — Koh Samet', kind: 'island_transfer',
    durationHours: 2, basePrice: thb(12000), maxPassengers: 12, departurePort: 'Ban Phe Pier, Rayong',
    summary: 'Private speedboat transfer with luggage handling.',
    includes: ['Captain and deckhand', 'Luggage handling', 'Life jackets'],
  },
];
