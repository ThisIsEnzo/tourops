/**
 * Pure presentation model for the walkthrough.
 * It only READS domain state and the Stage A readiness calculation — no business
 * rules, money maths, validation or reset logic are duplicated here.
 */
import type { Booking, DemoDataset, Departure, Enquiry, Quote } from '../../types/domain';
import type { Route } from '../../app/navigation';
import { amountReceived } from '../../lib/money';
import { findById } from '../../lib/selectors';
import type { DepartureReadiness } from '../../lib/readiness';
import { calculateDepartureReadiness } from '../../lib/readiness';

export const DEFAULT_SCENARIO_ENQUIRY = 'demo-enq-001';

export type StageKey = 'enquiry' | 'quote' | 'booking' | 'deposit' | 'resources' | 'preparation' | 'readiness';
export type StageStatus = 'complete' | 'current' | 'upcoming';

export interface WalkthroughStage {
  readonly key: StageKey;
  readonly label: string;
  readonly summary: string;
  readonly action: string;
  readonly status: StageStatus;
  readonly route: Route | null;
}

export interface WalkthroughModel {
  readonly enquiryId: string;
  readonly enquiry: Enquiry | null;
  readonly quote: Quote | null;
  readonly booking: Booking | null;
  readonly departure: Departure | null;
  readonly readiness: DepartureReadiness | null;
  readonly stages: readonly WalkthroughStage[];
  readonly current: WalkthroughStage | null;
  readonly completedCount: number;
  readonly isComplete: boolean;
}

const RESOURCE_KEYS: readonly string[] = ['vessel', 'crew', 'guide', 'safety-equipment', 'experience-equipment'];

export function buildWalkthroughModel(dataset: DemoDataset, enquiryId: string): WalkthroughModel {
  const enquiry = findById(dataset.enquiries, enquiryId) ?? null;
  const quote = enquiry?.quoteId ? findById(dataset.quotes, enquiry.quoteId) ?? null : null;
  const booking = enquiry?.bookingId ? findById(dataset.bookings, enquiry.bookingId) ?? null : null;
  const departure = booking?.departureId ? findById(dataset.departures, booking.departureId) ?? null : null;
  const readiness = departure ? calculateDepartureReadiness(dataset, departure.id) : null;

  const satisfied = (key: string): boolean =>
    readiness?.requirements.some((requirement) => requirement.key === key && requirement.satisfied) ?? false;

  const depositMet = booking !== null
    && amountReceived(booking.payment).amountMinor >= booking.payment.depositRequired.amountMinor;

  const enquiryRoute: Route | null = enquiry ? { screen: 'enquiry', id: enquiry.id } : null;
  const quoteRoute: Route | null = quote ? { screen: 'quote', id: quote.id } : enquiryRoute;
  const bookingRoute: Route | null = booking ? { screen: 'booking', id: booking.id } : quoteRoute;
  const departureRoute: Route | null = departure ? { screen: 'departure', id: departure.id } : bookingRoute;

  const definition: readonly { key: StageKey; label: string; summary: string; action: string; done: boolean; route: Route | null }[] = [
    {
      key: 'enquiry', label: 'Enquiry', summary: 'Review the guest request and prepare pricing.',
      action: 'Prepare quote', done: quote !== null, route: enquiryRoute,
    },
    {
      key: 'quote', label: 'Quote', summary: 'Share the quote and record the guest decision.',
      action: quote?.status === 'draft' ? 'Mark as sent' : 'Accept quote', done: quote?.status === 'accepted', route: quoteRoute,
    },
    {
      key: 'booking', label: 'Booking', summary: 'Convert the accepted quote into a booking and departure.',
      action: 'Convert to booking', done: booking !== null, route: bookingRoute,
    },
    {
      key: 'deposit', label: 'Deposit', summary: 'Record a simulated deposit against the booking.',
      action: 'Record simulated deposit', done: depositMet, route: bookingRoute,
    },
    {
      key: 'resources', label: 'Resources', summary: 'Assign vessel, crew, guide and equipment.',
      action: 'Assign resources', done: RESOURCE_KEYS.every(satisfied), route: departureRoute,
    },
    {
      key: 'preparation', label: 'Preparation', summary: 'Work through the mandatory departure checklist.',
      action: 'Complete checklist', done: satisfied('checklist'), route: departureRoute,
    },
    {
      key: 'readiness', label: 'Readiness', summary: 'Confirm the departure is ready to sail.',
      action: 'Review readiness', done: readiness?.isReady === true, route: departureRoute,
    },
  ];

  let currentAssigned = false;
  const stages: readonly WalkthroughStage[] = definition.map((entry) => {
    if (entry.done) {
      return { key: entry.key, label: entry.label, summary: entry.summary, action: entry.action, status: 'complete', route: entry.route };
    }
    if (!currentAssigned) {
      currentAssigned = true;
      return { key: entry.key, label: entry.label, summary: entry.summary, action: entry.action, status: 'current', route: entry.route };
    }
    return { key: entry.key, label: entry.label, summary: entry.summary, action: entry.action, status: 'upcoming', route: entry.route };
  });

  const current = stages.find((stage) => stage.status === 'current') ?? null;
  return {
    enquiryId,
    enquiry,
    quote,
    booking,
    departure,
    readiness,
    stages,
    current,
    completedCount: stages.filter((stage) => stage.status === 'complete').length,
    isComplete: current === null,
  };
}

/** Structural comparison against the seed; used only to decide whether reset needs confirming. */
export function isScenarioModified(dataset: DemoDataset, seed: DemoDataset): boolean {
  return JSON.stringify(dataset) !== JSON.stringify(seed);
}