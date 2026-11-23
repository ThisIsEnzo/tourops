/** Derived "needs attention" signals. Simulated, read-only, fully data-driven. */
import type { DemoDataset } from '../types/domain';
import { formatDate } from './datetime';
import { formatMoney, outstandingBalance } from './money';
import { findById } from './selectors';
import {
  bookingDeparture, daysBetween, departureView, isActiveBooking, quoteCustomer,
} from './operations';

export type AttentionSeverity = 'critical' | 'attention' | 'info';
export type AttentionKind = 'enquiry' | 'quote' | 'deposit' | 'departure' | 'resource';

export interface AttentionItem {
  readonly id: string;
  readonly kind: AttentionKind;
  readonly severity: AttentionSeverity;
  readonly title: string;
  readonly detail: string;
  readonly target: { readonly entity: 'enquiry' | 'quote' | 'booking' | 'departure' | 'resource'; readonly id: string };
}

const RANK: Record<AttentionSeverity, number> = { critical: 0, attention: 1, info: 2 };

export function attentionItems(dataset: DemoDataset): readonly AttentionItem[] {
  const today = dataset.meta.referenceDate;
  const items: AttentionItem[] = [];

  for (const enquiry of dataset.enquiries) {
    if (enquiry.status !== 'pending') continue;
    const customer = findById(dataset.customers, enquiry.customerId);
    items.push({
      id: `attention-enquiry-${enquiry.id}`, kind: 'enquiry', severity: 'attention',
      title: `Quote needed · ${enquiry.reference}`,
      detail: `${customer?.displayName ?? 'Guest'} · requested ${formatDate(enquiry.preferredDate)}`,
      target: { entity: 'enquiry', id: enquiry.id },
    });
  }

  for (const quote of dataset.quotes) {
    if (quote.status !== 'sent') continue;
    const left = daysBetween(today, quote.validUntil);
    items.push({
      id: `attention-quote-${quote.id}`, kind: 'quote', severity: left <= 1 ? 'critical' : 'attention',
      title: left < 0 ? `Quote lapsed · ${quote.reference}` : `Quote expires in ${left} day${left === 1 ? '' : 's'} · ${quote.reference}`,
      detail: `${quoteCustomer(dataset, quote)?.displayName ?? 'Guest'} · ${formatMoney(quote.total)} · valid until ${formatDate(quote.validUntil)}`,
      target: { entity: 'quote', id: quote.id },
    });
  }

  for (const booking of dataset.bookings) {
    if (!isActiveBooking(booking)) continue;
    const outstanding = outstandingBalance(booking.payment);
    if (outstanding.amountMinor <= 0) continue;
    const depositShort = booking.payment.depositReceived.amountMinor < booking.payment.depositRequired.amountMinor;
    const due = depositShort ? booking.payment.depositDueOn : booking.payment.balanceDueOn;
    const left = due ? daysBetween(today, due) : 99;
    items.push({
      id: `attention-deposit-${booking.id}`, kind: 'deposit', severity: left <= 1 ? 'critical' : 'attention',
      title: `${depositShort ? 'Deposit' : 'Balance'} outstanding · ${booking.reference}`,
      detail: `${formatMoney(outstanding)} ${due ? `due ${formatDate(due)}` : 'unscheduled'} · ${bookingDeparture(dataset, booking)?.reference ?? 'no departure'}`,
      target: { entity: 'booking', id: booking.id },
    });
  }

  for (const departure of dataset.departures) {
    const view = departureView(dataset, departure.id);
    if (!view || view.daysAway < 0 || view.daysAway > 7 || view.progress.requiredOutstanding === 0) continue;
    items.push({
      id: `attention-departure-${departure.id}`, kind: 'departure',
      severity: view.progress.blocked > 0 ? 'critical' : 'attention',
      title: view.progress.blocked > 0
        ? `Departure blocked · ${departure.reference}`
        : `Preparation incomplete · ${departure.reference}`,
      detail: `${formatDate(departure.date)} · ${view.progress.requiredOutstanding} required item(s) open${view.progress.blocked > 0 ? `, ${view.progress.blocked} blocked` : ''}`,
      target: { entity: 'departure', id: departure.id },
    });
  }

  for (const vessel of dataset.vessels) {
    if (vessel.status === 'in_service') continue;
    items.push({
      id: `attention-vessel-${vessel.id}`, kind: 'resource', severity: 'info',
      title: `Vessel unavailable · ${vessel.name}`,
      detail: vessel.notes,
      target: { entity: 'resource', id: vessel.id },
    });
  }

  for (const item of dataset.equipment) {
    if (item.condition === 'good') continue;
    const used = dataset.assignments.some((assignment) => assignment.kind === 'equipment' && assignment.resourceId === item.id);
    if (!used) continue;
    items.push({
      id: `attention-equipment-${item.id}`, kind: 'resource', severity: 'attention',
      title: `Equipment service due · ${item.name}`,
      detail: item.notes ?? `${item.totalUnits} units in ${item.storageLocation}`,
      target: { entity: 'resource', id: item.id },
    });
  }

  for (const assignment of dataset.assignments) {
    if (assignment.kind !== 'crew' || assignment.status === 'confirmed') continue;
    const member = findById(dataset.crew, assignment.resourceId);
    if (!member || member.rosterStatus !== 'on_leave') continue;
    items.push({
      id: `attention-crew-${assignment.id}`, kind: 'resource', severity: 'attention',
      title: `Crew cover needed · ${member.fullName}`,
      detail: assignment.note ?? 'Proposed assignment while on leave.',
      target: { entity: 'departure', id: assignment.departureId },
    });
  }

  return items.slice().sort((a, b) => RANK[a.severity] - RANK[b.severity] || a.title.localeCompare(b.title));
}