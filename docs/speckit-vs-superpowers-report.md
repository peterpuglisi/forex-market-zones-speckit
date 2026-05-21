# Code Quality Review: `speckit` vs `superpowers`

Two implementations of the same app — a live Forex market-hours visualiser (4 sessions, status cards, 24h timeline, dual clock). Both are Next.js App Router + TypeScript + Tailwind + shadcn/ui + Vitest.

> Note: only `src/` was provided for each project (no `package.json`/config files), so build tooling was not assessed.

## Verdict

**`superpowers` is more correct; `speckit` is better factored and better tested.** They fail and succeed on opposite axes. If forced to ship one, ship `superpowers` and back-port `speckit`'s structure and test discipline into it.

---

## The decisive difference: domain correctness

| | `speckit` | `superpowers` |
|---|---|---|
| Session model | Hard-coded **UTC** hours (`London 8–17`, `NY 13–22`) | **Local** hours + IANA timezone, UTC derived at runtime |
| DST | Ignored — wrong ~half the year | Handled via `Intl.DateTimeFormat` |

`speckit/lib/forex-sessions/sessions.ts` bakes session times as fixed UTC integers. London actually trades 07:00–16:00 UTC in summer (BST), not 08:00–17:00. New York shifts an hour too. For a *live* trading tool this is a real defect, not a rounding error — every session is off by an hour for months at a time, and the timeline cursor and overlap zones drift with it.

`superpowers` models each centre as "08:00–17:00 *local*" and converts through the real timezone (`getUTCOffsetHours` / `localToUTCHour`), so it tracks DST. Its tests prove it — they assert Sydney is UTC+11 in January and UTC+10 in July. This is the correct call for the domain and the single most important quality signal in this comparison.

## Second decisive difference: SSR / hydration

- `superpowers` renders `null` until a `useEffect` sets the clock (`use-forex-sessions.ts:12-21`), and adds `suppressHydrationWarning` for `next-themes`. Hydration is clean.
- `speckit`'s `useClock` seeds state in the `useState` initializer (`useClock.ts:19`), which runs during SSR *and* on the client with different times/timezones → **guaranteed hydration mismatch**. `layout.tsx` has no `suppressHydrationWarning` and still ships the default `"Create Next App"` metadata.

That last point is telling: `speckit` left create-next-app boilerplate uncleaned.

---

## SOLID / SRP

**`speckit` wins clearly.** Concerns are cleanly split: `types` / `sessions` (data) / `session-status` + `overlap-windows` (pure logic) / `useClock` (clock only) / presentational components. `LiveClock` takes a `ClockState` prop and is timer-free — there is even a test asserting it never calls `setInterval`. That is textbook dependency inversion and it makes the logic trivially testable.

`superpowers` consolidates all config + five functions into one `forex-sessions.ts`, and `useForexSessions` couples clock-ticking with session computation. It is reasonable and readable, just less granular. `computeSessionStates` does two jobs in one two-pass map (builds states with `overlaps: []`, then rebuilds to fill overlaps) — a mild SRP smell.

## DRY

Both fine. Minor nits:

- `speckit`: `minutesUntilClose` / `minutesUntilOpen` are near-duplicates; `padStart` logic is scattered (`LiveClock` `pad` helper vs inline in `SessionTimeline`).
- `superpowers`: two parallel colour→class maps (`BORDER_CLASSES`, `BAND_CLASSES`). This is mostly forced by Tailwind's static-class requirement, so it is acceptable.

## YAGNI

Both restrained. Two small flags:

- `speckit`: `ClockState` carries `utcHour` / `utcMinute` that are pure derivations of `now`; the `ActiveOverlap` `{window, isActive}` wrapper threads a flag where a `.filter()` would do.
- `superpowers`: `ForexSessionsState.localTime` is a redundant alias of `utcTime` (same `Date`) — not wrong, since `ClockDisplay` reformats per zone, but the name misleads.

## Tests

| | `speckit` | `superpowers` |
|---|---|---|
| Files | 6 (lib + hook + components) | 1 (lib only) |
| Breadth | Wide — logic, hook, 3 components | Narrow — pure logic only |
| Depth / value | Many low-value cases (asserts a grid has 24 columns, a static config exists) | Few but high-value (real DST dates, midnight-crossing, overlaps) |

`speckit` shows better *discipline* — TDD-style structure, hook and component coverage, edge cases enumerated. But much of it is shallow presence-checking. `superpowers` tests **only** the genuinely hard part (timezone / DST math) and tests it well, but has **zero** component/hook coverage. Best practice is `speckit`'s breadth applied to `superpowers`'s correct logic.

## Clean code

Roughly even. Both have good naming and "why"-focused comments (both explain midnight-crossing). `speckit` is slightly tidier per-file; `superpowers` mixes presentation data (`emoji`, `color`) into the config object — pragmatic but a domain/UI blend.

---

## Recommendation

1. **Keep `superpowers`' timezone model and SSR guard** — these are correctness issues `speckit` cannot match without a rewrite.
2. **Adopt `speckit`'s file decomposition** — split `superpowers/forex-sessions.ts` into data/logic modules and decouple the clock hook from session computation.
3. **Add component/hook tests to `superpowers`** using `speckit`'s suite as the template.
4. **Fix `speckit`'s hydration bug and stale metadata** if it is kept at all.

Net: `speckit` looks like the more professional codebase at a glance — and would pass review on structure — but it is functionally wrong for its own domain. `superpowers` is right where it counts and merely needs tidying. Correct-but-untidy beats tidy-but-wrong.
