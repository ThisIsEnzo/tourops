/** Pure operational read models. React-free, unit-tested. */
import type {
  AssignmentStatus, Booking, ChecklistItem, CrewMember, Customer, DemoDataset, Departure, DepartureId,
  Enquiry, EquipmentItem, Experience, Guide, IsoDate, Money, Quote, Vessel,
} from '../types/domain';
import { outstandingBalance, sumMoney } from './money';
import type { ChecklistProgress } from './selectors';
import { assignmentsFor, checklistFor, checklistProgress, findById, openPipelineValue, partySize } from './selectors';

const MS_PER_DAY = 86400000;
const MONTH_FORMAT = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
const WEEKDAY_FORMAT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY);
}

export interface DateParts { readonly day: string; readonly month: string; readonly weekday: string }

export function dateParts(date: IsoDate): DateParts {
  const instant = new Date(`${date}T00:00:00Z`);
  return { day: date.slice(8, 10), month: MONTH_FORMAT.format(instant), weekday: WEEKDAY_FORMAT.format(instant) };
}

export function enquiryCustomer(dataset: DemoDataset, enquiry: Enquiry): Customer | null {
  return findById(dataset.customers, enquiry.customerId) ?? null;
}

export function enquiryExperience(dataset: DemoDataset, enquiry: Enquiry): Experience | null {
  return enquiry.experienceId ? findById(dataset.experiences, enquiry.experienceId) ?? null : null;
}

export function quoteEnquiry(dataset: DemoDataset, quote: Quote): Enquiry | null {
  return findById(dataset.enquiries, quote.enquiryId) ?? null;
}

export function quoteCustomer(dataset: DemoDataset, quote: Quote): Customer | null {
  const enquiry = quoteEnquiry(dataset, quote);
  return enquiry ? enquiryCustomer(dataset, enquiry) : null;
}

export function quoteExperience(dataset: DemoDataset, quote: Quote): Experience | null {
  const enquiry = quoteEnquiry(dataset, quote);
  return enquiry ? enquiryExperience(dataset, enquiry) : null;
}

export function quoteBooking(dataset: DemoDataset, quote: Quote): Booking | null {
  return dataset.bookings.find((booking) => booking.quoteId === quote.id) ?? null;
}

export function bookingCustomer(dataset: DemoDataset, booking: Booking): Customer | null {
  return findById(dataset.customers, booking.customerId) ?? null;
}

export function bookingExperience(dataset: DemoDataset, booking: Booking): Experience | null {
  return findById(dataset.experiences, booking.experienceId) ?? null;
}

export function bookingDeparture(dataset: DemoDataset, booking: Booking): Departure | null {
  return booking.departureId ? findById(dataset.departures, booking.departureId) ?? null : null;
}

export function isActiveBooking(booking: Booking): boolean {
  return booking.status !== 'cancelled' && booking.status !== 'completed';
}

export interface DashboardMetrics {
  readonly upcomingDepartures: number;
  readonly pendingEnquiries: number;
  readonly quotesAwaitingResponse: number;
  readonly depositsOutstanding: Money;
  readonly upcomingBookings: number;
  readonly openPipeline: Money;
  readonly guestsNextSevenDays: number;
}

export function dashboardMetrics(dataset: DemoDataset): DashboardMetrics {
  const from = dataset.meta.referenceDate;
  const departures = dataset.departures.filter((item) => item.date >= from && item.status !== 'cancelled');
  const upcomingBookings = dataset.bookings.filter((booking) => {
    if (!isActiveBooking(booking)) return false;
    const departure = bookingDeparture(dataset, booking);
    return departure !== null && departure.date >= from;
  });
  return {
    upcomingDepartures: departures.length,
    pendingEnquiries: dataset.enquiries.filter((enquiry) => enquiry.status === 'pending').length,
    quotesAwaitingResponse: dataset.quotes.filter((quote) => quote.status === 'sent').length,
    depositsOutstanding: sumMoney(upcomingBookings.map((booking) => outstandingBalance(booking.payment))),
    upcomingBookings: upcomingBookings.length,
    openPipeline: openPipelineValue(dataset),
    guestsNextSevenDays: departures
      .filter((departure) => daysBetween(from, departure.date) <= 7)
      .reduce((total, departure) => total + departure.passengerCount, 0),
  };
}

export interface CrewAssignment {
  readonly member: CrewMember; readonly role: string | null;
  readonly status: AssignmentStatus; readonly note?: string;
}
export interface GuideAssignment {
  readonly guide: Guide; readonly role: string | null;
  readonly status: AssignmentStatus; readonly note?: string;
}
export interface EquipmentRequirement {
  readonly item: EquipmentItem; readonly units: number;
  readonly status: AssignmentStatus; readonly note?: string;
}

export interface DepartureView {
  readonly departure: Departure;
  readonly experience: Experience | null;
  readonly vessel: Vessel | null;
  readonly progress: ChecklistProgress;
  readonly checklist: readonly ChecklistItem[];
  readonly bookings: readonly Booking[];
  readonly customers: readonly Customer[];
  readonly crew: readonly CrewAssignment[];
  readonly guides: readonly GuideAssignment[];
  readonly equipment: readonly EquipmentRequirement[];
  readonly adults: number;
  readonly children: number;
  readonly daysAway: number;
}

export function departureView(dataset: DemoDataset, departureId: DepartureId): DepartureView | null {
  const departure = findById(dataset.departures, departureId);
  if (!departure) return null;

  const assignments = assignmentsFor(dataset, departureId);
  const crew: CrewAssignment[] = [];
  const guides: GuideAssignment[] = [];
  const equipment: EquipmentRequirement[] = [];

  for (const assignment of assignments) {
    if (assignment.kind === 'crew') {
      const member = findById(dataset.crew, assignment.resourceId);
      if (member) crew.push({ member, role: assignment.role, status: assignment.status, note: assignment.note });
    } else if (assignment.kind === 'guide') {
      const guide = findById(dataset.guides, assignment.resourceId);
      if (guide) guides.push({ guide, role: assignment.role, status: assignment.status, note: assignment.note });
    } else if (assignment.kind === 'equipment') {
      const item = findById(dataset.equipment, assignment.resourceId);
      if (item) equipment.push({ item, units: assignment.units, status: assignment.status, note: assignment.note });
    }
  }

  const bookings = departure.bookingIds
    .map((bookingId) => findById(dataset.bookings, bookingId))
    .filter((booking): booking is Booking => booking !== undefined);
  const customers = bookings
    .map((booking) => findById(dataset.customers, booking.customerId))
    .filter((customer): customer is Customer => customer !== undefined);
  const checklist = checklistFor(dataset, departureId);
  const vesselAssignment = assignments.find((item) => item.kind === 'vessel' && item.status === 'confirmed');

  return {
    departure,
    experience: findById(dataset.experiences, departure.experienceId) ?? null,
    vessel: vesselAssignment ? findById(dataset.vessels, vesselAssignment.resourceId) ?? null : null,
    progress: checklistProgress(checklist),
    checklist,
    bookings,
    customers,
    crew,
    guides,
    equipment,
    adults: bookings.reduce((total, booking) => total + booking.party.adults, 0),
    children: bookings.reduce((total, booking) => total + booking.party.children, 0),
    daysAway: daysBetween(dataset.meta.referenceDate, departure.date),
  };
}

export function upcomingDepartureViews(dataset: DemoDataset, from: IsoDate): readonly DepartureView[] {
  return dataset.departures
    .filter((departure) => departure.date >= from && departure.status !== 'cancelled')
    .slice()
    .sort((a, b) => `${a.date}T${a.departureTime}`.localeCompare(`${b.date}T${b.departureTime}`))
    .map((departure) => departureView(dataset, departure.id))
    .filter((view): view is DepartureView => view !== null);
}

export function guestsOf(booking: Booking): number {
  return partySize(booking.party);
}