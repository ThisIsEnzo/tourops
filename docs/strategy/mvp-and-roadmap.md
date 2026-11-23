# MVP & Validation Roadmap

**Status:** proposed; no production MVP approved.  
**Review date:** 2026-11-24  
**Validation cash budget:** $0.

## 1. MVP principle

The current deliverable is a concept demo, not a production SaaS MVP. The demo exists to communicate a workflow using synthetic data. It is not evidence that the workflow is a real pain point or that operators will pay for it.

The primary hypothesis remains enquiry / quote → booking confirmation → deposit visibility → resource assignment → departure readiness. The exact workflow and target operator are still unvalidated.

## 2. Existing demo scope — frozen by default

- One fictional marine operator and synthetic fleet/crew.
- Enquiry and quote status.
- Booking examples, basic resource assignment, and departure view.
- Manually represented deposit status.
- Clickable walkthrough and realistic examples.

Clearly label all data and interactions as simulated. No real customers, payments, live availability, or external messaging.

Do not add features or polish by default. A small change is acceptable only if it fixes a demonstrated usability issue or materially improves an explicitly approved evidence-gathering experiment.

## 3. What to postpone

Until credible evidence: authentication and multi-tenancy; production database and customer-data migration; real-time availability and conflict resolution; LINE / WhatsApp APIs; payment gateway; OTA/channel integrations; customer-facing booking website; accounting, commissions, and payouts; autonomous AI; native mobile apps; complex permissions or configurable workflows.

Before any live pilot, assess and implement appropriate security, access control, backup, audit, privacy, and export controls.

## 4. Stage-gated roadmap — no artificial deadlines

### Stage A — evidence readiness
- Keep the [evidence register](../validation/market-evidence-register.md) and [product hypotheses](../validation/product-hypotheses.md) small, explicit, and current.
- Complete only free desk research that can materially inform the next discovery step.
- Review the [warm market access map](./warm-market-access-map.md) and decide whether one permission-based introduction feels natural.
- Do not contact anyone without the founder's explicit decision.

**Exit:** one realistic discovery opportunity is available, or the access constraint is clearly documented. No build required.

### Stage B — first discovery cycle
- Conduct one low-pressure conversation only if the founder chooses to use a warm introduction.
- Use the [operator walkthrough](../validation/operator-walkthrough.md); ask about actual behavior and a recent incident, not whether they like TourOps.
- Record anonymized observations with the [feedback template](../validation/operator-feedback-template.md).
- Review the evidence and contradictions before choosing another step.

**Exit:** a concrete workflow and problem are understood, or the conversation provides no useful evidence. Either outcome is valid.

### Stage C — replication check
Only if the first conversation reveals a specific, consequential problem worth checking, seek one independent comparison through a natural, permission-based route. Do not expand the sample to hit a quota. Compare workflow, frequency, impact, and context—not just similar wording.

**Exit:** repeated problem evidence, contradiction, or inconclusive access. Do not force a green outcome.

### Stage D — narrow prototype decision
A limited prototype may be proposed only after repeated specific problem evidence, a meaningful gap in the current workaround, an identifiable user and likely buyer, and a practical evaluation opportunity explicitly offered by a consenting operator.

This permits a fresh decision about a small experiment; it is not approval for full SaaS or automatic permission to implement.

### Stage E — paid pilot
A live pilot requires explicit operator agreement, defined scope and success measures, a named owner, privacy/security safeguards, a realistic payment path, and clear exit criteria. No free bespoke build or real customer data without a separate decision.

### Stage F — repeatability
Only after real use and commercial evidence: standardize onboarding, support, pricing, reliability, and retention. Expand segments only when the same workflow and value proposition repeat.

## 5. Metrics

During discovery, track evidence quality: independent sources, concrete recent examples, frequency, consequence, current workaround, affected role, decision-maker, evaluation request, and commercial commitment.

During a pilot, measure only agreed outcomes such as enquiry-to-quote time, quote-to-confirmation time, follow-up completion, resource conflicts, departure-day missing information, staff hours per booking, usage/retention, onboarding/support hours, and contribution margin.

## 6. Security and data guardrails

Use synthetic data in demos. Do not store real passenger/customer details during concept validation. Do not store raw card data or handle funds. Before a live pilot, assess Thai PDPA obligations, access controls, retention, backups, exports, and incident handling. Do not promise accurate availability without an authoritative source of truth.

## 7. Stop / pause conditions

Pause or narrow if relevant operators do not describe recurring consequential pain; existing tools adequately solve it; each operator needs unrelated custom work; no credible commercial path exists within the founder's chosen operating model; access is blocked; or progress depends on spending or selling activities the founder has not agreed to do.

**The next milestone is evidence, not another feature, deadline, or launch date.**

See [Validation Workspace](../validation/README.md) for the evidence register, hypotheses, discovery guide, feedback template, and decision framework.
