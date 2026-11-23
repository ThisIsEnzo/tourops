/**
 * TourOps — concept demo domain model (TO-01A foundation).
 *
 * Types only: no workflow logic, no UI, no persistence. The model describes a
 * FICTIONAL operator ("Siam Blue Charters") and supports one candidate workflow:
 *
 *   pending enquiry -> quote -> confirmed booking -> resource assignment
 *   -> deposit update -> departure run sheet -> checklist completion
 *
 * The workflow itself is intentionally NOT implemented here (TO-01B screens,
 * TO-01C interactions).
 *
 * Conventions: money is an integer number of satang; dates are ISO strings;
 * times are 24h local strings in Asia/Bangkok; entities are readonly so future
 * state updates must produce new objects. No card data, no real personal data.
 */

/* Primitives -------------------------------------------------------- */

export type Currency = 'THB';

/** An amount in minor units (1 THB = 100 satang). */
export interface Money {
  readonly amountMinor: number;
  readonly currency: Currency;
}

/** Calendar date, `YYYY-MM-DD`. */
export type IsoDate = string;
/** ISO 8601 timestamp with offset, e.g. `2026-11-23T09:15:00+07:00`. */
export type IsoDateTime = string;
/** Wall-clock time in the operator timezone, `HH:MM`. */
export type LocalTime = string;

export type CustomerId = string;
export type ExperienceId = string;
export type EnquiryId = string;
export type QuoteId = string;
export type BookingId = string;
export type VesselId = string;
export type CrewMemberId = string;
export type GuideId = string;
export type EquipmentId = string;
export type DepartureId = string;
export type AssignmentId = string;
export type ChecklistItemId = string;

export type Language = 'en' | 'th' | 'ru' | 'zh' | 'de' | 'fr';

/* Status unions ----------------------------------------------------- */

export type EnquiryStatus = 'pending' | 'quoted' | 'converted' | 'declined' | 'expired';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
export type BookingStatus = 'tentative' | 'confirmed' | 'completed' | 'cancelled';

/** Manually recorded payment state. TourOps never processes payments. */
export type PaymentStatus =
  | 'unpaid'
  | 'deposit_requested'
  | 'deposit_paid'
  | 'partially_paid'
  | 'paid_in_full'
  | 'refunded';

/** How the operator says the money arrived. No card details are stored. */
export type PaymentMethod = 'bank_transfer' | 'cash' | 'agent_voucher';

export type DepartureStatus = 'scheduled' | 'preparing' | 'ready' | 'departed' | 'completed' | 'cancelled';
export type AssignmentStatus = 'proposed' | 'confirmed' | 'released';
export type ChecklistStatus = 'pending' | 'done' | 'blocked';
export type VesselStatus = 'in_service' | 'maintenance' | 'inactive';
export type RosterStatus = 'active' | 'on_leave' | 'contractor';
export type EquipmentCondition = 'good' | 'service_due' | 'out_of_service';

export type ResourceKind = 'vessel' | 'crew' | 'guide' | 'equipment' | 'transfer';
export type EnquiryChannel = 'line' | 'whatsapp' | 'email' | 'phone' | 'website' | 'agent' | 'walk_in';
export type ExperienceKind = 'private_charter' | 'sunset_cruise' | 'snorkelling_trip' | 'sport_fishing' | 'island_transfer';
export type VesselKind = 'motor_yacht' | 'catamaran' | 'sailing_yacht' | 'speedboat';
export type CrewRole = 'captain' | 'engineer' | 'deckhand' | 'steward' | 'chef';
export type EquipmentCategory = 'snorkelling' | 'fishing' | 'watersports' | 'safety' | 'comfort';
export type ChecklistCategory = 'guest' | 'safety' | 'provisioning' | 'crew' | 'documents';

/* Value objects ----------------------------------------------------- */

export interface PartySize {
  readonly adults: number;
  readonly children: number;
}

export interface PickupDetails {
  readonly location: string;
  readonly time: LocalTime;
  readonly transferIncluded: boolean;
  readonly note?: string;
}

/** Payment state as an operator records it by hand. Received never exceeds total. */
export interface PaymentSummary {
  readonly status: PaymentStatus;
  readonly total: Money;
  readonly depositRequired: Money;
  readonly depositReceived: Money;
  readonly balanceReceived: Money;
  readonly depositDueOn: IsoDate | null;
  readonly balanceDueOn: IsoDate | null;
  readonly method: PaymentMethod | null;
  readonly lastUpdatedAt: IsoDateTime | null;
  readonly note?: string;
}

/* Catalogue and people ---------------------------------------------- */

export interface Experience {
  readonly id: ExperienceId;
  readonly name: string;
  readonly kind: ExperienceKind;
  readonly durationHours: number;
  readonly basePrice: Money;
  readonly maxPassengers: number;
  readonly departurePort: string;
  readonly summary: string;
  readonly includes: readonly string[];
}

export interface Customer {
  readonly id: CustomerId;
  readonly displayName: string;
  readonly contactName: string;
  readonly preferredChannel: EnquiryChannel;
  /** Fictional number from the reserved demo block (see src/data/demoMeta.ts). */
  readonly phone: string;
  /** Reserved example domain — never a real mailbox. */
  readonly email: string;
  readonly preferredLanguage: Language;
  readonly repeatGuest: boolean;
  readonly notes: string;
}

export interface Vessel {
  readonly id: VesselId;
  readonly name: string;
  readonly kind: VesselKind;
  readonly lengthMetres: number;
  readonly passengerCapacity: number;
  readonly homePort: string;
  readonly ownership: 'owned' | 'partner';
  readonly status: VesselStatus;
  readonly partnerName?: string;
  readonly notes: string;
}

export interface CrewMember {
  readonly id: CrewMemberId;
  readonly fullName: string;
  readonly role: CrewRole;
  readonly certifications: readonly string[];
  readonly languages: readonly Language[];
  readonly phone: string;
  readonly rosterStatus: RosterStatus;
  readonly notes?: string;
}

export interface Guide {
  readonly id: GuideId;
  readonly fullName: string;
  readonly specialities: readonly string[];
  readonly languages: readonly Language[];
  readonly phone: string;
  readonly rosterStatus: RosterStatus;
  readonly notes?: string;
}

export interface EquipmentItem {
  readonly id: EquipmentId;
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly totalUnits: number;
  readonly condition: EquipmentCondition;
  readonly storageLocation: string;
  readonly notes?: string;
}

/* Commercial pipeline ----------------------------------------------- */

export interface Enquiry {
  readonly id: EnquiryId;
  /** Human-facing reference, e.g. `ENQ-2611-014`. */
  readonly reference: string;
  readonly customerId: CustomerId;
  readonly channel: EnquiryChannel;
  readonly receivedAt: IsoDateTime;
  readonly experienceId: ExperienceId | null;
  readonly experienceKind: ExperienceKind;
  readonly preferredDate: IsoDate;
  readonly flexibleDates: boolean;
  readonly party: PartySize;
  readonly pickupLocation: string | null;
  readonly specialRequests: readonly string[];
  readonly estimatedValue: Money | null;
  readonly status: EnquiryStatus;
  readonly quoteId: QuoteId | null;
  readonly bookingId: BookingId | null;
  readonly notes: string;
}

export interface QuoteLineItem {
  readonly id: string;
  readonly label: string;
  readonly quantity: number;
  readonly unitPrice: Money;
}

export interface Quote {
  readonly id: QuoteId;
  readonly reference: string;
  readonly enquiryId: EnquiryId;
  readonly status: QuoteStatus;
  readonly issuedAt: IsoDateTime;
  readonly validUntil: IsoDate;
  readonly lineItems: readonly QuoteLineItem[];
  readonly discount: Money | null;
  readonly total: Money;
  readonly depositRequired: Money;
  readonly terms: string;
  readonly notes?: string;
}

export interface Booking {
  readonly id: BookingId;
  readonly reference: string;
  readonly enquiryId: EnquiryId | null;
  readonly quoteId: QuoteId | null;
  readonly customerId: CustomerId;
  readonly experienceId: ExperienceId;
  readonly departureId: DepartureId | null;
  readonly status: BookingStatus;
  readonly party: PartySize;
  readonly confirmedAt: IsoDateTime | null;
  readonly pickup: PickupDetails | null;
  readonly specialRequests: readonly string[];
  readonly payment: PaymentSummary;
  readonly notes: string;
}

/* Operations -------------------------------------------------------- */

export interface Departure {
  readonly id: DepartureId;
  readonly reference: string;
  readonly date: IsoDate;
  readonly departureTime: LocalTime;
  readonly returnTime: LocalTime;
  readonly experienceId: ExperienceId;
  /** Mirrors the confirmed vessel assignment; null while the vessel is provisional. */
  readonly vesselId: VesselId | null;
  readonly bookingIds: readonly BookingId[];
  readonly status: DepartureStatus;
  readonly meetingPoint: string;
  readonly passengerCount: number;
  readonly notes: string;
}

/**
 * Allocation of one constrained resource to a departure. `resourceId` points at
 * the collection selected by `kind`; referential integrity is asserted by
 * `validateDemoDataset` rather than by the type system.
 */
export interface ResourceAssignment {
  readonly id: AssignmentId;
  readonly departureId: DepartureId;
  readonly kind: ResourceKind;
  readonly resourceId: string;
  /** e.g. `captain`, `deckhand`, `snorkel guide`. Null for vessels and equipment. */
  readonly role: string | null;
  /** Units reserved (equipment); always 1 for people and vessels. */
  readonly units: number;
  readonly status: AssignmentStatus;
  readonly note?: string;
}

export interface ChecklistItem {
  readonly id: ChecklistItemId;
  readonly departureId: DepartureId;
  readonly label: string;
  readonly category: ChecklistCategory;
  readonly status: ChecklistStatus;
  readonly required: boolean;
  readonly ownerRole: string | null;
  readonly note?: string;
}

/* Dataset envelope -------------------------------------------------- */

export interface DemoMeta {
  readonly operatorName: string;
  readonly homePort: string;
  readonly timezone: 'Asia/Bangkok';
  readonly currency: Currency;
  /** Fixed "today" so the synthetic scenario never drifts or expires. */
  readonly referenceDate: IsoDate;
  readonly datasetVersion: string;
  /** Always true: every record in this dataset is invented. */
  readonly synthetic: true;
  readonly disclaimer: string;
}

export interface DemoDataset {
  readonly meta: DemoMeta;
  readonly experiences: readonly Experience[];
  readonly customers: readonly Customer[];
  readonly enquiries: readonly Enquiry[];
  readonly quotes: readonly Quote[];
  readonly bookings: readonly Booking[];
  readonly vessels: readonly Vessel[];
  readonly crew: readonly CrewMember[];
  readonly guides: readonly Guide[];
  readonly equipment: readonly EquipmentItem[];
  readonly departures: readonly Departure[];
  readonly assignments: readonly ResourceAssignment[];
  readonly checklist: readonly ChecklistItem[];
}
