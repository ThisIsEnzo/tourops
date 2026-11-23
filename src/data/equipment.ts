/** Fictional equipment pool. Paddleboards are service-due (readiness edge case). */
import type { EquipmentItem } from '../types/domain';

export const equipment: readonly EquipmentItem[] = [
  { id: 'demo-eqp-001', name: 'Adult snorkel set', category: 'snorkelling', totalUnits: 30, condition: 'good', storageLocation: 'Marina store A' },
  { id: 'demo-eqp-002', name: 'Child snorkel set', category: 'snorkelling', totalUnits: 10, condition: 'good', storageLocation: 'Marina store A' },
  { id: 'demo-eqp-003', name: 'Trolling rod and reel', category: 'fishing', totalUnits: 8, condition: 'good', storageLocation: 'Sattahip locker' },
  { id: 'demo-eqp-004', name: 'Inflatable paddleboard', category: 'watersports', totalUnits: 4, condition: 'service_due', storageLocation: 'Marina store B', notes: 'Two units need valve service before the next charter.' },
  { id: 'demo-eqp-005', name: 'Adult life jacket', category: 'safety', totalUnits: 40, condition: 'good', storageLocation: 'Onboard lockers' },
  { id: 'demo-eqp-006', name: 'Bluetooth sound system', category: 'comfort', totalUnits: 2, condition: 'good', storageLocation: 'Marina store A' },
];
