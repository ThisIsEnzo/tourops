# TO-01C — End-to-End Operations Walkthrough

**Status:** interactive concept demo on synthetic data. The product thesis remains unvalidated.
**Branch:** `feature/to-01c-operations-walkthrough`, stacked on TO-01B (and TO-01A) until they merge.

## Journey

`Enquiry → Quote → Booking → Deposit → Resources → Preparation → Readiness`, demonstrated with the
seeded enquiry `ENQ-2611-014` (Suksai Family Group, private catamaran charter, 16 guests, 5 Dec 2026).

The walkthrough is **not a wizard**. A persistent strip above the content shows progress and the
next action; the sidebar, search, filters and every TO-01B screen stay available at all times. The
hub at `#/walkthrough` renders the control for whichever stage is current, and the same controls are
embedded in the existing detail screens through a composition slot (`WorkflowAside`), so no screen
is duplicated.

| Stage | Surface | Action |
|---|---|---|
| Enquiry | Hub + enquiry detail | `QuoteComposer` → `createQuote` |
| Quote | Hub + quote detail | `QuoteActions` → `sendQuote`, `acceptQuote` |
| Booking | Hub + quote detail | `QuoteActions` → `convertQuoteToBooking` |
| Deposit | Hub + booking detail | `DepositForm` → `recordDeposit` |
| Resources | Hub + run sheet | `ResourceAssigner` → `assignResource` |
| Preparation | Hub + run sheet | `PreparationBoard` → `updateChecklistItem` |
| Readiness | Hub + run sheet | `ReadinessPanel` (read-only projection) |

## Domain boundary

Every mutation calls a Stage A action from `DemoDataProvider`. Components hold only form input and
the last `WorkflowResult`. Money previews reuse `quoteSubtotal`, `quoteTotal` and `percentOf` from
`src/lib/money.ts`; validation, conversion rules, payment derivation, conflict detection, readiness
and reset are never reimplemented in the UI. `walkthroughModel.ts` only reads state and the Stage A
readiness result to label stages.

## Feedback and safety

Successes render the domain message; failures render every `WorkflowIssue` with its field, in an
`role="alert"` list. Failed actions cannot mutate state because Stage A returns no dataset on error.
Duplicate conversion is prevented by removing the action once a booking exists. Deposits are
labelled simulated bookkeeping, phone placeholders containing `XXX` stay plain text, and no
network, payment provider, messaging or persistence exists.

## Readiness

Shown exactly as calculated: Ready / Not ready, completed requirements, outstanding requirements and
the reason for each gap. There is no manual "mark ready" control.

## Reset

`Reset scenario` appears in the strip and on the hub. If the dataset differs structurally from the
seed, an inline two-step confirm appears (no modal). Confirming calls the Stage A `resetWalkthrough`,
which re-clones the seed, restores enquiries, quotes, bookings, assignments, payments and checklist,
and re-points the scenario at the default enquiry so no stale selection or derived value survives.

## Tests

- `walkthroughModel.test.ts` — stage derivation, progression through real domain transitions,
  completion, modification detection.
- `walkthrough.integration.test.tsx` (jsdom) — the full journey through the UI, visible validation
  errors with unchanged state, and TO-01B search/detail integrity after a walkthrough mutation.

**Not executed.** This delivery was authored in an environment with no tool runtime, so
`npm install`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` and
`npm run check` were not run and no result is claimed. New dev dependencies are required for the
jsdom suite: `jsdom`, `@testing-library/react`, `@testing-library/user-event`.

    npm install
    npm run check

## Known limitations

- The UI suite has never been executed; selectors and timing may need adjustment on first run.
- Quote line-item preview uses the shared money utilities rather than a dedicated domain preview
  function; results match `createQuote` because both call the same helpers.
- Reset detection compares serialized datasets, which is adequate for this dataset size only.
- No accessibility audit, browser run or device testing has been performed.