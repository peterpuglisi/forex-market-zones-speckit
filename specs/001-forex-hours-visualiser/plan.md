# Implementation Plan: Forex Market Hours Visualiser

**Branch**: `001-forex-hours-visualiser` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-forex-hours-visualiser/spec.md`

## Summary

Build a fully client-side, single-page Forex Market Hours Visualiser using Next.js App Router,
TypeScript, Tailwind CSS, shadcn/ui, and Vitest. The page displays live open/closed status for
the four major forex sessions (Sydney, Tokyo, London, New York), a 24-hour timeline with visual
overlap zones, and a live dual-timezone clock — all computed from the device clock with no
network requests.

## Technical Context

**Language/Version**: TypeScript 5.x (bundled with Next.js)
**Actual versions installed**: Next.js 16.2.6, React 19, Tailwind CSS v4 (differs from spec target)
**Primary Dependencies**: Next.js 16+ (App Router), Tailwind CSS v4, shadcn/ui (Badge, Card,
Separator), Vitest + @vitejs/plugin-react + jsdom
**Storage**: N/A — all state is ephemeral, derived from the device clock each second
**Testing**: Vitest (unit: pure functions in `node` env; component: `jsdom` env)
**Target Platform**: Modern desktop/mobile browser; offline-capable after initial load
**Project Type**: Single-page web application
**Performance Goals**: Initial render < 2 000 ms; clock tick ≤ 1 s latency; zero network
requests after load
**Constraints**: Fully client-side (FR-006); no backend; offline-capable; no trading volume
**Scale/Scope**: Single page; 4 sessions; 3 overlap windows; 1 live clock

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Code Quality | Single-responsibility functions; no dead code; linting gate | ✅ PASS | All session logic in pure functions in `lib/`; components are purely presentational |
| II. Testing Standards | TDD mandatory; ≥ 80% unit coverage; 100% on calculation paths | ✅ PASS | `lib/forex-sessions/` targeted for 100% coverage via Vitest config; tests written first |
| III. UX Consistency | Design tokens only; all states handled; consistent patterns | ✅ PASS | shadcn/ui tokens used throughout; open/closed/no-session states all accounted for |
| IV. Performance | < 2 000 ms load; < 500 ms calc; memory cleanup on teardown | ✅ PASS | Pure client-side; `useClock` cleanup calls `clearInterval`; no async data fetching |

**No violations. No complexity justification required.**

*Post-design re-check*: All gates still pass. The CSS-grid timeline approach and pure-function
session logic keep complexity well within bounds.

## Project Structure

### Documentation (this feature)

```text
specs/001-forex-hours-visualiser/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contracts.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (`frontend/` directory)

The Next.js application lives in `frontend/` to allow a backend to be added alongside it
in the future without restructuring the repository.

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                              # Server component; renders ForexHoursVisualiser
│   │   └── globals.css
│   ├── components/
│   │   └── forex-hours/
│   │       ├── ForexHoursVisualiser.tsx          # 'use client' boundary; owns useClock state
│   │       ├── SessionCard.tsx                   # Per-session open/closed card
│   │       ├── SessionTimeline.tsx               # 24-column CSS-grid timeline
│   │       ├── OverlapBadge.tsx                  # Active overlap zone badge
│   │       └── LiveClock.tsx                     # Dual-timezone HH:MM:SS display
│   ├── lib/
│   │   └── forex-sessions/
│   │       ├── sessions.ts                       # TRADING_SESSIONS + OVERLAP_WINDOWS constants
│   │       ├── session-status.ts                 # isSessionOpen, computeSessionStatuses
│   │       └── overlap-windows.ts                # computeActiveOverlaps
│   └── hooks/
│       └── useClock.ts                           # setInterval hook returning ClockState
└── src/__tests__/
    ├── lib/
    │   ├── session-status.test.ts
    │   └── overlap-windows.test.ts
    ├── hooks/
    │   └── useClock.test.ts
    └── components/
        ├── SessionCard.test.tsx
        ├── SessionTimeline.test.tsx
        └── LiveClock.test.tsx
```

**Structure Decision**: Standard Next.js App Router layout with a single `'use client'` boundary
at the feature root (`ForexHoursVisualiser`). All domain logic is isolated in `lib/` for
testability. No backend; no API routes required. The `frontend/` subdirectory keeps the repo
root clean for future backend additions.
