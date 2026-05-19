# Research: Forex Market Hours Visualiser

**Feature**: 001-forex-hours-visualiser
**Date**: 2026-05-19
**Phase**: 0 — Technology & Pattern Research

---

## Decision 1: Time Zone Handling

**Decision**: Use the native JavaScript `Date` API for all UTC time arithmetic; use
`Intl.DateTimeFormat` with `timeZoneName: 'short'` to derive and display the user's local
timezone label. No external date library (e.g., date-fns, luxon) is needed for this feature.

**Rationale**: Session open/close logic only requires comparing the current UTC hour and minute
against fixed integer thresholds — no calendar arithmetic, no DST computation, no locale
formatting beyond a timezone label. The Intl API is available in every modern browser and
Next.js server/client environments and avoids a dependency with no offsetting benefit at this
scope.

**Alternatives considered**:
- `date-fns-tz`: Full-featured but ~12 kB gzip overhead for functionality not needed here.
- `luxon`: Excellent API but adds ~23 kB; overkill for fixed-UTC-hours comparison.
- `dayjs + timezone plugin`: Smaller, but still unnecessary given fixed UTC anchor.

---

## Decision 2: Live Clock Update Mechanism

**Decision**: Use a `useEffect` hook with `setInterval` at a 1000 ms cadence inside a dedicated
`useClock` custom hook. The effect's cleanup function MUST call `clearInterval` to prevent
memory leaks when the component unmounts (aligns with Constitution Principle IV: unbounded memory
growth prohibited).

**Rationale**: `setInterval` is the standard browser mechanism for recurring 1 s updates. A
custom hook isolates the side effect, keeping components pure and making the clock testable by
injecting a mock `Date` factory. React 18 strict-mode double-invocation is handled correctly by
the cleanup return.

**Alternatives considered**:
- `requestAnimationFrame` loop: ~60 fps updates — wasteful for a 1 s clock; harder to test.
- Server-Sent Events / WebSocket: Server-side; explicitly excluded by spec constraint FR-006.
- `setInterval` inline in component: Works but leaks if extracted logic is tested in isolation.

---

## Decision 3: Session Status Logic Placement

**Decision**: Place all session open/close calculation in pure functions in
`lib/forex-sessions/session-status.ts`, accepting a `Date` parameter. Components call these
functions with the clock state; no component contains time arithmetic.

**Rationale**: Pure functions are trivially unit-testable (pass a fixed `Date`, assert result),
satisfy the constitution's TDD mandate and 100% coverage requirement on calculation paths, and
keep UI components free of domain logic.

---

## Decision 4: 24-Hour Timeline Rendering

**Decision**: Render the timeline as a CSS-grid row with 24 equal columns (one per UTC hour).
Each session occupies a `grid-column` span computed from its UTC open/close hours. Overlap
zones are rendered as a separate layer using `position: absolute` over the grid cells that fall
within the overlap range, or alternatively as a composite gradient background on the same cell.

**Rationale**: CSS Grid column spans map 1-to-1 to hour ranges with no pixel arithmetic needed
at render time. This makes the relationship between data (openHour/closeHour) and layout
explicit and testable. Sydney's midnight-crossing span (22–07) requires two grid segments: one
from column 23 to 24, and one from column 1 to 7.

**Alternatives considered**:
- Canvas/SVG: More control but significantly more rendering code; no advantage for a static
  hour-grid layout.
- Percentage-width `<div>` flex row: Simpler but fractional pixel rounding creates alignment
  drift across sessions.
- Third-party chart library (e.g., Recharts): Adds ~40 kB for a layout achievable natively.

---

## Decision 5: shadcn/ui Component Selection

**Decision**: Use the following shadcn/ui primitives:
- `Card` + `CardContent` — wraps each SessionCard status display
- `Badge` — labels overlap window type (e.g., "London / New York")
- `Separator` — visual dividers between timeline and card areas

**Rationale**: These components carry the project's Tailwind design tokens automatically,
satisfying Constitution Principle III (all styles from design tokens, no inline overrides).

---

## Decision 6: Vitest Configuration

**Decision**: Use Vitest with `@vitejs/plugin-react` and `jsdom` environment for component
tests. Pure function tests (session logic) run in the default `node` environment for speed.
Configure `vitest.config.ts` at the repository root.

**Rationale**: Vitest is the specified test runner. The `jsdom` environment is needed only for
components using `document`/`window`; isolating pure-function tests to `node` keeps the test
suite fast. Coverage is collected via the built-in `v8` provider; thresholds enforced in config
(≥ 80% global, 100% for `lib/forex-sessions/`).

---

## Decision 7: Next.js App Router Client Boundary

**Decision**: `app/page.tsx` remains a React Server Component. The `ForexHoursVisualiser`
component is the top-level `'use client'` boundary. All child components inherit the client
context and need no individual `'use client'` directives.

**Rationale**: Moving the client boundary as high as needed (but no higher than necessary)
minimises server/client serialisation overhead. Since the entire feature is client-rendered
(live clock, client-side time), one boundary at the feature root is appropriate.

---

## Session Hours Reference (confirmed)

| Session  | UTC Open | UTC Close | Crosses Midnight |
|----------|----------|-----------|-----------------|
| Sydney   | 22:00    | 07:00     | Yes             |
| Tokyo    | 00:00    | 09:00     | No              |
| London   | 08:00    | 17:00     | No              |
| New York | 13:00    | 22:00     | No              |

## Derived Overlap Windows

| Overlap              | UTC Start | UTC End | Duration |
|----------------------|-----------|---------|----------|
| Sydney / Tokyo       | 00:00     | 07:00   | 7 h      |
| Tokyo / London       | 08:00     | 09:00   | 1 h      |
| London / New York    | 13:00     | 17:00   | 4 h      |

No three-way overlaps exist. Sydney and New York do not overlap (NY closes at 22:00, Sydney
opens at 22:00 — boundary coincidence, not simultaneous open).

---

## Spec Errata Noted

The edge cases section in `spec.md` (line 108) still references the old times
"Sydney: 21:00–06:00, Tokyo: 23:00–08:00". These are superseded by the corrected UTC hours
confirmed during specification review. No functional impact — the assumptions section is
correct.
