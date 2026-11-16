# MVP & Validation Roadmap

**Status:** proposed; no production MVP approved.  
**Review date:** 2026-11-16  
**Validation cash budget:** $0.

## 1. MVP principle

The immediate deliverable is a concept demo, not a production SaaS MVP. Build only enough to communicate one workflow using synthetic data. No large backend or production architecture before evidence.

The first product hypothesis remains enquiry / quote → availability check → confirmed booking → deposit status → resource assignment → departure run sheet. Discovery must determine which parts matter most.

## 2. Demo scope (now)

- One fictional marine operator.
- A small fictional fleet and crew roster.
- Enquiry and quote status.
- One or two booking examples.
- Basic resource assignment.
- Departure view / run sheet.
- Deposit status shown as a manually entered state.
- Clickable navigation and realistic edge cases.

Clearly mark all data and interactions as simulated. No real customers, payments, live availability or external messaging.

## 3. What to postpone

Until credible operator feedback: authentication and multi-tenancy; production database and customer-data migration; real-time availability and conflict resolution; LINE / WhatsApp APIs; payment gateway or deposits collection; OTA/channel integrations; customer-facing booking website; accounting, commissions and automated payouts; autonomous AI; native mobile apps; complex permissions and configurable workflows beyond what a pilot requires.

Before any live pilot, add appropriate security, access control, backup, audit, privacy and export controls.

## 4. Stage-gated roadmap

### Stage 0 — free desk research (days 1–7)
Exit: 10–15 operator profiles, dated sources, competitor map and three distinct pain hypotheses.

### Stage 1 — synthetic demo (days 8–14)
Exit: one clickable concept walkthrough, a concept page draft and a short structured feedback path. Demo must not imply production capability.

### Stage 2 — organic inbound test (days 15–30)
Exit target: substantive feedback from relevant operators and at least two independent requests for a walkthrough or evaluation. Low traffic means the distribution test is inconclusive, not that the problem is absent.

### Stage 3 — limited prototype (only after green gate)
Build only the repeated workflow that inbound evidence supports. Keep it reversible and low cost. Do not add production integrations without a specific pilot requirement and cost review.

### Stage 4 — paid pilot (requires a commercial path)
A live pilot requires clear scope, consent, privacy/security safeguards, payment arrangements and a named operator contact. If the founder continues to avoid sales, first find a credible partner to handle commercial conversations under a no-upfront-cost arrangement.

### Stage 5 — repeatability
Only after real paid use: standardize onboarding, support, pricing, reliability and customer retention. Expand to adjacent segments only when the same workflow repeats.

## 5. Metrics

Concept stage: relevant inbound operator responses; specificity and repetition of pain descriptions; demo requests; requests for pricing or pilot; traffic sources and conversion, if available.

Pilot stage: enquiry-to-quote time; quote-to-confirmation time; follow-up completion; resource conflicts; departure-day missing information; staff hours per booking; weekly active users and retained accounts; onboarding and support hours; contribution margin.

## 6. Security and data guardrails

Use synthetic data in public demos. Do not store real passenger/customer details at concept stage. Do not store raw card data or handle funds. Before a live pilot, assess Thai PDPA obligations, access controls, retention, backups, exports and incident handling. Do not promise accurate availability unless an authoritative source of truth exists.

## 7. Stop / pivot conditions

No repeated pain after relevant feedback; incumbent tools already solve the workflow; different operators require unrelated custom builds; no credible path to a paid pilot without expensive selling or delivery; or the technical-only founder model cannot be reconciled with the minimum human work needed to operate the business.

In those cases, pause or narrow the project rather than continuing development by inertia.