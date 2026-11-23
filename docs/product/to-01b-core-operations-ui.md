# TO-01B — Core Operations UI

**Status:** UI/navigation phase of a zero-budget concept demo. The product thesis remains unvalidated.
**Operator:** Siam Blue Charters (fictional), Ocean Marina Pattaya. **Demo date:** 2026-11-23 (fixed).
**Branch:** `feature/to-01b-core-operations-ui`. **Base:** `master` if TO-01A is merged, otherwise
`feature/to-01a-foundation` (stacked PR — the bootstrap script detects and prints which).

## Scope

Turn the TO-01A foundation into a navigable operations workspace. Read-only: no mutations, no
backend, no persistence, no integrations, no payments, no messaging.

## Screens

| Screen | Route | Contents |
|---|---|---|
| Operations dashboard | `#/overview` | Metric band, attention list, upcoming departures with readiness, recent enquiries |
| Enquiries | `#/enquiries` | Search, status/channel filters, sorting, empty state |
| Enquiry detail | `#/enquiries/:id` | Pipeline steps, enquiry facts, synthetic customer card, related quote/booking |
| Quotes | `#/quotes` | Search, status filter, sorting, expiry countdown |
| Quote workspace | `#/quotes/:id` | Document layout, parties, line items, totals, deposit, terms, read-only notice |
| Bookings | `#/bookings` | Search, booking/payment filters, totals, received, outstanding |
| Booking detail | `#/bookings/:id` | Trip facts, payment summary with progress, related records, resources, open checklist |
| Departures | `#/departures` | Search, status filter, readiness meters |
| Departure run sheet | `#/departures/:id` | Vessel/manifest/meeting point/readiness band, guest manifest, crew, guides, equipment, grouped checklist |
| Resources | `#/resources/:tab` | Vessels, crew, guides, equipment tables with condition indicators |

## Navigation model

Typed `Route` union in `src/app/navigation.ts`, serialised to the URL hash by `routeToHash` and
parsed by `parseRoute`. `useNavigation` subscribes to `hashchange`; no router dependency. Deep links,
browser back/forward and breadcrumbs all work. Unknown hashes fall back to the dashboard; unknown
record ids render an explicit "not found" panel. Resources tabs are part of the route.

## Data sources

Everything comes from `useDemoData()` (the TO-01A synthetic dataset). No screen hardcodes records.
New pure helpers:

- `src/lib/operations.ts` — date maths, relation lookups, dashboard metrics, departure view model.
- `src/lib/filters.ts` — search/filter/sort for each list plus cross-entity `searchAll`.
- `src/lib/attention.ts` — derived attention signals (quote needed, expiring quote, outstanding
  money, incomplete/blocked preparation, unavailable vessel, service-due equipment, crew cover).
- `src/lib/status.ts` — extended with roster/condition/channel/language presentation maps.

## Architecture

`app/` shell + navigation, `components/ui/` reusable primitives (Icon, DataTable, Toolbar,
FilterSelect, PageHeader, Field, Meter, StatusBadge, EmptyState), `features/<domain>/` screens,
`lib/` pure logic, `styles/` tokens and workspace CSS. Domain logic stays out of components;
`lib/` remains React-free; no `any`; TypeScript strict settings unchanged; no new dependencies.

## Interaction boundaries

Implemented: navigation, breadcrumbs, back links, global search, per-screen search/filters/sorting,
tabs, mobile drawer, related-record jumps, reset of the synthetic dataset.

Deferred to TO-01C: creating enquiries or quotes, sending quotes, converting to bookings, changing
booking status, recording payments, assigning/releasing resources, ticking checklist items,
conflict resolution, persistence. No control in this phase pretends to perform those operations.

## Demo safety

`meta.synthetic === true`, permanent demo banner and header chip, `example.*` emails, phone
placeholders containing `XXX` rendered as plain text (never `tel:` links), no live availability or
payment claims. Strategy documents are untouched.

## Validation

The authoring environment for this pass had no executable tool runtime, so `npm install`,
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` and `npm run check` were
**not executed**. Nothing is claimed to pass. Run them locally:

    npm install
    npm run check

New tests added (not yet executed): `src/lib/filters.test.ts`, `src/lib/operations.test.ts`,
`src/lib/attention.test.ts`, `src/app/navigation.test.ts`. TO-01A tests are unchanged.

## Known limitations

- No lockfile until the first local `npm install`.
- Table rows are keyboard-activatable but keep native table semantics rather than a grid role.
- Readiness and attention are derived heuristics for the demo, not an operational rules engine.
- No browser, mobile-device or accessibility audit has been performed yet.