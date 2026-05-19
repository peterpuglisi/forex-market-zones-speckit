---

description: "Task list for Forex Market Hours Visualiser"
---

# Tasks: Forex Market Hours Visualiser

**Input**: Design documents from `specs/001-forex-hours-visualiser/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ui-contracts.md ✅ quickstart.md ✅

**Tests**: Tests are MANDATORY per the project constitution (Principle II: Testing Standards).
Tests MUST be written before implementation and MUST fail before any implementation code is
written (Red-Green-Refactor).

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router project lives in `frontend/` subdirectory (repo root stays clean for future backend)
- All paths below are relative to `frontend/`; run all `npm` commands from `frontend/`
- Source under `frontend/src/` — components, lib, hooks, app, __tests__

---

## Phase 1: Setup

**Purpose**: Scaffold the Next.js project and configure all tooling

- [X] T001 Scaffold Next.js 14+ project with App Router, TypeScript, and Tailwind CSS into the `frontend/` subdirectory (`frontend/package.json`, `frontend/next.config.ts`, `frontend/tsconfig.json`, `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`)
- [X] T002 [P] Initialize shadcn/ui with default style and install Badge, Card, Separator components (`.components.json`, `src/components/ui/`)
- [X] T003 [P] Install Vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom and create `vitest.config.ts` and `vitest.setup.ts` at project root
- [X] T004 [P] Add test scripts to `package.json`: `test`, `test:watch`, `test:coverage`; configure Vitest coverage thresholds (≥80% global, 100% for `src/lib/forex-sessions/**`) in `vitest.config.ts`
- [X] T005 [P] Create project directory structure: `src/components/forex-hours/`, `src/lib/forex-sessions/`, `src/hooks/`, `src/__tests__/lib/`, `src/__tests__/hooks/`, `src/__tests__/components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and static data that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define all core TypeScript types (`SessionId`, `TradingSession`, `SessionStatus`, `OverlapWindow`, `ActiveOverlap`, `ClockState`) in `src/lib/forex-sessions/types.ts`
- [X] T007 [P] Create `TRADING_SESSIONS` constant array with all four sessions and correct UTC hours (Sydney 22–07, Tokyo 00–09, London 08–17, New York 13–22) with Tailwind color assignments in `src/lib/forex-sessions/sessions.ts`
- [X] T008 Create `OVERLAP_WINDOWS` constant array with all three windows (Sydney/Tokyo 00–07, Tokyo/London 08–09, London/New York 13–17) in `src/lib/forex-sessions/sessions.ts` (depends on T007 — same file)

**Checkpoint**: Types and constants ready — user story implementation can begin

---

## Phase 3: User Story 1 — View Current Session Status (Priority: P1) 🎯 MVP

**Goal**: Display open/closed status for each of the four sessions based on the device clock

**Independent Test**: Load the visualiser when UTC time is 10:00; only London should appear
open. Load at 13:00 UTC; both London and New York should appear open. Confirms US1 works
standalone before any overlap or clock UI is added.

### Tests for User Story 1 (MANDATORY — write and verify failing BEFORE implementation)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Write unit tests for `isSessionOpen` covering: all four sessions open/closed, boundary cases (open at openHour, closed at closeHour), and Sydney midnight-crossing logic in `src/__tests__/lib/session-status.test.ts`
- [X] T010 [P] [US1] Write unit tests for `computeSessionStatuses` covering: correct statuses for a fixed `Date` at 10:00 UTC (London open, others closed), and at 13:00 UTC (London + NY open) in `src/__tests__/lib/session-status.test.ts`
- [X] T011 [P] [US1] Write component tests for `SessionCard`: renders session name, renders open `Badge` when `isOpen: true`, renders closed `Badge` when `isOpen: false`, applies session `color` class to status indicator (no inline styles), displays `minutesUntilChange` label in `src/__tests__/components/SessionCard.test.tsx`

### Implementation for User Story 1

- [X] T012 [US1] Implement `isSessionOpen(session, utcHour): boolean` with midnight-crossing support (inclusive open, exclusive close) in `src/lib/forex-sessions/session-status.ts` (depends on T009)
- [X] T013 [US1] Implement `computeSessionStatuses(sessions, now): SessionStatus[]` deriving open/closed state and `minutesUntilChange` from a `Date` in `src/lib/forex-sessions/session-status.ts` (depends on T010, T012)
- [X] T014 [US1] Implement `SessionCard` component: session name, open/closed `Badge`, `minutesUntilChange` label, session `color` token as status indicator — no inline styles in `src/components/forex-hours/SessionCard.tsx` (depends on T013, T011 test must be written and failing first)
- [X] T015 [US1] Scaffold `ForexHoursVisualiser` as `'use client'` component with a hardcoded `Date` stub, rendering four `SessionCard` instances in `src/components/forex-hours/ForexHoursVisualiser.tsx` (depends on T014)
- [X] T016 [US1] Wire `src/app/page.tsx` to render `<ForexHoursVisualiser />` (server component wrapper) in `src/app/page.tsx` (depends on T015)

**Checkpoint**: `npm run dev` → session status cards visible; at UTC 10:00 only London shows
open. User Story 1 fully functional and independently testable.

---

## Phase 4: User Story 2 — Identify Session Overlap Windows (Priority: P2)

**Goal**: Show a 24-hour timeline with visually distinct overlap zones

**Independent Test**: At 14:00 UTC the 13:00–17:00 London/New York overlap zone must be
visually highlighted on the timeline. At 05:00 UTC the Sydney/Tokyo zone (00:00–07:00) must
be highlighted. Confirms US2 works alongside US1.

### Tests for User Story 2 (MANDATORY — write and verify failing BEFORE implementation)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T017 [P] [US2] Write unit tests for `computeActiveOverlaps` covering: each of the three windows active during its UTC range, inactive outside its range, and boundary hours in `src/__tests__/lib/overlap-windows.test.ts`
- [X] T018 [P] [US2] Write component tests for `SessionTimeline`: renders 24 grid columns, session bars span correct column ranges, Sydney bar renders as two segments (cols 23–24 + cols 1–7), an overlap zone is visually distinct from a solo-session zone, the current-time cursor is present in `src/__tests__/components/SessionTimeline.test.tsx`

### Implementation for User Story 2

- [X] T019 [US2] Implement `computeActiveOverlaps(windows, utcHour): ActiveOverlap[]` in `src/lib/forex-sessions/overlap-windows.ts` (depends on T017)
- [X] T020 [US2] Implement `SessionTimeline` component: 24-column CSS-grid (one column per UTC hour), session bars as `grid-column` spans with session name label and UTC hour-range label on each bar (FR-008), Sydney rendered as two contiguous segments (cols 23–24 + cols 1–7), overlap zones as a visually distinct layer, current-time cursor positioned at fractional hour offset (`utcHour + utcMinute/60`) in `src/components/forex-hours/SessionTimeline.tsx` (depends on T019, T018 test must be written and failing first)
- [X] T021 [US2] Implement `OverlapBadge` component: renders shadcn `Badge` with the overlap `label`; active/inactive visual state; only renders the active badge in the primary display in `src/components/forex-hours/OverlapBadge.tsx` (depends on T019)
- [X] T022 [US2] Integrate `SessionTimeline` and `OverlapBadge` into `ForexHoursVisualiser`, passing `currentUtcHour` and `currentUtcMinute` from the hardcoded Date stub in `src/components/forex-hours/ForexHoursVisualiser.tsx` (depends on T020, T021)

**Checkpoint**: Timeline visible; London/New York overlap zone highlighted at 14:00 UTC.
User Stories 1 AND 2 independently testable.

---

## Phase 5: User Story 3 — Track Live Time (Priority: P3)

**Goal**: Live clock ticking every second in local timezone and UTC

**Independent Test**: Observe the clock over 10 seconds; it MUST advance each second without
user interaction. For a device at UTC+5 both local (+5) and UTC times must display. Confirms
US3 works and triggers auto-updating of US1/US2 status.

### Tests for User Story 3 (MANDATORY — write and verify failing BEFORE implementation)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T023 [US3] Write hook tests for `useClock`: verify `ClockState` updates on interval tick (use fake timers via `vi.useFakeTimers`), verify `clearInterval` is called on unmount, verify `localTimezone` is populated from `Intl` in `src/__tests__/hooks/useClock.test.ts`
- [X] T024 [P] [US3] Write component tests for `LiveClock`: renders local time string, renders UTC time string, both values update when `ClockState` prop changes, does NOT call `setInterval` itself in `src/__tests__/components/LiveClock.test.tsx`

### Implementation for User Story 3

- [X] T025 [US3] Implement `useClock(intervalMs?: number): ClockState` custom hook: `setInterval` at 1000 ms, `clearInterval` in `useEffect` cleanup, `localTimezone` derived once on mount via `Intl.DateTimeFormat().resolvedOptions().timeZone` in `src/hooks/useClock.ts` (depends on T023)
- [X] T026 [US3] Implement `LiveClock` component: displays `HH:MM:SS` for both local timezone and UTC using `ClockState` prop; MUST NOT own its own `setInterval` in `src/components/forex-hours/LiveClock.tsx` (depends on T025, T024 test must be written and failing first)
- [X] T027 [US3] Wire `useClock` into `ForexHoursVisualiser`: replace hardcoded Date stub with live `ClockState`, pass to `LiveClock`, `SessionTimeline` (with `utcHour` + `utcMinute`), and `SessionCard` instances so all displays auto-update in `src/components/forex-hours/ForexHoursVisualiser.tsx` (depends on T025, T026)

**Checkpoint**: Clock ticks live; session status and timeline auto-update when a session
opens/closes. All three user stories integrated and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, performance gate, and spec hygiene

- [X] T028 [P] Verify responsive layout on mobile viewport (≤ 768px) using browser devtools; fix any overflow or unreadable text in `src/components/forex-hours/SessionTimeline.tsx` and `src/components/forex-hours/SessionCard.tsx`
- [X] T029 [P] Add "no sessions open" empty state to `ForexHoursVisualiser` (visible when all four sessions are closed) in `src/components/forex-hours/ForexHoursVisualiser.tsx`
- [X] T030 [P] Fix spec.md errata: update edge cases section to correct session times (Sydney 22:00–07:00, Tokyo 00:00–09:00) in `specs/001-forex-hours-visualiser/spec.md`
- [X] T031 Run full test suite and verify coverage thresholds are met (≥80% global, 100% `src/lib/forex-sessions/`) — `npm run test:coverage`; fix any gaps
- [X] T032 Run `npm run build`; fix any TypeScript or lint errors to zero
- [X] T033 [P] Run quickstart.md validation checklist and confirm all items pass in `specs/001-forex-hours-visualiser/quickstart.md`
- [X] T034 [P] Install `@lhci/cli` and add a `lighthouse` script to `package.json`; run Lighthouse CI against `npm run build` output; assert Performance score ≥ 90 and initial load ≤ 2 000 ms; record result as the baseline in `lhci.config.js` (constitution Principle IV: performance MUST be verified via CI benchmark)
- [X] T035 [P] Verify zero runtime network requests after initial page load: set `output: 'export'` in `next.config.ts` to structurally prevent API routes and server-side data fetching; run `npm run build` and confirm static export succeeds with no dynamic routes; document the setting with a comment referencing FR-006 and SC-005 (offline capability)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002–T005 parallel with T001
- **Foundational (Phase 2)**: Depends on Phase 1 completion; T007 parallel after T006; T008 sequential after T007 (same file)
- **User Story 1 (Phase 3)**: Depends on Phase 2; T009, T010, T011 all parallel (write tests first)
- **User Story 2 (Phase 4)**: Depends on Phase 2; can start after Foundational (not after US1)
- **User Story 3 (Phase 5)**: Depends on Phase 2; can start after Foundational (not after US1/US2); wire step T027 requires US1 and US2 complete
- **Polish (Phase 6)**: Depends on all three user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on US2 or US3
- **User Story 2 (P2)**: Can start after Foundational — no dependencies on US1 or US3
- **User Story 3 (P3)**: Can start after Foundational — T027 (wiring) requires US1 + US2 complete

### Within Each User Story

- Tests MUST be written first and MUST fail before any implementation
- Types/constants (Foundational) before functions
- Functions before components
- Components before integration into `ForexHoursVisualiser`

### Parallel Opportunities

- Phase 1: T002, T003, T004, T005 all parallel after T001
- Phase 2: T007 parallel after T006; T008 sequential after T007
- Phase 3: T009, T010, T011 all parallel (different test files)
- Phase 4: T017, T018 both parallel (different test files); T017/T018 can also run in parallel with Phase 3 implementation tasks
- Phase 5: T023, T024 parallel; T023/T024 can run in parallel with Phase 4 implementation
- Phase 6: T028, T029, T030, T033, T034, T035 all parallel

---

## Parallel Example: User Story 1

```bash
# Launch all three test-writing tasks together first:
Task: "Write isSessionOpen unit tests in src/__tests__/lib/session-status.test.ts"         # T009
Task: "Write computeSessionStatuses unit tests in src/__tests__/lib/session-status.test.ts" # T010
Task: "Write SessionCard component tests in src/__tests__/components/SessionCard.test.tsx"  # T011

# After all three tests fail — begin implementation:
Task: "Implement isSessionOpen in src/lib/forex-sessions/session-status.ts"                # T012
# then T013 → T014 → T015 → T016 (sequential, each depends on prior)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Write tests T009–T011, verify all fail
4. Complete Phase 3: User Story 1 (T012–T016)
5. **STOP and VALIDATE**: At UTC 10:00 → only London open; at 13:00 → London + New York open
6. Demo/deploy MVP

### Incremental Delivery

1. Setup + Foundational → run `npm test` (tests should fail — correct)
2. User Story 1 → make tests pass → `npm run dev` confirms session cards work (**MVP**)
3. User Story 2 → timeline + overlap zones visible
4. User Story 3 → live clock wired in; all auto-update
5. Polish → coverage gate, build gate, Lighthouse CI baseline

### Parallel Team Strategy

With two developers after Foundational is complete:

- **Developer A**: User Story 1 (session status cards + `session-status.ts`)
- **Developer B**: User Story 2 (timeline + overlap-windows + `SessionTimeline.tsx`)
- Both complete → Developer A adds User Story 3 (wires live clock into integrated component)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- TDD is non-negotiable: every test task MUST be written and failing before its paired implementation
- T008 is intentionally NOT marked [P] — it writes to the same file as T007 (`sessions.ts`)
- `useClock` accepts `intervalMs` parameter specifically to enable fast fake-timer tests in T023
- Sydney midnight-crossing: two grid segments — do not skip this; they must render as one visual bar
- T020 cursor uses fractional offset (`utcHour + utcMinute/60`) for minute-resolution tracking
- `clearInterval` in `useClock` cleanup is a constitution compliance requirement (Principle IV)
- T034 (Lighthouse CI) establishes the performance baseline; regressions >20% must block future merges
- Commit after each checkpoint to preserve independently testable increments


