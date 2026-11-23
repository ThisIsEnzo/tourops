/** Fictional crew and guides. One deckhand is on leave (assignment edge case). */
import type { CrewMember, Guide } from '../types/domain';

export const crew: readonly CrewMember[] = [
  {
    id: 'demo-crew-001', fullName: 'Anon Petchsri', role: 'captain',
    certifications: ['Thai Marine Licence Class 2', 'RYA Yachtmaster Offshore', 'STCW Basic Safety'],
    languages: ['th', 'en'], phone: '+66 80 XXX 0201', rosterStatus: 'active',
    notes: 'Senior captain. Approved for catamaran and motor yacht.',
  },
  {
    id: 'demo-crew-002', fullName: 'Krit Sae-Lim', role: 'captain',
    certifications: ['Thai Marine Licence Class 3', 'STCW Basic Safety'],
    languages: ['th', 'en', 'zh'], phone: '+66 80 XXX 0202', rosterStatus: 'active',
    notes: 'Runs evening cruises. Mandarin-speaking.',
  },
  {
    id: 'demo-crew-003', fullName: 'Malee Wongsa', role: 'steward',
    certifications: ['Food Hygiene Level 2', 'First Aid'], languages: ['th', 'en'],
    phone: '+66 80 XXX 0203', rosterStatus: 'active', notes: 'Guest service and catering coordination.',
  },
  {
    id: 'demo-crew-004', fullName: 'Thanawat Boonmee', role: 'deckhand',
    certifications: ['STCW Basic Safety', 'Powerboat Level 2'], languages: ['th'],
    phone: '+66 80 XXX 0204', rosterStatus: 'active',
  },
  {
    id: 'demo-crew-005', fullName: 'Somchai Rattanaporn', role: 'engineer',
    certifications: ['Marine Diesel Maintenance'], languages: ['th', 'en'],
    phone: '+66 80 XXX 0205', rosterStatus: 'contractor',
    notes: 'Called in for maintenance and pre-departure checks on request.',
  },
  {
    id: 'demo-crew-006', fullName: 'Ploy Chaiyasit', role: 'deckhand',
    certifications: ['STCW Basic Safety'], languages: ['th', 'en'],
    phone: '+66 80 XXX 0206', rosterStatus: 'on_leave',
    notes: 'On leave until 2026-11-26. Do not confirm assignments before that date.',
  },
];

export const guides: readonly Guide[] = [  {
    id: 'demo-guide-001', fullName: 'Naree Sukhum', specialities: ['Snorkelling', 'Marine life briefing'],
    languages: ['th', 'en', 'ru'], phone: '+66 80 XXX 0301', rosterStatus: 'active',
  },
  {
    id: 'demo-guide-002', fullName: 'Jonas Berg', specialities: ['Freediving', 'Snorkelling', 'Sport fishing'],
    languages: ['en', 'de'], phone: '+66 80 XXX 0302', rosterStatus: 'contractor',
    notes: 'Booked per trip, 24-hour notice.',
  },
];
