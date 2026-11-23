# TO-01C-A — Workflow Engine & Domain Logic

**Status:** domain/state stage of a zero-budget concept demo. The product thesis remains unvalidated.
**Branch:** `feature/to-01c-operations-walkthrough` (from `master` if TO-01B is merged, otherwise from
`feature/to-01b-core-operations-ui`, which is then the PR base). **No UI is added in this stage.**

## Domain operations

All operations are pure functions in `src/lib/workflow.ts` with the shape
`(dataset, input) => WorkflowResult<T>`. Success returns a new dataset plus the created/updated
entity; failure returns only issues, so callers cannot apply partial state.

| Operation | Effect |
|---|---|
| `prepareQuoteFromEnquiry` | Read-only draft prefilled from the experience base price |
| `createQuote` | Adds a `draft` quote, links `enquiry.quoteId`, updates the estimated value |
| `sendQuote` | `draft -> sent`, enquiry `pending -> quoted` (simulated, nothing is delivered) |
| `acceptQuote` | `sent -> accepted`, guarded by validity date |
| `convertQuoteToBooking` | Creates booking + departure + checklist, enquiry `-> converted` |
| `recordDeposit` | Appends a ledger entry, recomputes the payment summary, may confirm the booking |
| `assignResource` | Adds an assignment, mirrors a confirmed vessel onto the departure |
| `updateChecklistItem` | Completes/reopens an item, recomputes departure status |
| `calculateDepartureReadiness` | Pure structured readiness (separate module) |
| `createWalkthroughDataset` / provider `resetWalkthrough` | Restores an independent copy of the seed |

## State transitions

- Enquiry: `pending -> quoted -> converted`. Declined/expired enquiries cannot be quoted.
- Quote: `draft -> sent -> accepted`. Acceptance requires a non-expired validity date.
- Booking: created `tentative`; becomes `confirmed` when the required deposit is met.
- Departure: `scheduled -> preparing -> ready`, derived from checklist progress; a confirmed
  deposit also promotes `scheduled -> preparing`.
- Duplicate conversion, duplicate acceptance and replayed payment submissions are rejected.

## Validation rules

Quote creation validates enquiry existence/state, absence of an existing quote, non-empty line
items, non-empty labels, positive integer quantities, non-negative integer satang prices, discount
bounds, deposit percentage (0 < p <= 100) or explicit deposit amount (<= total), ISO validity date
not in the past, and a positive total. All issues are collected before anything is produced.

Conversion validates quote state, prior conversion, enquiry/experience presence, ISO date not in
the past, `HH:MM` times with return after departure, a positive party and experience capacity.

## Deposit simulation

`DemoDataset.payments` is an append-only ledger of `PaymentEntry` records carrying a
`submissionId` idempotency key. Amounts must be positive integers of satang and must not exceed the
outstanding balance. Received money is allocated to the deposit first, then the balance;
`PaymentSummary` is derived, never hand-edited:

- received >= total -> `paid_in_full`
- received == required deposit -> `deposit_paid`
- 0 < received < total -> `partially_paid`
- received == 0 -> `deposit_requested` when a deposit schedule exists, otherwise `unpaid`

No provider, no card data, no funds movement. Everything is bookkeeping.

## Resource assignment rules

Existence is checked per kind. Vessels must be in service and large enough; crew and guides must
not be on leave; equipment must not be out of service. Duplicate assignments on the same departure
are rejected, as is a second vessel. Vessels, crew and guides are exclusive: an assignment
conflicting with an overlapping departure (same date, intersecting time windows) is rejected.
Equipment is unit-limited across overlapping departures. Transfers are not modelled and are
rejected explicitly. A confirmed vessel assignment is mirrored to `departure.vesselId` to preserve
the existing integrity invariant.

## Readiness calculation

`calculateDepartureReadiness` returns `isReady`, all requirements, completed/outstanding subsets and
human-readable reasons. Requirements: confirmed booking, required deposit received, vessel assigned
and suitable, captain plus supporting crew, guide when the experience kind requires one, safety
equipment for every guest, snorkel equipment when the experience includes it, and all mandatory
checklist items complete. Nothing is stored; readiness is recomputed from state on every call.

## Reset behavior

`cloneDataset` performs a JSON round-trip of the dataset (the model is intentionally JSON-safe), so
the provider's initial state and the seeded module share no references. `resetWalkthrough`
re-clones the seed and replaces both the ref and the React state, restoring enquiries, quotes,
bookings, assignments, payments and checklist in one step.

## Tests

Added: `src/lib/workflow.test.ts` (ids, quote creation/validation, acceptance, conversion,
atomicity, deposits, resources, checklist, reset/isolation), `src/lib/readiness.test.ts`,
`src/lib/scheduling.test.ts`. Existing TO-01A/TO-01B tests are untouched; dataset integrity is
asserted after each successful transition.

**Not executed.** The authoring environment for this pass had no tool runtime, so `npm run
typecheck`, `npm run lint`, `npm run test`, `npm run build` and `npm run check` were not run and no
result is claimed. Run them locally:

    npm install
    npm run check

## Limitations and decisions needing approval

1. `PaymentEntry` + `DemoDataset.payments` extend the domain (additive).
2. The `partially_paid` integrity rule was relaxed to `0 < received < total`; otherwise a partially
   paid deposit is not representable.
3. `sendQuote` was added as an explicit transition.
4. Conversion also creates the departure and its checklist template.
5. Full deposit auto-confirms a tentative booking.
6. Guide requirement is derived from experience kind; safety equipment is always required;
   "captain plus one supporting crew" is a demo policy, not a real crewing regulation.
7. Overlap detection is same-date time intersection only — no multi-day or timezone engine.