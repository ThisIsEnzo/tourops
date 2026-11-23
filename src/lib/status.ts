/**
 * Presentation mapping for domain statuses: wording and tone live here, so
 * components never invent colours or labels of their own.
 */
import type {
  AssignmentStatus, BookingStatus, ChecklistStatus, DepartureStatus,
  EnquiryStatus, PaymentStatus, QuoteStatus, VesselStatus,
} from '../types/domain';

export type StatusTone = 'neutral' | 'info' | 'positive' | 'attention' | 'critical' | 'muted';

export interface StatusPresentation {
  readonly label: string;
  readonly tone: StatusTone;
}

export const ENQUIRY_STATUS: Record<EnquiryStatus, StatusPresentation> = {
  pending: { label: 'Pending', tone: 'attention' },
  quoted: { label: 'Quoted', tone: 'info' },
  converted: { label: 'Converted', tone: 'positive' },
  declined: { label: 'Declined', tone: 'muted' },
  expired: { label: 'Expired', tone: 'critical' },
};

export const QUOTE_STATUS: Record<QuoteStatus, StatusPresentation> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'positive' },
  declined: { label: 'Declined', tone: 'muted' },
  expired: { label: 'Expired', tone: 'critical' },
};

export const BOOKING_STATUS: Record<BookingStatus, StatusPresentation> = {
  tentative: { label: 'Tentative', tone: 'attention' },
  confirmed: { label: 'Confirmed', tone: 'positive' },
  completed: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusPresentation> = {
  unpaid: { label: 'Unpaid', tone: 'critical' },
  deposit_requested: { label: 'Deposit requested', tone: 'attention' },
  deposit_paid: { label: 'Deposit paid', tone: 'info' },
  partially_paid: { label: 'Partially paid', tone: 'attention' },
  paid_in_full: { label: 'Paid in full', tone: 'positive' },
  refunded: { label: 'Refunded', tone: 'muted' },
};

export const DEPARTURE_STATUS: Record<DepartureStatus, StatusPresentation> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  preparing: { label: 'Preparing', tone: 'info' },
  ready: { label: 'Ready', tone: 'positive' },
  departed: { label: 'Departed', tone: 'neutral' },
  completed: { label: 'Completed', tone: 'muted' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
};

export const ASSIGNMENT_STATUS: Record<AssignmentStatus, StatusPresentation> = {
  proposed: { label: 'Proposed', tone: 'attention' },
  confirmed: { label: 'Confirmed', tone: 'positive' },
  released: { label: 'Released', tone: 'muted' },
};

export const CHECKLIST_STATUS: Record<ChecklistStatus, StatusPresentation> = {
  pending: { label: 'Pending', tone: 'neutral' },
  done: { label: 'Done', tone: 'positive' },
  blocked: { label: 'Blocked', tone: 'critical' },
};

export const VESSEL_STATUS: Record<VesselStatus, StatusPresentation> = {
  in_service: { label: 'In service', tone: 'positive' },
  maintenance: { label: 'Maintenance', tone: 'attention' },
  inactive: { label: 'Inactive', tone: 'muted' },
};
