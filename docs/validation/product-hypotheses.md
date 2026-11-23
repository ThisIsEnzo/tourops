# Product Hypotheses — TourOps

**Status:** all hypotheses unvalidated.  
**Last reviewed:** 2026-11-24.

These are claims to test, not approved features. Rank reflects potential damage if the claim is false, not implementation priority.

| Rank | ID | Hypothesis | Current confidence | Disconfirming signal |
|---:|---|---|---|---|
| 1 | H1 | At least one narrow operator segment experiences a recurring, consequential operational problem worth changing its current process to solve. | UNKNOWN | Operators cannot identify recent concrete incidents, or consequences are trivial/infrequent |
| 2 | H2 | The problem occurs in a reachable segment that has authority and practical ability to adopt a solution. | UNKNOWN | Pain exists only in inaccessible roles, marketplace-owned workflows, or segments with no adoption path |
| 3 | H3 | The proposed enquiry → quote → booking flow matches a meaningful share of actual bookings. | UNKNOWN | Bookings usually arrive pre-confirmed, fixed-price, repeat, agent, or OTA-mediated |
| 4 | H4 | Resource assignment or departure preparation creates recurring failures that a focused tool could materially reduce. | UNKNOWN | Verbal coordination works reliably; incidents are weather/operational issues software cannot solve |
| 5 | H5 | Deposit visibility creates value beyond existing bank apps, chat, and marketplace payment workflows. | UNKNOWN | Current proof/reconciliation process is simple and incident-free |
| 6 | H6 | A new workflow can be adopted without costly duplicate entry or dependence on unwilling staff. | UNKNOWN | Information must be retyped from chat; prior tools were abandoned; daily user is not engaged |
| 7 | H7 | The actual daily user can use the product on their normal device and in their working language. | UNKNOWN | English-only or desktop-first flow does not fit the daily user; connectivity/device barriers |
| 8 | H8 | A buyer has a credible economic reason and path to pay for the specific outcome. | UNKNOWN | No current spend, no costly workaround, no budget authority, or commercial model cannot cover cost to serve |

## Evidence rules

- Every confidence change must cite one or more E-IDs from [the evidence register](./market-evidence-register.md).
- A single operator's experience can justify a narrower question or a follow-up, not a market-wide claim.
- Independent repetition matters; similar phrases without similar workflows and consequences are not replication.
- Compliments, feature wishlists, "I would use it", and hypothetical willingness to pay do not support H1 or H8.
- Existing paid tools, staff time, costly workarounds, actual switching behavior, and concrete losses are more informative than hypothetical price questions.
- Contradictions must be recorded alongside supporting evidence.

## Decision implications

- H1 unsupported or contradicted: pause the product thesis; do not compensate with features.
- H2 weak: reconsider reachability and who owns the workflow before narrowing the UI.
- H3 contradicted: remove or redesign enquiry/quote stages rather than defending the demo sequence.
- H4/H5 unsupported: cut those feature assumptions; do not preserve them because they are already implemented.
- H6/H7 contradicted: reconsider the form factor, user, or product direction.
- H8 unsupported: do not call the project commercially validated or begin a costly pilot.

No threshold in this file automatically approves development. Use the [decision framework](./validation-decision-framework.md) and make a fresh explicit decision.
