/**
 * Pure read helpers over the demo dataset. No React, no side effects:
 * reusable from screens, tests and future reducers.
 */
import type {
  ChecklistItem, CrewMember, DemoDataset, Departure, DepartureId, EnquiryStatus,
  IsoDate, Money, PartySize, ResourceAssignment, Vessel,
} from '../types/domain';
import { outstandingBalance, sumMoney } from './money';

export function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export function partySize(party: PartySize): number {
  return party.adults + party.children;
}

export function enquiryStatusCounts(dataset: DemoDataset): Record<EnquiryStatus, number> {
  const counts: Record<EnquiryStatus, number> = {
    pending: 0, quoted: 0, converted: 0, declined: 0, expired: 0,
  };
  for (const enquiry of dataset.enquiries) {
    counts[enquiry.status] += 1;
  }
  return counts;
}

/** Indicative value of enquiries still open (pending or quoted). */
export function openPipelineValue(dataset: DemoDataset): Money {
  return sumMoney(
    dataset.enquiries
      .filter((enquiry) => enquiry.status === 'pending' || enquiry.status === 'quoted')
      .map((enquiry) => enquiry.estimatedValue)
      .filter((value): value is Money => value !== null),
  );
}

export function departuresFrom(dataset: DemoDataset, date: IsoDate): readonly Departure[] {
  return dataset.departures
    .filter((departure) => departure.date >= date && departure.status !== 'cancelled')
    .slice()
    .sort((a, b) => `${a.date}T${a.departureTime}`.localeCompare(`${b.date}T${b.departureTime}`));
}

export function assignmentsFor(dataset: DemoDataset, departureId: DepartureId): readonly ResourceAssignment[] {
  return dataset.assignments.filter((assignment) => assignment.departureId === departureId);
}

export function checklistFor(dataset: DemoDataset, departureId: DepartureId): readonly ChecklistItem[] {
  return dataset.checklist.filter((item) => item.departureId === departureId);
}

export interface ChecklistProgress {
  readonly total: number;
  readonly done: number;
  readonly blocked: number;
  readonly requiredOutstanding: number;
  readonly complete: boolean;
}

export function checklistProgress(items: readonly ChecklistItem[]): ChecklistProgress {
  const done = items.filter((item) => item.status === 'done').length;
  const blocked = items.filter((item) => item.status === 'blocked').length;
  const requiredOutstanding = items.filter((item) => item.required && item.status !== 'done').length;
  return { total: items.length, done, blocked, requiredOutstanding, complete: requiredOutstanding === 0 };
}

/** The vessel actually confirmed for a departure, or null while it is provisional. */
export function confirmedVessel(dataset: DemoDataset, departureId: DepartureId): Vessel | null {
  const assignment = dataset.assignments.find(
    (item) => item.departureId === departureId && item.kind === 'vessel' && item.status === 'confirmed',
  );
  return assignment ? findById(dataset.vessels, assignment.resourceId) ?? null : null;
}

export function confirmedCrew(dataset: DemoDataset, departureId: DepartureId): readonly CrewMember[] {
  return dataset.assignments
    .filter((item) => item.departureId === departureId && item.kind === 'crew' && item.status === 'confirmed')
    .map((item) => findById(dataset.crew, item.resourceId))
    .filter((member): member is CrewMember => member !== undefined);
}

export function bookingOutstanding(dataset: DemoDataset, bookingId: string): Money | null {
  const booking = findById(dataset.bookings, bookingId);
  return booking ? outstandingBalance(booking.payment) : null;
}
