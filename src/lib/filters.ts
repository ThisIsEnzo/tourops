/** Pure search / filter / sort logic for the list screens. */
import type {
  Booking, BookingStatus, DemoDataset, Departure, DepartureStatus, Enquiry, EnquiryChannel,
  EnquiryStatus, PaymentStatus, Quote, QuoteStatus,
} from '../types/domain';
import { outstandingBalance } from './money';
import { findById } from './selectors';
import {
  bookingCustomer, bookingDeparture, bookingExperience, quoteCustomer, quoteExperience,
} from './operations';

export function matchesQuery(query: string, fields: readonly (string | number | null | undefined)[]): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  return fields.some((field) => field !== null && field !== undefined && String(field).toLowerCase().includes(needle));
}

export interface Option<T extends string> { readonly value: T; readonly label: string }

export function statusOptions<T extends string>(
  map: Record<T, { readonly label: string }>, allLabel: string,
): readonly Option<T | 'all'>[] {
  const all: Option<T | 'all'> = { value: 'all', label: allLabel };
  const rest = (Object.keys(map) as T[]).map((key): Option<T | 'all'> => ({ value: key, label: map[key].label }));
  return [all, ...rest];
}

export type EnquirySort = 'received-desc' | 'received-asc' | 'date-asc' | 'value-desc';
export interface EnquiryFilter {
  readonly query: string; readonly status: EnquiryStatus | 'all';
  readonly channel: EnquiryChannel | 'all'; readonly sort: EnquirySort;
}
export const DEFAULT_ENQUIRY_FILTER: EnquiryFilter = { query: '', status: 'all', channel: 'all', sort: 'received-desc' };

export const ENQUIRY_SORT_OPTIONS: readonly Option<EnquirySort>[] = [
  { value: 'received-desc', label: 'Newest first' },
  { value: 'received-asc', label: 'Oldest first' },
  { value: 'date-asc', label: 'Requested date' },
  { value: 'value-desc', label: 'Highest value' },
];

export function sortEnquiries(rows: readonly Enquiry[], sort: EnquirySort): readonly Enquiry[] {
  const copy = rows.slice();
  switch (sort) {
    case 'received-asc': return copy.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
    case 'date-asc': return copy.sort((a, b) => a.preferredDate.localeCompare(b.preferredDate));
    case 'value-desc': return copy.sort((a, b) => (b.estimatedValue?.amountMinor ?? 0) - (a.estimatedValue?.amountMinor ?? 0));
    case 'received-desc': return copy.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }
}

export function filterEnquiries(dataset: DemoDataset, filter: EnquiryFilter): readonly Enquiry[] {
  const rows = dataset.enquiries.filter((enquiry) => {
    if (filter.status !== 'all' && enquiry.status !== filter.status) return false;
    if (filter.channel !== 'all' && enquiry.channel !== filter.channel) return false;
    const customer = findById(dataset.customers, enquiry.customerId);
    const experience = enquiry.experienceId ? findById(dataset.experiences, enquiry.experienceId) : undefined;
    return matchesQuery(filter.query, [
      enquiry.reference, customer?.displayName, customer?.contactName, experience?.name,
      enquiry.preferredDate, enquiry.notes,
    ]);
  });
  return sortEnquiries(rows, filter.sort);
}

export type QuoteSort = 'issued-desc' | 'valid-asc' | 'total-desc';
export interface QuoteFilter { readonly query: string; readonly status: QuoteStatus | 'all'; readonly sort: QuoteSort }
export const DEFAULT_QUOTE_FILTER: QuoteFilter = { query: '', status: 'all', sort: 'issued-desc' };
export const QUOTE_SORT_OPTIONS: readonly Option<QuoteSort>[] = [
  { value: 'issued-desc', label: 'Newest first' },
  { value: 'valid-asc', label: 'Expiring soonest' },
  { value: 'total-desc', label: 'Highest total' },
];

export function filterQuotes(dataset: DemoDataset, filter: QuoteFilter): readonly Quote[] {
  const rows = dataset.quotes.filter((quote) => {
    if (filter.status !== 'all' && quote.status !== filter.status) return false;
    const customer = quoteCustomer(dataset, quote);
    const experience = quoteExperience(dataset, quote);
    return matchesQuery(filter.query, [quote.reference, customer?.displayName, experience?.name, quote.validUntil]);
  });
  const copy = rows.slice();
  switch (filter.sort) {
    case 'valid-asc': return copy.sort((a, b) => a.validUntil.localeCompare(b.validUntil));
    case 'total-desc': return copy.sort((a, b) => b.total.amountMinor - a.total.amountMinor);
    case 'issued-desc': return copy.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  }
}

export type BookingSort = 'departure-asc' | 'value-desc' | 'outstanding-desc';
export interface BookingFilter {
  readonly query: string; readonly status: BookingStatus | 'all';
  readonly payment: PaymentStatus | 'all'; readonly sort: BookingSort;
}
export const DEFAULT_BOOKING_FILTER: BookingFilter = { query: '', status: 'all', payment: 'all', sort: 'departure-asc' };
export const BOOKING_SORT_OPTIONS: readonly Option<BookingSort>[] = [
  { value: 'departure-asc', label: 'Departure date' },
  { value: 'value-desc', label: 'Highest value' },
  { value: 'outstanding-desc', label: 'Most outstanding' },
];

export function filterBookings(dataset: DemoDataset, filter: BookingFilter): readonly Booking[] {
  const rows = dataset.bookings.filter((booking) => {
    if (filter.status !== 'all' && booking.status !== filter.status) return false;
    if (filter.payment !== 'all' && booking.payment.status !== filter.payment) return false;
    const customer = bookingCustomer(dataset, booking);
    const experience = bookingExperience(dataset, booking);
    return matchesQuery(filter.query, [booking.reference, customer?.displayName, experience?.name]);
  });
  const copy = rows.slice();
  const dateOf = (booking: Booking): string => bookingDeparture(dataset, booking)?.date ?? '9999-12-31';
  switch (filter.sort) {
    case 'value-desc': return copy.sort((a, b) => b.payment.total.amountMinor - a.payment.total.amountMinor);
    case 'outstanding-desc':
      return copy.sort((a, b) => outstandingBalance(b.payment).amountMinor - outstandingBalance(a.payment).amountMinor);
    case 'departure-asc': return copy.sort((a, b) => dateOf(a).localeCompare(dateOf(b)));
  }
}

export interface DepartureFilter { readonly query: string; readonly status: DepartureStatus | 'all' }
export const DEFAULT_DEPARTURE_FILTER: DepartureFilter = { query: '', status: 'all' };

export function filterDepartures(dataset: DemoDataset, filter: DepartureFilter): readonly Departure[] {
  return dataset.departures
    .filter((departure) => {
      if (filter.status !== 'all' && departure.status !== filter.status) return false;
      const experience = findById(dataset.experiences, departure.experienceId);
      const vessel = departure.vesselId ? findById(dataset.vessels, departure.vesselId) : undefined;
      return matchesQuery(filter.query, [departure.reference, experience?.name, vessel?.name, departure.date]);
    })
    .slice()
    .sort((a, b) => `${a.date}T${a.departureTime}`.localeCompare(`${b.date}T${b.departureTime}`));
}

export interface SearchHit {
  readonly entity: 'enquiry' | 'quote' | 'booking' | 'departure';
  readonly id: string; readonly title: string; readonly subtitle: string;
}

export function searchAll(dataset: DemoDataset, query: string, limit = 6): readonly SearchHit[] {
  if (query.trim() === '') return [];
  const hits: SearchHit[] = [];
  for (const enquiry of filterEnquiries(dataset, { ...DEFAULT_ENQUIRY_FILTER, query })) {
    hits.push({ entity: 'enquiry', id: enquiry.id, title: enquiry.reference, subtitle: findById(dataset.customers, enquiry.customerId)?.displayName ?? 'Enquiry' });
  }
  for (const quote of filterQuotes(dataset, { ...DEFAULT_QUOTE_FILTER, query })) {
    hits.push({ entity: 'quote', id: quote.id, title: quote.reference, subtitle: quoteCustomer(dataset, quote)?.displayName ?? 'Quote' });
  }
  for (const booking of filterBookings(dataset, { ...DEFAULT_BOOKING_FILTER, query })) {
    hits.push({ entity: 'booking', id: booking.id, title: booking.reference, subtitle: bookingCustomer(dataset, booking)?.displayName ?? 'Booking' });
  }
  for (const departure of filterDepartures(dataset, { ...DEFAULT_DEPARTURE_FILTER, query })) {
    hits.push({ entity: 'departure', id: departure.id, title: departure.reference, subtitle: findById(dataset.experiences, departure.experienceId)?.name ?? 'Departure' });
  }
  return hits.slice(0, limit);
}