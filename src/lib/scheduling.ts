/**
 * Minimal overlap detection for constrained resources.
 * Deliberately not a scheduling engine: same calendar date + intersecting
 * time windows is the whole rule.
 */
import type { Departure, DemoDataset, LocalTime, ResourceAssignment, ResourceKind } from '../types/domain';
import { findById } from './selectors';

export interface TimeWindow {
  readonly start: number;
  readonly end: number;
}

export function minutesOf(time: LocalTime): number {
  const parts = time.split(':');
  const hours = Number.parseInt(parts[0] ?? '', 10);
  const minutes = Number.parseInt(parts[1] ?? '', 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.NaN;
  return hours * 60 + minutes;
}

export function windowOf(departure: Departure): TimeWindow {
  const start = minutesOf(departure.departureTime);
  const end = minutesOf(departure.returnTime);
  return { start, end: end <= start ? start + 24 * 60 : end };
}

export function departuresOverlap(a: Departure, b: Departure): boolean {
  if (a.date !== b.date) return false;
  const left = windowOf(a);
  const right = windowOf(b);
  if (!Number.isFinite(left.start) || !Number.isFinite(right.start)) return false;
  return left.start < right.end && right.start < left.end;
}

/** Vessels, crew and guides can only be in one place at a time. */
export function isExclusive(kind: ResourceKind): boolean {
  return kind === 'vessel' || kind === 'crew' || kind === 'guide';
}

function isBlockingDeparture(departure: Departure | undefined): departure is Departure {
  return departure !== undefined && departure.status !== 'cancelled' && departure.status !== 'completed';
}

export function conflictingAssignments(
  dataset: DemoDataset,
  departure: Departure,
  kind: ResourceKind,
  resourceId: string,
): readonly ResourceAssignment[] {
  return dataset.assignments.filter((assignment) => {
    if (assignment.kind !== kind || assignment.resourceId !== resourceId) return false;
    if (assignment.status === 'released' || assignment.departureId === departure.id) return false;
    const other = findById(dataset.departures, assignment.departureId);
    if (!isBlockingDeparture(other)) return false;
    return departuresOverlap(departure, other);
  });
}

/** Units of one equipment item already reserved on overlapping departures. */
export function reservedEquipmentUnits(dataset: DemoDataset, departure: Departure, equipmentId: string): number {
  let units = 0;
  for (const assignment of dataset.assignments) {
    if (assignment.kind !== 'equipment' || assignment.resourceId !== equipmentId) continue;
    if (assignment.status === 'released' || assignment.departureId === departure.id) continue;
    const other = findById(dataset.departures, assignment.departureId);
    if (!isBlockingDeparture(other)) continue;
    if (departuresOverlap(departure, other)) units += assignment.units;
  }
  return units;
}