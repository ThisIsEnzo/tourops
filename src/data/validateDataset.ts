/**
 * Runtime integrity checks for the synthetic dataset: referential integrity,
 * quote arithmetic, payment coherence, capacity limits, resource availability
 * and the demo-data conventions. Used by the foundation screen and unit tests.
 * It is a safety net for the demo, not a business-rules engine.
 */
import type { DemoDataset, PaymentSummary, ResourceKind } from '../types/domain';
import { amountReceived, quoteTotal } from '../lib/money';
import { findById, partySize } from '../lib/selectors';
import { DEMO_EMAIL_DOMAINS, DEMO_ID_PREFIX, DEMO_PHONE_PREFIX } from './demoMeta';

export interface DatasetIssue {
  readonly code: string;
  readonly entity: string;
  readonly message: string;
}

type AddIssue = (code: string, entity: string, message: string) => void;

function checkPayment(entity: string, payment: PaymentSummary, add: AddIssue): void {
  const received = amountReceived(payment).amountMinor;
  const total = payment.total.amountMinor;
  const deposit = payment.depositRequired.amountMinor;

  if (received > total) add('payment-overpaid', entity, 'received amount exceeds the total');
  if (deposit > total) add('deposit-too-large', entity, 'required deposit exceeds the total');

  switch (payment.status) {
    case 'unpaid':
    case 'deposit_requested':
      if (received !== 0) add('payment-status', entity, `${payment.status} but money was received`);
      break;
    case 'deposit_paid':
      if (payment.depositReceived.amountMinor !== deposit || payment.balanceReceived.amountMinor !== 0) {
        add('payment-status', entity, 'deposit_paid must match the required deposit exactly');
      }
      break;
    case 'partially_paid':
      if (received <= deposit || received >= total) {
        add('payment-status', entity, 'partially_paid must sit between the deposit and the total');
      }
      break;
    case 'paid_in_full':
      if (received !== total) add('payment-status', entity, 'paid_in_full must equal the total');
      break;
    case 'refunded':
      break;
  }
}

export function validateDemoDataset(dataset: DemoDataset): readonly DatasetIssue[] {
  const issues: DatasetIssue[] = [];
  const add: AddIssue = (code, entity, message) => { issues.push({ code, entity, message }); };

  const collections = {
    experiences: dataset.experiences,
    customers: dataset.customers,
    enquiries: dataset.enquiries,
    quotes: dataset.quotes,
    bookings: dataset.bookings,
    vessels: dataset.vessels,
    crew: dataset.crew,
    guides: dataset.guides,
    equipment: dataset.equipment,
    departures: dataset.departures,
    assignments: dataset.assignments,
    checklist: dataset.checklist,
  };
  type CollectionName = keyof typeof collections;

  const resourceCollection: Record<ResourceKind, CollectionName | null> = {
    vessel: 'vessels', crew: 'crew', guide: 'guides', equipment: 'equipment', transfer: null,
  };

  const owner = new Map<string, CollectionName>();
  for (const name of Object.keys(collections) as CollectionName[]) {
    for (const item of collections[name]) {
      if (!item.id.startsWith(DEMO_ID_PREFIX)) {
        add('demo-id', item.id, `ids must start with "${DEMO_ID_PREFIX}"`);
      }
      if (owner.has(item.id)) add('duplicate-id', item.id, `already used in ${owner.get(item.id)}`);
      owner.set(item.id, name);
    }
  }

  const ref = (id: string | null, collection: CollectionName, entity: string, field: string): boolean => {
    if (id === null) return false;
    if (owner.get(id) !== collection) {
      add('broken-ref', entity, `${field} "${id}" is not a ${collection} record`);
      return false;
    }
    return true;
  };

  if (!dataset.meta.synthetic) add('demo-meta', 'meta', 'dataset must be flagged synthetic');

  for (const person of [...dataset.customers, ...dataset.crew, ...dataset.guides]) {
    if (!person.phone.startsWith(DEMO_PHONE_PREFIX)) {
      add('demo-phone', person.id, `phone must be a non-callable placeholder such as ${DEMO_PHONE_PREFIX}101`);
    }
  }
  for (const customer of dataset.customers) {
    const domain = customer.email.split('@')[1] ?? '';
    if (!DEMO_EMAIL_DOMAINS.some((allowed) => allowed === domain)) {
      add('demo-email', customer.id, `email must use a reserved example domain, got "${domain}"`);
    }
  }

  for (const enquiry of dataset.enquiries) {
    ref(enquiry.customerId, 'customers', enquiry.id, 'customerId');
    ref(enquiry.experienceId, 'experiences', enquiry.id, 'experienceId');
    ref(enquiry.quoteId, 'quotes', enquiry.id, 'quoteId');
    ref(enquiry.bookingId, 'bookings', enquiry.id, 'bookingId');
    if (enquiry.status === 'quoted' && enquiry.quoteId === null) {
      add('enquiry-link', enquiry.id, 'a quoted enquiry must reference a quote');
    }
    if (enquiry.status === 'converted' && enquiry.bookingId === null) {
      add('enquiry-link', enquiry.id, 'a converted enquiry must reference a booking');
    }
    const quote = enquiry.quoteId ? findById(dataset.quotes, enquiry.quoteId) : undefined;
    if (quote && quote.enquiryId !== enquiry.id) add('link-mismatch', enquiry.id, 'quote points elsewhere');
    const booking = enquiry.bookingId ? findById(dataset.bookings, enquiry.bookingId) : undefined;
    if (booking && booking.enquiryId !== enquiry.id) add('link-mismatch', enquiry.id, 'booking points elsewhere');
  }

  for (const quote of dataset.quotes) {
    ref(quote.enquiryId, 'enquiries', quote.id, 'enquiryId');
    const expected = quoteTotal(quote.lineItems, quote.discount);
    if (expected.amountMinor !== quote.total.amountMinor) {
      add('quote-total', quote.id, 'total does not match line items minus discount');
    }
    if (quote.depositRequired.amountMinor > quote.total.amountMinor) {
      add('deposit-too-large', quote.id, 'required deposit exceeds the total');
    }
    if (quote.status === 'sent' && quote.validUntil < dataset.meta.referenceDate) {
      add('quote-expired', quote.id, 'a sent quote is past its validity date');
    }
  }

  for (const booking of dataset.bookings) {
    ref(booking.customerId, 'customers', booking.id, 'customerId');
    ref(booking.experienceId, 'experiences', booking.id, 'experienceId');
    ref(booking.enquiryId, 'enquiries', booking.id, 'enquiryId');
    ref(booking.quoteId, 'quotes', booking.id, 'quoteId');
    ref(booking.departureId, 'departures', booking.id, 'departureId');
    checkPayment(booking.id, booking.payment, add);
    if (booking.status === 'confirmed' && booking.confirmedAt === null) {
      add('booking-confirmation', booking.id, 'a confirmed booking needs a confirmation timestamp');
    }
    const quote = booking.quoteId ? findById(dataset.quotes, booking.quoteId) : undefined;
    if (quote && quote.total.amountMinor !== booking.payment.total.amountMinor) {
      add('total-mismatch', booking.id, 'booking total differs from the accepted quote');
    }
    const departure = booking.departureId ? findById(dataset.departures, booking.departureId) : undefined;
    if (departure && !departure.bookingIds.includes(booking.id)) {
      add('link-mismatch', booking.id, 'departure does not list this booking');
    }
  }

  for (const departure of dataset.departures) {
    ref(departure.experienceId, 'experiences', departure.id, 'experienceId');
    ref(departure.vesselId, 'vessels', departure.id, 'vesselId');

    let passengers = 0;
    for (const bookingId of departure.bookingIds) {
      if (ref(bookingId, 'bookings', departure.id, 'bookingIds')) {
        const booking = findById(dataset.bookings, bookingId);
        if (booking) {
          passengers += partySize(booking.party);
          if (booking.departureId !== departure.id) add('link-mismatch', departure.id, 'booking points elsewhere');
        }
      }
    }
    if (passengers !== departure.passengerCount) {
      add('passenger-count', departure.id, `manifest is ${passengers}, departure says ${departure.passengerCount}`);
    }
    const experience = findById(dataset.experiences, departure.experienceId);
    if (experience && passengers > experience.maxPassengers) {
      add('experience-capacity', departure.id, 'party exceeds the experience capacity');
    }
    const vessel = departure.vesselId ? findById(dataset.vessels, departure.vesselId) : undefined;
    if (vessel && passengers > vessel.passengerCapacity) {
      add('vessel-capacity', departure.id, 'party exceeds the vessel capacity');
    }
    const confirmed = dataset.assignments.find(
      (item) => item.departureId === departure.id && item.kind === 'vessel' && item.status === 'confirmed',
    );
    if ((confirmed?.resourceId ?? null) !== departure.vesselId) {
      add('vessel-mirror', departure.id, 'vesselId must mirror the confirmed vessel assignment');
    }
    if (departure.status === 'ready') {
      const outstanding = dataset.checklist.filter(
        (item) => item.departureId === departure.id && item.required && item.status !== 'done',
      );
      if (outstanding.length > 0) add('not-ready', departure.id, 'required checklist items are still open');
    }
  }

  const equipmentUsage = new Map<string, number>();
  for (const assignment of dataset.assignments) {
    ref(assignment.departureId, 'departures', assignment.id, 'departureId');
    const collection = resourceCollection[assignment.kind];
    if (collection) ref(assignment.resourceId, collection, assignment.id, 'resourceId');
    if (assignment.units < 1) add('assignment-units', assignment.id, 'units must be at least 1');

    if (assignment.kind === 'equipment') {
      const item = findById(dataset.equipment, assignment.resourceId);
      if (item) {
        const key = `${assignment.departureId}|${assignment.resourceId}`;
        const used = (equipmentUsage.get(key) ?? 0) + assignment.units;
        equipmentUsage.set(key, used);
        if (used > item.totalUnits) add('equipment-units', assignment.id, 'more units reserved than owned');
        if (assignment.status === 'confirmed' && item.condition !== 'good') {
          add('equipment-condition', assignment.id, 'confirmed equipment must be in good condition');
        }
      }
    }
    if (assignment.kind === 'vessel' && assignment.status === 'confirmed') {
      const vessel = findById(dataset.vessels, assignment.resourceId);
      if (vessel && vessel.status !== 'in_service') add('vessel-unavailable', assignment.id, 'vessel is not in service');
    }
    if (assignment.kind === 'crew' && assignment.status === 'confirmed') {
      const member = findById(dataset.crew, assignment.resourceId);
      if (member && member.rosterStatus === 'on_leave') add('crew-on-leave', assignment.id, 'crew member is on leave');
    }
  }

  for (const item of dataset.checklist) {
    ref(item.departureId, 'departures', item.id, 'departureId');
  }

  return issues;
}
