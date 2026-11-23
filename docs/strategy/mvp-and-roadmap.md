# MVP & Validation Roadmap

**Status:** proposed; no production MVP approved.  
**Review date:** 2026-11-24  
**Validation cash budget:** $0.

## 1. MVP principle

The current deliverable is a concept demo, not a production SaaS MVP. The demo exists to communicate a workflow with synthetic data. It is not evidence that the workflow is a real pain point or that operators will pay for it.

The primary hypothesis remains enquiry / quote → booking confirmation → deposit visibility → resource assignment → departure readiness. The exact workflow and target operator are still unvalidated.

## 2. Demo scope (existing; freeze unless evidence requires a change)

- One fictional marine operator and synthetic fleet/crew.
- Enquiry and quote status.
- Booking examples, basic resource assignment and departure view.
- Manually represented deposit status.
- Clickable walkthrough and realistic examples.

Clearly label all data and interactions as simulated. No real customers, payments, live availability or external messaging.

**Development pause:** do not add features or polish the demo by default. Only make a small change if it fixes a demonstrated usability issue or materially improves an evidence-gathering test.

## 3. What to postpone

Until credible evidence: authentication and multi-tenancy; production database and customer-data migration; real-time availability and conflict resolution; LINE / WhatsApp APIs; payment gateway; OTA/channel integrations; customer-facing booking website; accounting, commissions and payouts; autonomous AI; native mobile apps; complex permissions or configurable workflows.

Before any live pilot, assess and implement appropriate security, access control, backup, audit, privacy and export controls.

## 4. Stage-gated roadmap (no artificial deadlines)

### Stage A — Evidence readiness
- Keep the evidence register and hypotheses small and explicit.
- Finish only free desk research that can materially inform the next conversation.
- Identify one warm, permission-based access path. Do not contact anyone without the founder's explicit decision.

**Exit:** one realistic discovery opportunity is available, or the access constraint is clearly documented. No build required.

### Stage B — First discovery cycle
- Conduct one low-pressure conversation if the founder chooses to use a warm introduction.
- Ask about their actual process and one recent problem; do not pitch TourOps first.
- Record the situation, frequency, impact, current workaround and evidence confidence. Keep sensitive/private data out.

**Exit:** a concrete workflow and problem are understood—or the conversation provides no useful evidence. Either outcome is valid.

### Stage C — Replication check
Only if the first conversation reveals a consequential, plausible problem, seek a second independent operator with a similar operation. Compare the underlying workflow, not just similar words.

**Exit:** repeated problem evidence, contradiction, or inconclusive access. Do not force a green outcome.

### Stage D — Narrow prototype decision
A limited prototype may be considered only after repeated specific problem evidence, a clear current workaround/gap, a credible user and buyer, and a practical evaluation path. This is permission to plan a small experiment—not approval for full SaaS.

### Stage E — Paid pilot
A live pilot requires explicit operator agreement, scope, success measures, privacy/security safeguards, a realistic payment path and a named owner. No free bespoke build.

### Stage F — Repeatability
Only after real use and commercial evidence: standardize onboarding, support, pricing, reliability and retention. Expand segments only when the same workflow and value proposition repeat.

## 5. Metrics

Track evidence quality first: independent sources, specific recent examples, frequency, consequence, current workaround, decision-maker, evaluation request and commercial commitment.

During a pilot, measure only agreed outcomes such as enquiry-to-quote time, quote-to-confirmation time, follow-up completion, resource conflicts, departure-day missing information, staff hours per booking, usage/retention, onboarding/support hours and contribution margin.

## 6. Security and data guardrails

Use synthetic data in public demos. Do not store real passenger/customer details during concept validation. Do not store raw card data or handle funds. Before a live pilot, assess Thai PDPA obligations, access controls, retention, backups, exports and incident handling. Do not promise accurate availability without an authoritative source of truth.

## 7. Stop / pivot conditions

Pause or narrow if relevant operators do not describe recurring consequential pain; existing tools adequately solve it; each operator needs unrelated custom work; no credible commercial path exists within the founder's chosen operating model; or progress depends on spending or selling activities the founder has not agreed to do.

**The next milestone is evidence, not another feature or a launch date.**
