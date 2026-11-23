/**
 * TO-01C-A workflow engine — pure domain operations over the demo dataset.
 *
 * Every operation is `(dataset, input) => WorkflowResult<T>`:
 * - validation happens first and collects all issues;
 * - on failure nothing is returned but the issues, so the caller cannot apply
 *   a partially updated dataset (atomicity at application-state level);
 * - on success a brand-new dataset is returned; the input is never mutated.
 *
 * No React, no persistence, no payment provider. All money is simulated
 * bookkeeping in integer satang.
 */
import type {
  AssignmentStatus, Booking, ChecklistItem, ChecklistStatus, Currency, DemoDataset, Departure,
  DepartureStatus, Enquiry, Experience, IsoDate, IsoDateTime, LocalTime, Money, PaymentEntry,
  PaymentMethod, PaymentStatus, PaymentSummary, Quote, QuoteLineItem, ResourceAssignment, ResourceKind,
} from '../types/domain';
import { amountReceived, outstandingBalance, percentOf, quoteTotal, sumMoney, zero } from './money';
import { checklistProgress, findById, partySize } from './selectors';
import { conflictingAssignments, isExclusive, reservedEquipmentUnits } from './scheduling';
import { nextSequence, nextSequences } from './ids';

/* Results ------------------------------------------------------------ */

export interface WorkflowIssue {
  readonly code: string;
  readonly field: string;
  readonly message: string;
}

export type WorkflowResult<T> =
  | { readonly ok: true; readonly dataset: DemoDataset; readonly value: T; readonly message: string }
  | { readonly ok: false; readonly errors: readonly WorkflowIssue[] };

function issue(code: string, field: string, message: string): WorkflowIssue {
  return { code, field, message };
}

function fail<T>(errors: readonly WorkflowIssue[]): WorkflowResult<T> {
  return { ok: false, errors };
}

function succeed<T>(dataset: DemoDataset, value: T, message: string): WorkflowResult<T> {
  return { ok: true, dataset, value, message };
}

/* Shared helpers ----------------------------------------------------- */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const DEFAULT_DEPOSIT_PERCENT = 30;
const DEFAULT_QUOTE_VALIDITY_DAYS = 5;
const DEFAULT_DEPOSIT_TERM_DAYS = 2;

export const DEFAULT_DEPARTURE_CHECKLIST: readonly {
  label: string; category: ChecklistItem['category']; required: boolean; ownerRole: string;
}[] = [
  { label: 'Final passenger count confirmed with the guest', category: 'guest', required: true, ownerRole: 'charter coordinator' },
  { label: 'Guest manifest filed with the marina office', category: 'documents', required: true, ownerRole: 'charter coordinator' },
  { label: 'Life jackets counted and stowed', category: 'safety', required: true, ownerRole: 'deckhand' },
  { label: 'Safety briefing card printed', category: 'safety', required: true, ownerRole: 'captain' },
  { label: 'Ice, drinking water and soft drinks loaded', category: 'provisioning', required: true, ownerRole: 'deckhand' },
  { label: 'Crew call time acknowledged', category: 'crew', required: true, ownerRole: 'captain' },
  { label: 'Weather window reviewed', category: 'safety', required: false, ownerRole: 'captain' },
];

/**
 * Deep copy of the dataset. The demo model is intentionally JSON-safe
 * (strings, numbers, booleans, null, arrays, plain objects), which makes this
 * exact and dependency-free. Reset relies on it to avoid shared references.
 */
export function cloneDataset(dataset: DemoDataset): DemoDataset {
  const parsed: unknown = JSON.parse(JSON.stringify(dataset));
  return parsed as DemoDataset;
}

function minor(amountMinor: number): Money {
  return { amountMinor, currency: 'THB' };
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const instant = new Date(`${date}T00:00:00Z`);
  instant.setUTCDate(instant.getUTCDate() + days);
  return instant.toISOString().slice(0, 10);
}

function demoStamp(dataset: DemoDataset, time = '09:00:00+07:00'): IsoDateTime {
  return `${dataset.meta.referenceDate}T${time}`;
}

function referencePrefix(dataset: DemoDataset, kind: 'QUO' | 'BKG' | 'DEP'): string {
  const date = dataset.meta.referenceDate;
  return `${kind}-${date.slice(2, 4)}${date.slice(5, 7)}-`;
}

function allIds(dataset: DemoDataset): readonly string[] {
  return [
    ...dataset.experiences, ...dataset.customers, ...dataset.enquiries, ...dataset.quotes,
    ...dataset.bookings, ...dataset.vessels, ...dataset.crew, ...dataset.guides,
    ...dataset.equipment, ...dataset.departures, ...dataset.assignments, ...dataset.checklist,
    ...dataset.payments,
  ].map((entity) => entity.id);
}

function replace<T extends { id: string }>(rows: readonly T[], next: T): readonly T[] {
  return rows.map((row) => (row.id === next.id ? next : row));
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/* A. Enquiry -> quote ------------------------------------------------ */

export interface QuoteLineInput {
  readonly label: string;
  readonly quantity: number;
  readonly unitPriceMinor: number;
}

export interface QuoteDraft {
  readonly enquiryId: string;
  readonly currency: Currency;
  readonly lineItems: readonly QuoteLineInput[];
  readonly suggestedDepositPercent: number;
  readonly validUntil: IsoDate;
}

export interface CreateQuoteInput {
  readonly enquiryId: string;
  readonly lineItems: readonly QuoteLineInput[];
  readonly discountMinor?: number;
  readonly depositPercent?: number;
  readonly depositAmountMinor?: number;
  readonly validUntil?: IsoDate;
  readonly terms?: string;
  readonly notes?: string;
}

const DEFAULT_TERMS =
  'Deposit required to confirm. Balance due on departure day. Free cancellation up to 72 hours before departure.';

/** Build a prefilled draft from an enquiry without touching state. */
export function prepareQuoteFromEnquiry(dataset: DemoDataset, enquiryId: string): WorkflowResult<QuoteDraft> {
  const enquiry = findById(dataset.enquiries, enquiryId);
  if (!enquiry) return fail([issue('enquiry-not-found', 'enquiryId', `Enquiry "${enquiryId}" does not exist.`)]);
  if (enquiry.status !== 'pending') {
    return fail([issue('enquiry-not-open', 'status', `Enquiry is "${enquiry.status}"; only pending enquiries can be quoted.`)]);
  }
  if (enquiry.quoteId !== null) {
    return fail([issue('quote-exists', 'quoteId', 'This enquiry already has a quote.')]);
  }
  const experience = enquiry.experienceId ? findById(dataset.experiences, enquiry.experienceId) : undefined;
  if (!experience) {
    return fail([issue('experience-required', 'experienceId', 'Select an experience before preparing a quote.')]);
  }

  const draft: QuoteDraft = {
    enquiryId: enquiry.id,
    currency: dataset.meta.currency,
    lineItems: [{ label: experience.name, quantity: 1, unitPriceMinor: experience.basePrice.amountMinor }],
    suggestedDepositPercent: DEFAULT_DEPOSIT_PERCENT,
    validUntil: addDays(dataset.meta.referenceDate, DEFAULT_QUOTE_VALIDITY_DAYS),
  };
  return succeed(dataset, draft, 'Draft prepared from enquiry.');
}

export function createQuote(dataset: DemoDataset, input: CreateQuoteInput): WorkflowResult<Quote> {
  const enquiry = findById(dataset.enquiries, input.enquiryId);
  if (!enquiry) return fail([issue('enquiry-not-found', 'enquiryId', `Enquiry "${input.enquiryId}" does not exist.`)]);

  const errors: WorkflowIssue[] = [];
  if (enquiry.status !== 'pending') {
    errors.push(issue('enquiry-not-open', 'status', `Enquiry is "${enquiry.status}"; only pending enquiries can be quoted.`));
  }
  if (enquiry.quoteId !== null) {
    errors.push(issue('quote-exists', 'quoteId', 'This enquiry already has a quote.'));
  }
  if (input.lineItems.length === 0) {
    errors.push(issue('line-items-required', 'lineItems', 'At least one line item is required.'));
  }
  input.lineItems.forEach((line, index) => {
    if (line.label.trim() === '') errors.push(issue('label-required', `lineItems[${index}].label`, 'Line item label is required.'));
    if (!isPositiveInteger(line.quantity)) errors.push(issue('quantity-invalid', `lineItems[${index}].quantity`, 'Quantity must be a positive integer.'));
    if (!isNonNegativeInteger(line.unitPriceMinor)) errors.push(issue('unit-price-invalid', `lineItems[${index}].unitPriceMinor`, 'Unit price must be a non-negative integer of satang.'));
  });

  const validUntil = input.validUntil ?? addDays(dataset.meta.referenceDate, DEFAULT_QUOTE_VALIDITY_DAYS);
  if (!DATE_PATTERN.test(validUntil)) {
    errors.push(issue('date-invalid', 'validUntil', 'Validity must be an ISO date (YYYY-MM-DD).'));
  } else if (validUntil < dataset.meta.referenceDate) {
    errors.push(issue('date-in-past', 'validUntil', 'Validity cannot be before the demo reference date.'));
  }

  const lineItems: readonly QuoteLineItem[] = input.lineItems.map((line, index) => ({
    id: `line-${index + 1}`,
    label: line.label.trim(),
    quantity: line.quantity,
    unitPrice: minor(line.unitPriceMinor),
  }));
  const discountMinor = input.discountMinor ?? 0;
  const subtotalMinor = sumMoney(lineItems.map((line) => minor(line.unitPrice.amountMinor * line.quantity))).amountMinor;

  if (!isNonNegativeInteger(discountMinor)) {
    errors.push(issue('discount-invalid', 'discountMinor', 'Discount must be a non-negative integer of satang.'));
  } else if (discountMinor > subtotalMinor) {
    errors.push(issue('discount-exceeds-subtotal', 'discountMinor', 'Discount cannot exceed the subtotal.'));
  }

  const discount = discountMinor > 0 ? minor(discountMinor) : null;
  const total = quoteTotal(lineItems, discount);
  if (total.amountMinor <= 0) {
    errors.push(issue('total-invalid', 'lineItems', 'Quote total must be greater than zero.'));
  }

  let depositRequired: Money = percentOf(total, DEFAULT_DEPOSIT_PERCENT);
  if (input.depositAmountMinor !== undefined) {
    if (!isNonNegativeInteger(input.depositAmountMinor)) {
      errors.push(issue('deposit-invalid', 'depositAmountMinor', 'Deposit must be a non-negative integer of satang.'));
    } else if (input.depositAmountMinor > total.amountMinor) {
      errors.push(issue('deposit-exceeds-total', 'depositAmountMinor', 'Deposit cannot exceed the quote total.'));
    } else {
      depositRequired = minor(input.depositAmountMinor);
    }
  } else {
    const percent = input.depositPercent ?? DEFAULT_DEPOSIT_PERCENT;
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      errors.push(issue('deposit-percent-invalid', 'depositPercent', 'Deposit percentage must be greater than 0 and at most 100.'));
    } else {
      depositRequired = percentOf(total, percent);
    }
  }

  if (errors.length > 0) return fail(errors);

  const id = nextSequence(allIds(dataset), 'demo-quo-');
  const quote: Quote = {
    id,
    reference: nextSequence(dataset.quotes.map((row) => row.reference), referencePrefix(dataset, 'QUO')),
    enquiryId: enquiry.id,
    status: 'draft',
    issuedAt: demoStamp(dataset),
    validUntil,
    lineItems: lineItems.map((line) => ({ ...line, id: `${id}-${line.id}` })),
    discount,
    total,
    depositRequired,
    terms: input.terms ?? DEFAULT_TERMS,
    notes: input.notes,
  };

  const next: DemoDataset = {
    ...dataset,
    quotes: [...dataset.quotes, quote],
    enquiries: replace(dataset.enquiries, { ...enquiry, quoteId: quote.id, estimatedValue: quote.total }),
  };
  return succeed(next, quote, `Quote ${quote.reference} created as a draft.`);
}

export function sendQuote(dataset: DemoDataset, quoteId: string): WorkflowResult<Quote> {
  const quote = findById(dataset.quotes, quoteId);
  if (!quote) return fail([issue('quote-not-found', 'quoteId', `Quote "${quoteId}" does not exist.`)]);
  if (quote.status !== 'draft') {
    return fail([issue('invalid-transition', 'status', `Only a draft quote can be sent (current: "${quote.status}").`)]);
  }
  const enquiry = findById(dataset.enquiries, quote.enquiryId);
  const sent: Quote = { ...quote, status: 'sent' };
  const next: DemoDataset = {
    ...dataset,
    quotes: replace(dataset.quotes, sent),
    enquiries: enquiry ? replace(dataset.enquiries, { ...enquiry, status: 'quoted' }) : dataset.enquiries,
  };
  return succeed(next, sent, `Quote ${quote.reference} marked as sent (simulated, no message is delivered).`);
}

/* B. Quote -> booking ------------------------------------------------ */

export function acceptQuote(dataset: DemoDataset, quoteId: string): WorkflowResult<Quote> {
  const quote = findById(dataset.quotes, quoteId);
  if (!quote) return fail([issue('quote-not-found', 'quoteId', `Quote "${quoteId}" does not exist.`)]);
  if (quote.status === 'accepted') {
    return fail([issue('already-accepted', 'status', 'This quote has already been accepted.')]);
  }
  if (quote.status !== 'sent') {
    return fail([issue('invalid-transition', 'status', `Only a sent quote can be accepted (current: "${quote.status}").`)]);
  }
  if (quote.validUntil < dataset.meta.referenceDate) {
    return fail([issue('quote-expired', 'validUntil', 'This quote is past its validity date.')]);
  }
  const accepted: Quote = { ...quote, status: 'accepted' };
  return succeed({ ...dataset, quotes: replace(dataset.quotes, accepted) }, accepted, `Quote ${quote.reference} accepted.`);
}

export interface ConvertQuoteInput {
  readonly quoteId: string;
  readonly date?: IsoDate;
  readonly departureTime?: LocalTime;
  readonly returnTime?: LocalTime;
  readonly meetingPoint?: string;
}

export interface ConversionResult {
  readonly booking: Booking;
  readonly departure: Departure;
  readonly checklist: readonly ChecklistItem[];
}

function addHours(time: LocalTime, hours: number): LocalTime {
  const parts = time.split(':');
  const startHours = Number.parseInt(parts[0] ?? '0', 10);
  const minutes = parts[1] ?? '00';
  const total = Math.min(startHours + Math.round(hours), 23);
  return `${String(total).padStart(2, '0')}:${minutes}`;
}

export function convertQuoteToBooking(dataset: DemoDataset, input: ConvertQuoteInput): WorkflowResult<ConversionResult> {
  const quote = findById(dataset.quotes, input.quoteId);
  if (!quote) return fail([issue('quote-not-found', 'quoteId', `Quote "${input.quoteId}" does not exist.`)]);

  const errors: WorkflowIssue[] = [];
  if (quote.status !== 'accepted') {
    errors.push(issue('invalid-transition', 'status', `Only an accepted quote can be converted (current: "${quote.status}").`));
  }
  if (dataset.bookings.some((booking) => booking.quoteId === quote.id)) {
    errors.push(issue('already-converted', 'quoteId', 'A booking already exists for this quote.'));
  }
  const enquiry = findById(dataset.enquiries, quote.enquiryId);
  if (!enquiry) {
    errors.push(issue('enquiry-not-found', 'enquiryId', 'The linked enquiry is missing.'));
  } else if (enquiry.bookingId !== null) {
    errors.push(issue('already-converted', 'enquiryId', 'The linked enquiry already has a booking.'));
  }
  const experience: Experience | undefined = enquiry?.experienceId
    ? findById(dataset.experiences, enquiry.experienceId)
    : undefined;
  if (!experience) errors.push(issue('experience-required', 'experienceId', 'The enquiry has no valid experience.'));

  const date = input.date ?? enquiry?.preferredDate ?? dataset.meta.referenceDate;
  if (!DATE_PATTERN.test(date)) errors.push(issue('date-invalid', 'date', 'Departure date must be an ISO date.'));
  else if (date < dataset.meta.referenceDate) errors.push(issue('date-in-past', 'date', 'Departure cannot be before the demo reference date.'));

  const departureTime = input.departureTime ?? '09:00';
  const returnTime = input.returnTime ?? addHours(departureTime, experience?.durationHours ?? 4);
  if (!TIME_PATTERN.test(departureTime)) errors.push(issue('time-invalid', 'departureTime', 'Departure time must be HH:MM.'));
  if (!TIME_PATTERN.test(returnTime)) errors.push(issue('time-invalid', 'returnTime', 'Return time must be HH:MM.'));
  if (TIME_PATTERN.test(departureTime) && TIME_PATTERN.test(returnTime) && returnTime <= departureTime) {
    errors.push(issue('time-order-invalid', 'returnTime', 'Return time must be after the departure time.'));
  }

  const guests = enquiry ? partySize(enquiry.party) : 0;
  if (guests <= 0) errors.push(issue('party-invalid', 'party', 'The enquiry must have at least one guest.'));
  if (experience && guests > experience.maxPassengers) {
    errors.push(issue('capacity-exceeded', 'party', 'Party exceeds the experience capacity.'));
  }

  if (errors.length > 0 || !enquiry || !experience) return fail(errors);

  const ids = allIds(dataset);
  const bookingId = nextSequence(ids, 'demo-bkg-');
  const departureId = nextSequence([...ids, bookingId], 'demo-dep-');
  const checklistIds = nextSequences([...ids, bookingId, departureId], 'demo-chk-', DEFAULT_DEPARTURE_CHECKLIST.length);
  const recordedAt = demoStamp(dataset, '10:00:00+07:00');

  const payment: PaymentSummary = {
    status: derivePaymentStatus(0, quote.depositRequired.amountMinor, quote.total.amountMinor, true),
    total: quote.total,
    depositRequired: quote.depositRequired,
    depositReceived: zero(),
    balanceReceived: zero(),
    depositDueOn: addDays(dataset.meta.referenceDate, DEFAULT_DEPOSIT_TERM_DAYS),
    balanceDueOn: date,
    method: null,
    lastUpdatedAt: null,
    note: 'Simulated bookkeeping only — no payment provider is connected.',
  };

  const booking: Booking = {
    id: bookingId,
    reference: nextSequence(dataset.bookings.map((row) => row.reference), referencePrefix(dataset, 'BKG')),
    enquiryId: enquiry.id,
    quoteId: quote.id,
    customerId: enquiry.customerId,
    experienceId: experience.id,
    departureId,
    status: 'tentative',
    party: enquiry.party,
    confirmedAt: null,
    pickup: enquiry.pickupLocation
      ? { location: enquiry.pickupLocation, time: departureTime, transferIncluded: false }
      : null,
    specialRequests: enquiry.specialRequests,
    payment,
    notes: `Converted from ${quote.reference}. Awaiting simulated deposit.`,
  };

  const departure: Departure = {
    id: departureId,
    reference: nextSequence(dataset.departures.map((row) => row.reference), referencePrefix(dataset, 'DEP')),
    date,
    departureTime,
    returnTime,
    experienceId: experience.id,
    vesselId: null,
    bookingIds: [bookingId],
    status: 'scheduled',
    meetingPoint: input.meetingPoint ?? dataset.meta.homePort,
    passengerCount: guests,
    notes: `Created from ${quote.reference}. Resources not yet assigned.`,
  };

  const checklist: readonly ChecklistItem[] = DEFAULT_DEPARTURE_CHECKLIST.map((template, index) => ({
    id: checklistIds[index] ?? `${departureId}-chk-${index + 1}`,
    departureId,
    label: template.label,
    category: template.category,
    status: 'pending',
    required: template.required,
    ownerRole: template.ownerRole,
  }));

  const next: DemoDataset = {
    ...dataset,
    bookings: [...dataset.bookings, booking],
    departures: [...dataset.departures, departure],
    checklist: [...dataset.checklist, ...checklist],
    enquiries: replace(dataset.enquiries, { ...enquiry, status: 'converted', bookingId }),
  };
  void recordedAt;
  return succeed(next, { booking, departure, checklist }, `Booking ${booking.reference} and departure ${departure.reference} created.`);
}

/* C. Deposit simulation ---------------------------------------------- */

export function derivePaymentStatus(
  receivedMinor: number,
  depositMinor: number,
  totalMinor: number,
  hasDepositSchedule: boolean,
): PaymentStatus {
  if (totalMinor > 0 && receivedMinor >= totalMinor) return 'paid_in_full';
  if (receivedMinor <= 0) return hasDepositSchedule && depositMinor > 0 ? 'deposit_requested' : 'unpaid';
  if (depositMinor > 0 && receivedMinor === depositMinor) return 'deposit_paid';
  return 'partially_paid';
}

export interface RecordDepositInput {
  readonly bookingId: string;
  readonly amountMinor: number;
  readonly method: PaymentMethod;
  /** Idempotency key: replaying the same key must never record money twice. */
  readonly submissionId: string;
  readonly recordedAt?: IsoDateTime;
  readonly note?: string;
}

export function recordDeposit(dataset: DemoDataset, input: RecordDepositInput): WorkflowResult<PaymentEntry> {
  const booking = findById(dataset.bookings, input.bookingId);
  if (!booking) return fail([issue('booking-not-found', 'bookingId', `Booking "${input.bookingId}" does not exist.`)]);

  const errors: WorkflowIssue[] = [];
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    errors.push(issue('invalid-transition', 'status', `Booking is "${booking.status}"; money cannot be recorded.`));
  }
  if (input.submissionId.trim() === '') {
    errors.push(issue('submission-required', 'submissionId', 'A submission id is required.'));
  } else if (dataset.payments.some((entry) => entry.submissionId === input.submissionId)) {
    errors.push(issue('duplicate-submission', 'submissionId', 'This submission has already been recorded.'));
  }
  if (!isPositiveInteger(input.amountMinor)) {
    errors.push(issue('amount-invalid', 'amountMinor', 'Amount must be a positive integer of satang.'));
  }
  const outstanding = outstandingBalance(booking.payment);
  if (isPositiveInteger(input.amountMinor) && input.amountMinor > outstanding.amountMinor) {
    errors.push(issue('amount-exceeds-balance', 'amountMinor', 'Amount exceeds the outstanding balance.'));
  }
  if (errors.length > 0) return fail(errors);

  const recordedAt = input.recordedAt ?? demoStamp(dataset, '11:00:00+07:00');
  const depositGap = booking.payment.depositRequired.amountMinor - booking.payment.depositReceived.amountMinor;
  const entry: PaymentEntry = {
    id: nextSequence(allIds(dataset), 'demo-pay-'),
    bookingId: booking.id,
    kind: depositGap > 0 ? 'deposit' : 'balance',
    amount: minor(input.amountMinor),
    method: input.method,
    recordedAt,
    submissionId: input.submissionId,
    note: input.note,
  };

  const receivedMinor = amountReceived(booking.payment).amountMinor + input.amountMinor;
  const depositReceivedMinor = Math.min(receivedMinor, booking.payment.depositRequired.amountMinor);
  const balanceReceivedMinor = receivedMinor - depositReceivedMinor;
  const depositMet = receivedMinor >= booking.payment.depositRequired.amountMinor;

  const payment: PaymentSummary = {
    ...booking.payment,
    status: derivePaymentStatus(
      receivedMinor,
      booking.payment.depositRequired.amountMinor,
      booking.payment.total.amountMinor,
      booking.payment.depositDueOn !== null,
    ),
    depositReceived: minor(depositReceivedMinor),
    balanceReceived: minor(balanceReceivedMinor),
    method: input.method,
    lastUpdatedAt: recordedAt,
    note: input.note ?? booking.payment.note,
  };

  const promoted = booking.status === 'tentative' && depositMet;
  const updatedBooking: Booking = {
    ...booking,
    payment,
    status: promoted ? 'confirmed' : booking.status,
    confirmedAt: promoted ? recordedAt : booking.confirmedAt,
  };

  const departure = booking.departureId ? findById(dataset.departures, booking.departureId) : undefined;
  const updatedDeparture: Departure | null =
    departure && promoted && departure.status === 'scheduled' ? { ...departure, status: 'preparing' } : null;

  const next: DemoDataset = {
    ...dataset,
    payments: [...dataset.payments, entry],
    bookings: replace(dataset.bookings, updatedBooking),
    departures: updatedDeparture ? replace(dataset.departures, updatedDeparture) : dataset.departures,
  };
  return succeed(next, entry, `Simulated payment recorded for ${booking.reference}.`);
}

/* D. Resource assignment --------------------------------------------- */

export interface AssignResourceInput {
  readonly departureId: string;
  readonly kind: ResourceKind;
  readonly resourceId: string;
  readonly role?: string;
  readonly units?: number;
  readonly status?: AssignmentStatus;
}

export function assignResource(dataset: DemoDataset, input: AssignResourceInput): WorkflowResult<ResourceAssignment> {
  const departure = findById(dataset.departures, input.departureId);
  if (!departure) return fail([issue('departure-not-found', 'departureId', `Departure "${input.departureId}" does not exist.`)]);
  if (departure.status === 'cancelled' || departure.status === 'completed') {
    return fail([issue('invalid-transition', 'status', `Departure is "${departure.status}"; resources cannot be assigned.`)]);
  }
  if (input.kind === 'transfer') {
    return fail([issue('unsupported-kind', 'kind', 'Transfers are not modelled as a resource collection in this demo.')]);
  }

  const errors: WorkflowIssue[] = [];
  const status: AssignmentStatus = input.status ?? 'confirmed';
  const units = input.kind === 'equipment' ? (input.units ?? 1) : 1;
  if (!isPositiveInteger(units)) errors.push(issue('units-invalid', 'units', 'Units must be a positive integer.'));

  const duplicate = dataset.assignments.some(
    (assignment) =>
      assignment.departureId === departure.id &&
      assignment.kind === input.kind &&
      assignment.resourceId === input.resourceId &&
      assignment.status !== 'released',
  );
  if (duplicate) errors.push(issue('duplicate-assignment', 'resourceId', 'This resource is already assigned to the departure.'));

  let role: string | null = input.role ?? null;

  if (input.kind === 'vessel') {
    const vessel = findById(dataset.vessels, input.resourceId);
    if (!vessel) errors.push(issue('resource-not-found', 'resourceId', 'Vessel does not exist.'));
    else {
      if (vessel.status !== 'in_service') errors.push(issue('vessel-unavailable', 'resourceId', `Vessel is "${vessel.status}".`));
      if (vessel.passengerCapacity < departure.passengerCount) {
        errors.push(issue('vessel-capacity', 'resourceId', 'Vessel capacity is below the guest count.'));
      }
    }
    const existingVessel = dataset.assignments.some(
      (assignment) => assignment.departureId === departure.id && assignment.kind === 'vessel' && assignment.status !== 'released',
    );
    if (existingVessel && !duplicate) {
      errors.push(issue('vessel-already-assigned', 'resourceId', 'Release the current vessel before assigning another one.'));
    }
  } else if (input.kind === 'crew') {
    const member = findById(dataset.crew, input.resourceId);
    if (!member) errors.push(issue('resource-not-found', 'resourceId', 'Crew member does not exist.'));
    else {
      if (member.rosterStatus === 'on_leave') errors.push(issue('crew-on-leave', 'resourceId', 'Crew member is on leave.'));
      role = input.role ?? member.role;
    }
  } else if (input.kind === 'guide') {
    const guide = findById(dataset.guides, input.resourceId);
    if (!guide) errors.push(issue('resource-not-found', 'resourceId', 'Guide does not exist.'));
    else if (guide.rosterStatus === 'on_leave') errors.push(issue('guide-on-leave', 'resourceId', 'Guide is on leave.'));
  } else {
    const item = findById(dataset.equipment, input.resourceId);
    if (!item) errors.push(issue('resource-not-found', 'resourceId', 'Equipment item does not exist.'));
    else {
      if (item.condition === 'out_of_service') errors.push(issue('equipment-unavailable', 'resourceId', 'Equipment is out of service.'));
      const reserved = reservedEquipmentUnits(dataset, departure, item.id);
      if (isPositiveInteger(units) && reserved + units > item.totalUnits) {
        errors.push(issue('equipment-units', 'units', `Only ${item.totalUnits - reserved} unit(s) remain available for this window.`));
      }
    }
  }

  if (isExclusive(input.kind)) {
    const conflicts = conflictingAssignments(dataset, departure, input.kind, input.resourceId);
    if (conflicts.length > 0) {
      const conflictDepartures = conflicts
        .map((assignment) => findById(dataset.departures, assignment.departureId)?.reference ?? assignment.departureId)
        .join(', ');
      errors.push(issue('resource-conflict', 'resourceId', `Already committed to an overlapping departure: ${conflictDepartures}.`));
    }
  }

  if (errors.length > 0) return fail(errors);

  const assignment: ResourceAssignment = {
    id: nextSequence(allIds(dataset), 'demo-asg-'),
    departureId: departure.id,
    kind: input.kind,
    resourceId: input.resourceId,
    role,
    units,
    status,
  };

  const mirrorVessel = input.kind === 'vessel' && status === 'confirmed';
  const updatedDeparture: Departure = mirrorVessel ? { ...departure, vesselId: input.resourceId } : departure;

  const next: DemoDataset = {
    ...dataset,
    assignments: [...dataset.assignments, assignment],
    departures: mirrorVessel ? replace(dataset.departures, updatedDeparture) : dataset.departures,
  };
  return succeed(next, assignment, 'Resource assigned.');
}

/* E. Checklist state -------------------------------------------------- */

export interface UpdateChecklistInput {
  readonly itemId: string;
  readonly status: ChecklistStatus;
}

function deriveDepartureStatus(current: DepartureStatus, items: readonly ChecklistItem[]): DepartureStatus {
  if (current === 'cancelled' || current === 'completed' || current === 'departed') return current;
  const progress = checklistProgress(items);
  if (progress.complete) return 'ready';
  return progress.done > 0 ? 'preparing' : 'scheduled';
}

export function updateChecklistItem(dataset: DemoDataset, input: UpdateChecklistInput): WorkflowResult<ChecklistItem> {
  const item = findById(dataset.checklist, input.itemId);
  if (!item) return fail([issue('item-not-found', 'itemId', `Checklist item "${input.itemId}" does not exist.`)]);
  if (item.status === input.status) {
    return fail([issue('unchanged', 'status', `Item is already "${input.status}".`)]);
  }
  const departure = findById(dataset.departures, item.departureId);
  if (!departure) return fail([issue('departure-not-found', 'departureId', 'The linked departure is missing.')]);
  if (departure.status === 'cancelled' || departure.status === 'completed') {
    return fail([issue('invalid-transition', 'status', `Departure is "${departure.status}"; the checklist is closed.`)]);
  }

  const updated: ChecklistItem = { ...item, status: input.status };
  const checklist = replace(dataset.checklist, updated);
  const siblings = checklist.filter((entry) => entry.departureId === departure.id);
  const updatedDeparture: Departure = { ...departure, status: deriveDepartureStatus(departure.status, siblings) };

  const next: DemoDataset = { ...dataset, checklist, departures: replace(dataset.departures, updatedDeparture) };
  return succeed(next, updated, `Checklist item marked "${input.status}".`);
}

/* Reset --------------------------------------------------------------- */

/** A pristine, structurally independent copy of the seeded scenario. */
export function createWalkthroughDataset(seed: DemoDataset): DemoDataset {
  return cloneDataset(seed);
}

/** Ledger reconciliation helper used by integrity checks and tests. */
export function ledgerTotal(dataset: DemoDataset, bookingId: string): Money {
  return sumMoney(dataset.payments.filter((entry) => entry.bookingId === bookingId).map((entry) => entry.amount));
}

/** Re-exported for callers that only need the enquiry type in signatures. */
export type WorkflowEnquiry = Enquiry;