# Technology Foundation Principles

**Status:** conceptual boundaries remain in force; TO-03B adds a small set of locally justified shared frontend primitives, not a generalized platform.

## 1. Objective

Create products quickly without repeatedly rebuilding proven capabilities, while avoiding a premature universal platform.

The foundation should be extracted from demonstrated repetition across products, not designed in advance for hypothetical future markets.

## 2. Three architectural layers

### A. Shared technical capabilities

Potentially reusable when at least two real product needs justify them:

- identity and access control;
- organization / provider membership;
- media and document handling;
- notifications and communication preferences;
- audit history;
- search and filtering primitives;
- workflow / status transition infrastructure;
- payments and payouts (only after legal and commercial review);
- analytics and event instrumentation;
- localization and currency / timezone handling.

These are candidates, not a build list.

### B. Product-specific domain

Each product owns its own domain model, rules, language, and workflows.

Examples:

- Tour operations: departures, vessels, crew, capacity, manifests, weather decisions.
- Property rental: properties, units, leases, availability periods, viewings, deposits, tenancy terms.
- Activity marketplace: experiences, schedules, capacity, supplier inventory, reservations, cancellations.

Do not force these into a generic `Listing`, `Booking`, or `Resource` abstraction until actual requirements show that their semantics and lifecycle are genuinely compatible.

### C. Product experience and distribution

Customer-facing discovery, comparison, onboarding, and transaction flows may differ substantially by market. Treat them as product-specific until repeated evidence supports shared components.

## 3. Reuse decision rule

A capability becomes a shared platform component only when:

1. at least two concrete product workflows need it;
2. the semantics are materially the same;
3. sharing reduces total complexity rather than hiding it;
4. the component can evolve without coupling unrelated product releases;
5. ownership, security, data boundaries, and migration are understood.

Otherwise, duplicate a small amount of code rather than create a costly abstraction.

## 4. Integration-first, not data-hoarding

When a market is fragmented, prefer authorised APIs, partner feeds, exports, and explicit supplier submissions.

Do not assume public websites or social platforms permit scraping, republication, or automated contact extraction. Review terms, consent, privacy, copyright, and local law before collecting or redistributing listing or customer data.

## 5. Trust and data principles

- Collect the minimum data needed for the tested workflow.
- Clearly identify the source and last-confirmed time of externally supplied information.
- Never label availability as confirmed without an authoritative confirmation mechanism.
- Preserve auditability for material status and price changes.
- Separate demo data from real customer data.
- Define retention, deletion, export, access, and incident handling before production use.
- Do not handle payment card data directly; use a suitable payment provider if a validated business requires payments.
- Assess jurisdiction-specific obligations before operating in a market.

## 6. Build sequence

1. Keep the current TourOps demo isolated and synthetic.
2. Prototype new market workflows with documents, spreadsheets, forms, or a thin UI.
3. Implement only the domain model required by the first validated use case.
4. Extract shared capabilities after a second product or workflow proves the need.
5. Add production-grade security, reliability, observability, and compliance as prerequisites to real customer data or transactions.

## 7. Explicit non-goals

Until evidence requires them, do not build:

- a universal marketplace engine;
- a universal CRM or workflow builder;
- multi-tenant SaaS infrastructure;
- generic booking, inventory, or payment abstractions;
- microservices or event-driven infrastructure;
- AI agents for autonomous transactions;
- integrations with every incumbent platform.

The foundation is a disciplined architecture and delivery method first. Shared code comes later.


## TO-03B — Shared frontend primitives

The following narrow utilities are implemented because the current TourOps UI already
had concrete consumers and repeated behaviour. This does not approve a universal
application framework or any backend/platform capability.

| Module | Responsibility | Product boundary |
|---|---|---|
| `shared/ui/tone.ts` | Status presentation contract | Product modules own status maps and labels |
| `shared/ui/option.ts` | Generic select option and status-option builder | Product modules own option content |
| `shared/search/text.ts` | Case-insensitive substring matching | Product modules choose searchable fields |
| `shared/money/format.ts` | Currency/locale/minor-unit formatting | Product modules own currency and rounding policy |
| `shared/forms/parse.ts` | Controlled-input numeric parsing | Domain/workflow layer remains authoritative for validation |
| `shared/navigation/hashLocation.ts` | Browser hash external-store subscription | Product modules own routes, parsing and breadcrumbs |
| `shared/errors/ErrorBoundary.tsx` | React render-error containment | Products may provide their own fallback copy |
| `shared/ui/ErrorState.tsx` | Product-neutral error presentation | No product tokens or product-specific copy |

The shared UI components import their contracts directly from `shared/*`. Legacy
re-exports in `lib/status` and `lib/filters` preserve existing consumer imports.
TourOps-specific status maps, filtering, money policy, routes, screens, and workflows
remain in their existing product modules.

Error containment is applied at two levels: an outer boundary around providers and
the router, plus a route-keyed boundary around the current screen. The outer boundary
can catch failures in the router, shell, and provider subtree; the route boundary
allows a failed screen to recover when navigation changes.

New tests cover formatting, parsing, option generation, hash-store subscription cleanup,
and error-boundary recovery. CI remains the authority for typecheck, lint, tests, and
production build; no local execution is claimed by this change.
