# TourOps — Concept Demo Foundation v0.1 (TO-01A)

**Status:** technical foundation only. The product thesis is a hypothesis; nothing here validates the market.
**Date:** 2026-11-23 · **Base:** `master` @ `3ac28d5` · **Branch:** `feature/to-01a-foundation`
**Revision:** TO-01A focused correction pass — money spacing, non-callable phone placeholders, git safety checks, real ZIP/patch backups.

## 1. Repository audit

Verified against `https://github.com/ThisIsEnzo/tourops` before writing any code.

| Area | Finding |
|---|---|
| Contents | 13 Markdown files: `README.md` + 12 documents under `docs/strategy/` |
| Application code | none |
| Dependencies / package manager | none (no `package.json`, no lockfile, no convention to follow) |
| CI workflows | none (no `.github/`) |
| Tooling config | none (no `.gitignore`, linter, formatter, editor config) |
| Coding conventions | documentation conventions only (`docs/strategy/README.md`) |
| History | 26 commits, all `docs:`/`chore:`; remote branches `master`, `docs/warm-intro-prospects` |

**Recovery verification:** no TO-01 or TO-01A artefacts exist on any branch or in any commit
(`git log --all --diff-filter=A --name-only` lists only the 13 Markdown paths). The interrupted
attempt left nothing in the repository, so a fresh implementation was started.

**Retained infrastructure:** everything. This change is purely additive — no strategy document,
`README.md` or existing path was modified or deleted.

## 2. Strategy inputs reviewed

`docs/strategy/README.md`, `commercial-strategy.md`, `founder-operating-model.md`,
`zero-budget-validation-plan.md`, `icp-and-discovery.md`, `mvp-and-roadmap.md`,
`competitive-landscape.md`.

Constraints carried into the build: concept demo only (Stage 1); synthetic data only; no backend,
auth, multi-tenancy, payments, messaging or OTA integrations; no paid services; the demo must be
labelled as a concept, never as live software. The strategy itself is unchanged.

## 3. Scaffold

React + TypeScript + Vite, npm, TypeScript `strict` plus `noUncheckedIndexedAccess`,
`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitOverride`,
`verbatimModuleSyntax`. Single `tsconfig.json` (`noEmit`); Vite handles transpilation.

| Dependency | Why |
|---|---|
| `react`, `react-dom` | UI runtime |
| `vite`, `@vitejs/plugin-react` | dev server + production build, no framework lock-in |
| `typescript`, `@types/react`, `@types/react-dom` | strict typing |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `globals` | flat-config linting incl. hooks rules |
| `vitest` | unit tests for money/selectors/data integrity; reuses the Vite pipeline |

No UI kit, no CSS framework, no router, no state library, no icon pack, no web fonts, no network
calls. The demo needs about three primitives; a component library would impose a generic admin
look and a large dependency tree.

## 4. Architecture

    src/
      app/         App shell + DemoDataProvider (state container)
      components/  DemoDataBanner; ui/ Badge, Panel
      features/    foundation/ FoundationOverview (the only screen at this stage)
      data/        synthetic dataset + integrity validator
      lib/         money, datetime, selectors, status presentation (pure)
      styles/      tokens.css, base.css, app.css
      types/       domain.ts

Rules: UI reads data only through `useDemoData()`; `lib/` stays pure and React-free; `data/` never
imports components; feature folders are created when a feature exists — `dashboard/`, `enquiries/`,
`resources/`, `operations/` are intentionally absent until TO-01B.

## 5. Domain model

`Customer`, `Experience`, `Enquiry`, `Quote` (+`QuoteLineItem`), `Booking`, `PaymentSummary`,
`Vessel`, `CrewMember`, `Guide`, `EquipmentItem`, `Departure`, `ResourceAssignment`, `ChecklistItem`,
`DemoDataset`/`DemoMeta`. Explicit unions for enquiry, quote, booking, payment, departure,
assignment, checklist, vessel and roster status.

Money is integer satang (`Money.amountMinor`) with helpers in `lib/money.ts`; dates are ISO strings,
times are `HH:MM` in `Asia/Bangkok`. Entities are `readonly`. The model covers
enquiry → quote → booking → assignment → deposit → run sheet → checklist, but **no workflow logic is
implemented yet**.

## 6. Demo data conventions

Fictional operator **Siam Blue Charters**, Ocean Marina Pattaya. Fixed reference date `2026-11-23`
so the scenario never expires. Every id starts with `demo-`; emails use RFC 2606 `example.*`
domains; phones are non-callable placeholders such as `+66 80 XXX 0101` — the `XXX` segment makes
them visibly fake, no claim is made that this range is reserved, and future screens must never
render them as `tel:` links. `meta.synthetic === true`; a permanent banner states the demo is not
live software.

Seeded: 5 experiences, 6 customers, 7 enquiries (all five statuses), 4 quotes, 3 bookings
(deposit paid / partially paid / deposit requested), 4 vessels (incl. partner + maintenance),
6 crew (one on leave), 2 guides, 6 equipment items (one service-due), 3 departures, 18 assignments,
16 checklist items. Quote totals and deposits are computed with the money helpers, never hard-coded.

`validateDemoDataset()` checks ids, contacts, references, cross-links, quote arithmetic, payment
coherence, manifests, capacities, vessel/crew/equipment availability and readiness. It returns
issues instead of throwing; the foundation screen displays the result and tests assert it is empty.

## 7. State foundation

`DemoDataProvider` = React context + `useState` over `createDemoDataset()`, exposing `dataset` and
`resetDemoData()`. TO-01C will swap the internals for `useReducer` with typed domain actions
(create quote, convert enquiry, assign resource, record deposit, complete checklist item) while
screens keep the same hook and pure selectors. No Redux, no persistence, no server state.

## 8. Design foundation

`styles/tokens.css` defines brand (deep navy `#0c2230`, marine teal `#1b6c7a`, brass `#b4884a`),
surfaces (warm sand canvas, raised, sunken, inverse), text, borders, six status tones, typography
(system sans + serif display + mono, 7 sizes), a 4px spacing scale, radii, one subtle shadow, focus
ring and minimal motion. Status colours are reached only through `lib/status.ts` → `Badge`.
Flat surfaces, hairline borders, no gradients, no animation beyond a 120ms hover transition.

## 9. Running it

    npm install      # generates package-lock.json — commit it
    npm run dev      # http://localhost:5173
    npm run typecheck
    npm run lint
    npm run test
    npm run build    # typecheck + vite build -> dist/
    npm run preview
    npm run check    # all of the above in sequence

Node >= 20.19.

## 10. Validation actually performed

The authoring sandbox had no Node.js preinstalled and was recycled repeatedly, destroying the
workspace mid-task.

| Check | Result |
|---|---|
| Repository audit / recovery verification | Done (live GitHub inspection) |
| `npm install react react-dom` | Succeeded once (3 packages, 7s) with a manually provisioned Node v22.14.0 |
| Full dependency install | Not completed — sandbox recycled before dev dependencies finished |
| `npm run typecheck` / `lint` / `test` / `build` | **Not executed.** No claim is made that they pass |
| Manual review of types, imports and data arithmetic | Done |
| Bootstrap git-safety and backup blocks, `bash -n` | Passed in the authoring sandbox |
| Bootstrap workflow on a throwaway repo | Passed: dirty-tree refusal, local/remote branch refusal, commit, ZIP + patch, `unzip -t`, `git apply --check -R`, SHA-256 |
| Money spacing fix, placeholder phones, new Vitest case | Written, **not executed** (no Node runtime available) |

Consequences: no `package-lock.json` is committed (it must be generated by the first real
`npm install`), and dependency versions are conservative caret ranges chosen for mutual
compatibility (Vite 6 / plugin-react 4 / Vitest 3 / ESLint 9 / typescript-eslint 8 / TS 5.8 / React 19).

## 11. Known limitations

- No lockfile yet; the first install may resolve newer patch/minor versions.
- No CI workflow added: none existed, and adding one is a separate, reviewable change.
- No router, no persistence, no responsive or accessibility audit yet.
- `ResourceAssignment.resourceId` is a plain string; integrity is enforced at runtime, not by types.
- Single screen (foundation preview) — deliberately not a product UI.

## 12. Remaining work

**TO-01B — Product UI & Core Screens:** app navigation; enquiry list/detail; quote builder view;
booking detail with payment summary; resource assignment board; departure run sheet; empty, loading
and edge-case states; responsive and keyboard/a11y pass; component tests.

**TO-01C — Interactive Workflow & QA:** reducer actions for the full scenario, deposit updates,
checklist completion, conflict warnings, reset/scenario switching, end-to-end walkthrough QA and a
demo script.
