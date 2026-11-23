# Market Evidence Register — TourOps

**Status:** initialized; all operator-workflow questions are UNKNOWN unless a dated evidence entry says otherwise.  
**Last reviewed:** 2026-11-24.

The synthetic Siam Blue Charters demo is not market evidence. Do not upgrade an unknown based on assumptions, compliments, or repeated wording copied between documents.

## Evidence types

| Type | Meaning | Limitation |
|---|---|---|
| Observed fact | Directly observed public information or behavior | Proves only what was observed |
| Vendor claim | Competitor's own feature, pricing, or marketing statement | Self-reported; verify independently where possible |
| Operator statement | What an operator reports in a consented conversation | Recall, politeness, and selection bias may apply |
| Behavioral evidence | A demonstrated past action, workaround, spend, or tool adoption/abandonment | Stronger than hypothetical intent, still context-specific |
| Inference | Reasoned interpretation of logged evidence | Cannot exceed the strength of its inputs |
| Assumption | Not yet supported | No evidentiary weight |

Confidence: **UNKNOWN** = no evidence; **LOW** = one indirect source or uncorroborated claim; **MEDIUM** = independent sources or multiple concrete observations; **HIGH** = repeated independent behavioral evidence with corroboration. Desk research alone will rarely justify HIGH confidence for internal behavior.

## Research questions

| ID | Question | Current evidence | Confidence | Why it matters / next useful observation |
|---|---|---|---|---|
| R1 | Where do enquiries and bookings actually originate (LINE, phone, OTA, agent, repeat, walk-in, website)? | None logged | UNKNOWN | Determines whether the workflow begins with an enquiry or an already-confirmed booking |
| R2 | Are quotes genuinely customized and tracked, or are prices fixed/public? | None logged | UNKNOWN | A formal quote stage may add work if operators simply send a price list |
| R3 | How are deposits, balances, refunds, cancellations, and no-shows handled? | None logged | UNKNOWN | Must show value beyond bank apps, transfer proofs, chat, or marketplace payment handling |
| R4 | How are vessels, crew, equipment, and transfers assigned? | None logged | UNKNOWN | Resource coordination may matter only for particular fleet/staff sizes |
| R5 | What departure-readiness checks happen, and what failures have occurred? | None logged | UNKNOWN | A checklist is not a product need if the existing routine works reliably; safety-related scope has liability implications |
| R6 | What is the real current tool stack and source of truth? | None logged | UNKNOWN | The incumbent may be chat + notebook + spreadsheet + bank app rather than competing SaaS |
| R7 | Which booking, channel, charter, or operations products serve this segment, and what do they actually cover? | Competitor names are research leads only; no current vendor audit logged here | UNKNOWN | Verify product fit, pricing, Thai/mobile support, workflow ownership, and switching cost |
| R8 | Who performs daily data entry, on what device/language, and what previous tools were adopted or abandoned? | None logged | UNKNOWN | A liked product can still fail if the daily user cannot or will not maintain it |
| R9 | Are problems recent, recurring, consequential, and costly enough to justify change? | None logged | UNKNOWN | Existential problem and commercial viability question |

## Evidence log

No evidence entries are recorded in this register at initialization.

| ID | Date | Related question(s) | Type | Source / URL or anonymized session ID | What was actually observed | Limits / what it does not show | Confidence |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

Entry template:

- **ID:** E-001
- **Date accessed / observed:** YYYY-MM-DD
- **Related questions:** R#
- **Evidence type:** observed fact / vendor claim / operator statement / behavioral evidence / inference / assumption
- **Source:** public URL or anonymized session ID (OP-###)
- **Observation:** precise description; quote only when consented and non-sensitive
- **Limits:** what this evidence does not establish
- **Confidence:** UNKNOWN / LOW / MEDIUM / HIGH
- **Interpretation:** implication and competing explanations

## Desk research boundaries

Public research may map advertised channels, public prices, competitor capabilities, public cancellation/deposit policies, and review themes. Record source URLs and access dates. Reviews are weak signals and may be fake, incentivized, unrepresentative, or about guest experience rather than operator workflow.

Do not scrape behind logins, collect personal contact details, or infer that silence means a process does not exist. Do not treat a public page as proof of how the business operates internally.

## Update protocol

1. Add a dated E-entry.
2. Update only the R-entries directly affected.
3. Link the evidence ID from the relevant product hypothesis.
4. Update the strategy scorecard only when the event meets its evidence definition.
5. Preserve contradictory evidence; never silently overwrite an earlier observation.
