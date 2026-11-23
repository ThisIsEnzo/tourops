/**
 * Pure departure readiness. Nothing is stored: readiness is recomputed from
 * bookings, payments, assignments and checklist state on every call.
 */
import type { DemoDataset, DepartureId, Experience } from '../types/domain';
import { amountReceived } from './money';
import { assignmentsFor, checklistFor, checklistProgress, findById } from './selectors';

export interface ReadinessRequirement {
  readonly key: string;
  readonly label: string;
  readonly satisfied: boolean;
  readonly reason: string;
}

export interface DepartureReadiness {
  readonly departureId: DepartureId;
  readonly isReady: boolean;
  readonly requirements: readonly ReadinessRequirement[];
  readonly completed: readonly ReadinessRequirement[];
  readonly outstanding: readonly ReadinessRequirement[];
  /** Human-readable reasons for everything still outstanding. */
  readonly reasons: readonly string[];
}

const GUIDE_REQUIRED_KINDS: readonly Experience['kind'][] = ['snorkelling_trip', 'sport_fishing'];

function requiresGuide(experience: Experience | undefined): boolean {
  return experience !== undefined && GUIDE_REQUIRED_KINDS.includes(experience.kind);
}

function requiresSnorkelGear(experience: Experience | undefined): boolean {
  return experience !== undefined && experience.includes.some((item) => item.toLowerCase().includes('snorkel'));
}

export function calculateDepartureReadiness(dataset: DemoDataset, departureId: DepartureId): DepartureReadiness | null {
  const departure = findById(dataset.departures, departureId);
  if (!departure) return null;

  const experience = findById(dataset.experiences, departure.experienceId);
  const assignments = assignmentsFor(dataset, departureId);
  const confirmed = assignments.filter((assignment) => assignment.status === 'confirmed');
  const bookings = departure.bookingIds
    .map((bookingId) => findById(dataset.bookings, bookingId))
    .filter((booking) => booking !== undefined);
  const active = bookings.filter((booking) => booking.status !== 'cancelled');
  const progress = checklistProgress(checklistFor(dataset, departureId));

  const vesselAssignment = confirmed.find((assignment) => assignment.kind === 'vessel');
  const vessel = vesselAssignment ? findById(dataset.vessels, vesselAssignment.resourceId) : undefined;
  const crewAssignments = confirmed.filter((assignment) => assignment.kind === 'crew');
  const crewMembers = crewAssignments
    .map((assignment) => findById(dataset.crew, assignment.resourceId))
    .filter((member) => member !== undefined);
  const hasCaptain = crewMembers.some((member) => member.role === 'captain');
  const hasSupport = crewMembers.some((member) => member.role !== 'captain');
  const guideAssigned = confirmed.some((assignment) => assignment.kind === 'guide');

  const unitsOf = (category: string): number =>
    confirmed
      .filter((assignment) => assignment.kind === 'equipment')
      .reduce((total, assignment) => {
        const item = findById(dataset.equipment, assignment.resourceId);
        return item && item.category === category ? total + assignment.units : total;
      }, 0);

  const safetyUnits = unitsOf('safety');
  const snorkelUnits = unitsOf('snorkelling');
  const depositShort = active.filter(
    (booking) => amountReceived(booking.payment).amountMinor < booking.payment.depositRequired.amountMinor,
  );
  const unconfirmed = active.filter((booking) => booking.status !== 'confirmed');

  const requirements: readonly ReadinessRequirement[] = [
    {
      key: 'booking',
      label: 'Confirmed booking',
      satisfied: active.length > 0 && unconfirmed.length === 0,
      reason: active.length === 0
        ? 'No booking is attached to this departure.'
        : `${unconfirmed.length} booking(s) are not confirmed.`,
    },
    {
      key: 'deposit',
      label: 'Required deposit received',
      satisfied: active.length > 0 && depositShort.length === 0,
      reason: active.length === 0
        ? 'No booking means no deposit can be recorded.'
        : `${depositShort.length} booking(s) have not met the required deposit.`,
    },
    {
      key: 'vessel',
      label: 'Vessel assigned',
      satisfied: vessel !== undefined && vessel.status === 'in_service' && vessel.passengerCapacity >= departure.passengerCount,
      reason: vessel === undefined
        ? 'No vessel is confirmed for this departure.'
        : vessel.status !== 'in_service'
          ? `Assigned vessel is "${vessel.status}".`
          : 'Assigned vessel capacity is below the guest count.',
    },
    {
      key: 'crew',
      label: 'Captain and crew assigned',
      satisfied: hasCaptain && hasSupport,
      reason: !hasCaptain ? 'No confirmed captain.' : 'No confirmed crew member besides the captain.',
    },
    {
      key: 'guide',
      label: 'Guide assigned',
      satisfied: !requiresGuide(experience) || guideAssigned,
      reason: 'This experience requires a confirmed guide.',
    },
    {
      key: 'safety-equipment',
      label: 'Safety equipment for every guest',
      satisfied: safetyUnits >= departure.passengerCount,
      reason: `Safety units confirmed: ${safetyUnits} of ${departure.passengerCount} required.`,
    },
    {
      key: 'experience-equipment',
      label: 'Experience equipment',
      satisfied: !requiresSnorkelGear(experience) || snorkelUnits >= departure.passengerCount,
      reason: `Snorkel sets confirmed: ${snorkelUnits} of ${departure.passengerCount} required.`,
    },
    {
      key: 'checklist',
      label: 'Mandatory checklist complete',
      satisfied: progress.total > 0 && progress.requiredOutstanding === 0,
      reason: progress.total === 0
        ? 'No preparation checklist exists for this departure.'
        : `${progress.requiredOutstanding} mandatory item(s) outstanding${progress.blocked > 0 ? `, ${progress.blocked} blocked` : ''}.`,
    },
  ];

  const completed = requirements.filter((requirement) => requirement.satisfied);
  const outstanding = requirements.filter((requirement) => !requirement.satisfied);

  return {
    departureId,
    isReady: outstanding.length === 0,
    requirements,
    completed,
    outstanding,
    reasons: outstanding.map((requirement) => requirement.reason),
  };
}