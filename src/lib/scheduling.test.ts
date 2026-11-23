import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import type { DemoDataset } from '../types/domain';
import { cloneDataset } from './workflow';
import { conflictingAssignments, departuresOverlap, minutesOf, reservedEquipmentUnits } from './scheduling';
import { findById } from './selectors';

function withOverlappingDepartures(): DemoDataset {
  const copy = cloneDataset(demoDataset);
  return {
    ...copy,
    departures: copy.departures.map((departure) =>
      departure.id === 'demo-dep-002'
        ? { ...departure, date: '2026-11-25', departureTime: '18:00', returnTime: '22:00' }
        : departure),
  };
}

describe('scheduling', () => {
  it('parses local times', () => {
    expect(minutesOf('16:30')).toBe(990);
    expect(minutesOf('nonsense')).toBeNaN();
  });

  it('treats different dates as non-overlapping', () => {
    const first = findById(demoDataset.departures, 'demo-dep-001');
    const second = findById(demoDataset.departures, 'demo-dep-002');
    expect(first && second ? departuresOverlap(first, second) : true).toBe(false);
  });

  it('detects intersecting windows on the same date', () => {
    const dataset = withOverlappingDepartures();
    const first = findById(dataset.departures, 'demo-dep-001');
    const second = findById(dataset.departures, 'demo-dep-002');
    expect(first && second ? departuresOverlap(first, second) : false).toBe(true);
  });

  it('finds exclusive crew conflicts across overlapping departures', () => {
    const dataset = withOverlappingDepartures();
    const departure = findById(dataset.departures, 'demo-dep-002');
    expect(departure).toBeDefined();
    if (!departure) return;
    const conflicts = conflictingAssignments(dataset, departure, 'crew', 'demo-crew-003');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.departureId).toBe('demo-dep-001');
  });

  it('counts equipment units reserved in the same window', () => {
    const copy = cloneDataset(demoDataset);
    const dataset: DemoDataset = {
      ...copy,
      departures: copy.departures.map((departure) =>
        departure.id === 'demo-dep-003'
          ? { ...departure, date: '2026-11-26', departureTime: '10:00', returnTime: '16:00' }
          : departure),
    };
    const departure = findById(dataset.departures, 'demo-dep-003');
    expect(departure).toBeDefined();
    if (!departure) return;
    expect(reservedEquipmentUnits(dataset, departure, 'demo-eqp-001')).toBe(20);
  });
});