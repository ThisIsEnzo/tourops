/** Fictional fleet: one partner vessel and one boat under maintenance. */
import type { Vessel } from '../types/domain';

export const vessels: readonly Vessel[] = [
  {
    id: 'demo-vsl-001', name: 'Blue Horizon', kind: 'catamaran', lengthMetres: 18.3,
    passengerCapacity: 24, homePort: 'Ocean Marina Pattaya — Berth C-12', ownership: 'owned',
    status: 'in_service', notes: 'Primary day-charter catamaran. Shaded aft deck, galley, two heads.',
  },
  {
    id: 'demo-vsl-002', name: 'Sea Quartz', kind: 'motor_yacht', lengthMetres: 22,
    passengerCapacity: 18, homePort: 'Ocean Marina Pattaya — Berth A-04', ownership: 'owned',
    status: 'in_service', notes: 'Preferred for sunset cruises and corporate evenings.',
  },
  {
    id: 'demo-vsl-003', name: 'Andaman Pearl', kind: 'sailing_yacht', lengthMetres: 15.5,
    passengerCapacity: 10, homePort: 'Sattahip Pier', ownership: 'partner',
    partnerName: 'Rayong Sail Partners (fictional)', status: 'in_service',
    notes: 'Partner vessel. 48-hour call-off notice; captain supplied by the partner.',
  },
  {
    id: 'demo-vsl-004', name: 'Nok Lay', kind: 'speedboat', lengthMetres: 11.2,
    passengerCapacity: 12, homePort: 'Ban Phe Pier, Rayong', ownership: 'owned',
    status: 'maintenance', notes: 'Engine work until 2026-11-27. Not assignable to transfers.',
  },
];
