# TourOps — Architecture & Quality Audit (TO-01D)

**Verification status:** this pass was authored in an environment with no executable tool runtime.
`npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run check`,
lockfile generation, Git inspection, branch creation and PR creation were **NOT RUN**. Nothing below
claims a passing check. Findings marked *confirmed* were established by reading the delivered source.

## 1. Existing architecture

Frontend-only React 19 + TypeScript (strict) + Vite 6 + Vitest 3 application over a synthetic
in-memory dataset. No backend, auth, persistence, payments or messaging.

## 2. Actual dependency direction

    types/domain.ts        <- everything (no outgoing imports)
    lib/money, datetime, selectors, status, ids
    lib/scheduling         -> selectors
    lib/operations         -> money, selectors
    lib/filters            -> money, selectors, operations
    lib/attention          -> money, selectors, operations, datetime
    lib/workflow           -> money, selectors, scheduling, ids
    lib/readiness          -> money, selectors
    data/*                 -> types, lib/money
    app/DemoDataProvider   -> data, lib/workflow
    app/navigation         -> types, lib/selectors
    features/*             -> app (hooks, route types), components/ui, lib
    components/ui          -> lib/status, lib/filters (types only)

No circular dependency was found. `lib/` never imports React or `data/`; `data/` never imports
components. Two deliberate inversions exist and are acceptable: `features/*` imports route types
from `app/navigation`, and `app/DemoDataProvider` imports the seed from `data/`.

## 3. Confirmed problems

1. **Duplicate primary control.** `WalkthroughStrip` and `WalkthroughScreen` both rendered a
   "Start scenario" button while the walkthrough route was open and inactive. Two identical primary
   actions is a UX defect and makes `getByRole('button', { name: 'Start scenario' })` throw.
2. **Duplicate readiness projection.** The hub rendered `ReadinessPanel` from `stageBody()` and again
   from a trailing block whenever the current stage was `readiness`, producing two identical panels.
3. **Ambiguous test queries.** The integration helper searched the whole document for a heading
   matching several panel titles, so it broke as soon as readiness legitimately appeared beside the
   checklist.
4. **Unsafe assertions.** `crumb.route as Route` in `App.tsx`; `model.quote!`, `model.booking!`,
   `model.departure!` in the hub.
5. **Duplicated money path.** `QuoteComposer` converted satang → baht → `thb()` → satang instead of
   using a single minor-unit constructor.
6. **Off-system icon.** `WorkflowAside` declared a private `Icon` returning a bare "→" glyph.

## 4. Changes made

- `WalkthroughStrip` is now the single canonical start control; the hub shows an inline hint instead.
- The trailing readiness panel is suppressed when readiness is already the current stage.
- The current stage is a labelled `<section aria-label="Current stage">` (role `region`), and a shared
  driver `src/test/journey.ts` scopes every query to it. Both test files use the same driver.
- Removed all four unsafe assertions by narrowing to local constants before building closures/JSX.
- Added `fromMinor()` to `lib/money.ts` as the single minor-unit constructor; `thb`, `zero`,
  `addMoney`, `subtractMoney`, `multiplyMoney`, `percentOf` and the composer now route through it.
  `fromMinor` rejects non-integer satang, turning a silent rounding class of bug into a loud error.
- `WorkflowAside` uses the design-system `Icon`.
- Added `.github/workflows/ci.yml` and three regression tests.

## 5. Deliberately unchanged

- `booking.enquiryId as string` inside an existing truthy guard in `BookingDetailScreen`: cosmetic,
  not a correctness defect; changing it would enlarge the diff without evidence of harm.
- The private `minor()` helper in `lib/workflow.ts`: behaviourally identical to `fromMinor`.
  Consolidating it touches the domain engine, which must not be edited in a quality gate that cannot
  run the domain suite. Recommended as the first follow-up once CI is green.
- Folder layout, navigation model, visual design, synthetic dataset and all business rules.
- No state-management library, no new abstraction layers, no coverage threshold.

## 6. Domain integrity findings

Reviewed by reading `lib/workflow.ts`, `lib/readiness.ts`, `lib/scheduling.ts`,
`data/validateDataset.ts` and their suites. The invariants required by the brief are implemented:
quote validation collects all issues before producing state; failed operations return no dataset, so
transitions are atomic; conversion is blocked when a booking already references the quote or the
enquiry; deposits must be positive integers, cannot exceed the outstanding balance and are
idempotent via `submissionId`; exclusive resources are conflict-checked against overlapping
departures; equipment is unit-limited; readiness is derived, never stored; reset deep-clones the seed.
No domain rule was changed in this pass.

## 7. Test failures and root causes

Reported baseline: 12 files, 10 passed, 2 failed; 81 tests, 76 passed, 5 failed. **Not reproduced
here.** By reading the source, three of the five failures are fully explained: every test in
`walkthrough.integration.test.tsx` calls `findByRole('button', { name: 'Start scenario' })`, which
throws because two such buttons existed. That is an application defect (duplicate primary control),
not a wrong expectation, and it is fixed. The remaining two failures are **unattributed**; the raw
`npm test` output (file names, test names, messages, stack traces) is required to classify them.
No test was deleted, skipped or weakened.

## 8. Coverage improvements

`walkthroughRegressions.test.tsx` locks the three confirmed defects: exactly one start control,
exactly one current-stage region and one readiness projection through the whole journey, and a reset
that clears stage controls and stale feedback. `src/test/journey.ts` removes duplicated driver logic
between the two UI suites.

## 9. Dependency and lockfile state

`package.json` is unchanged in this pass. **`package-lock.json` is still missing and was not
generated** — no npm runtime was available. CI intentionally fails fast with an explicit message
until it is committed. Required owner action:

    npm install --package-lock-only   # Node 22 LTS, engines >=20.19
    git diff -- package.json package-lock.json
    npm ci && npm run check
    git add package-lock.json && git commit -m "chore: commit reproducible npm lockfile"

No dependency was added, removed or upgraded. `jsdom`, `@testing-library/react` and
`@testing-library/user-event` are already declared and are required by the UI suites.

## 10. CI pipeline

`.github/workflows/ci.yml`, job id `quality-gate`, check name **Quality gate**. Triggers: pull requests
targeting `master` and pushes to `master` only. `permissions: contents: read`, 15-minute timeout,
concurrency cancellation, Node 22 with npm caching. Steps: checkout → lockfile guard → setup-node →
`npm ci` → `npm run typecheck` → `npm run lint` → `npm run test` → `npm run build`. No
`continue-on-error`, no secrets, no deployment. Recommended branch protection: require the
`Quality gate` check on `master` (Settings → Branches → Add rule → Require status checks to pass).

## 11. Remaining technical risks

- Two of the five reported test failures are unexplained; the quality gate cannot be declared green.
- No lockfile, so `npm ci` and therefore CI will fail on the first run.
- The UI suites have never been executed; selectors and timing may need adjustment.
- `resetWalkthrough` leaves the router on a route whose record may no longer exist; the screens render
  an explicit "not found" state, which is graceful but unverified in a browser.
- No accessibility, responsive or cross-browser verification has been performed.

## 12. Recommended evolution

Keep the current four-layer shape. When real demand appears: consolidate the minor-unit constructor,
introduce a thin repository boundary in front of `data/` only when an API exists, and split
`lib/workflow.ts` by aggregate (quote, booking, payment, assignment) once it exceeds roughly 600 lines.
Do not add Redux, a backend, event sourcing or dependency injection before a paying pilot requires them.