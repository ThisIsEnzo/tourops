# MVP & Validation Roadmap

**Status:** proposed scope; do not treat as approved implementation scope until paid discovery validates it.  
**Review date:** 2026-11-16

## 1. MVP principle

The first MVP is a **paid operational outcome**, not a broad software platform. It may combine lightweight software, configuration and manual founder support.

Only build functionality required by at least two pilot customers with substantially the same workflow.

## 2. Candidate first workflow

Enquiry / quote → availability check → confirmed booking → deposit status → resource assignment → departure manifest / run sheet → completion.

This is a candidate sequence, not yet proven to be the most painful workflow.

## 3. Minimum product capabilities

### P0 — only if discovery confirms the workflow
- Operator workspace with a small number of staff roles.
- Customer and enquiry record with source and contact details.
- Quote / booking record with status and notes.
- Products/experiences and basic date/time slots.
- Resource records (e.g. vessels) and capacity.
- Manual assignment of vessel/resource and responsible staff.
- Booking-level checklist / run sheet with passengers, pickup, add-ons and special requests.
- Deposit and balance status tracking (recording status only; no custody of funds).
- Basic search, filters and daily departure view.
- CSV export and audit trail for important status changes.
- Role-based access, backups and basic data retention controls.

### P1 — only after repeated pilot requests
- Availability conflict warnings and resource calendars.
- Quote templates and configurable terms.
- Automated email or messaging notifications.
- Agent / partner booking source and commission tracking.
- Repeat-customer and post-trip follow-up.
- Import/export from a proven incumbent platform.
- Multi-language customer-facing templates.

### Explicitly out of MVP
- Full public booking website builder.
- OTA/channel-manager distribution.
- Payment gateway or stored card data.
- Automated refunds or payouts.
- AI autonomous sales agent.
- Accounting, payroll or full ERP.
- Dynamic pricing and revenue management.
- Native mobile apps.
- Complex multi-tenant customization before common workflows are known.
- International expansion and extensive integrations.

## 4. Manual-first pilot alternative

Before building a full app, test the workflow with:
- a shared structured booking register;
- a resource calendar;
- a standard quote and departure run-sheet template;
- clear booking statuses and payment checklist;
- a weekly review of missed follow-ups and operational errors.

If a customer will pay for this service and uses it, automate the repeated bottleneck. If they will not pay for a manual outcome, a polished app is unlikely to fix the demand problem.

## 5. Stage-gated roadmap

### Stage 0 — discovery (weeks 1–2)
Exit criteria:
- 15–20 interviews completed or a clear reason to narrow earlier;
- one repeated workflow and buyer identified;
- specific recent pain incidents documented;
- at least 5 qualified accounts.

No major product build.

### Stage 1 — paid concierge pilot (weeks 3–4)
Exit criteria:
- 2–3 paid pilots or deposits;
- clear success metric per pilot;
- named operational champion;
- agreed access to anonymized/sample data and pilot boundaries.

If no one pays, revisit ICP, pain, offer or pricing.

### Stage 2 — narrow MVP (weeks 5–8)
Build only the repeated workflow used by pilot customers. Run live operations with founder-led onboarding. Measure weekly active use, data completeness, time saved and incidents avoided.

### Stage 3 — repeatability (weeks 9–12)
Exit criteria:
- at least 5 paying customers or strong evidence of a repeatable sales path;
- onboarding time and support cost understood;
- at least 2 customers using the product repeatedly in live operations;
- positive contribution margin on the chosen plan;
- no critical reliability/security gaps.

### Stage 4 — expansion
Only after repeatability: add adjacent operator segments, integrations, self-serve onboarding, channel partners and regional expansion.

## 6. Success metrics

Primary:
- time from enquiry to quote;
- time from quote to confirmation;
- percentage of enquiries followed up;
- resource conflicts / double bookings;
- departure-day missing information;
- staff hours spent per booking;
- customer-reported financial/operational value;
- weekly active operators and retained paid accounts.

Guardrails:
- onboarding hours per customer;
- support hours per customer per month;
- failed or duplicated records;
- data import errors;
- churn and non-use;
- contribution margin.

Do not optimize vanity metrics such as number of features, total records or demo sign-ups.

## 7. Technical principles (not an implementation specification)

- Keep booking status and payment status distinct.
- Preserve an audit history for critical operational changes.
- Use explicit time zones and local trip dates.
- Model capacity and resource allocation carefully; do not promise live availability until authoritative data is available.
- Minimize stored personal data and restrict access by role.
- Do not store raw payment card details.
- Prefer provider-hosted checkout or manual payment reconciliation during pilots.
- Make export and customer offboarding possible.

## 8. Stop / pivot gates

Stop or change the hypothesis if:
- no repeated costly problem emerges after 15–20 relevant interviews;
- fewer than 2 qualified buyers will pay for a bounded pilot;
- each customer requires unrelated custom development;
- the current software stack already solves the issue adequately;
- the value cannot justify recurring price and support effort;
- onboarding/support cost makes contribution margin structurally negative.
