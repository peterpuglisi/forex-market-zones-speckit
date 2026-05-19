# UI Contracts: Forex Market Hours Visualiser

**Feature**: 001-forex-hours-visualiser
**Date**: 2026-05-19

These contracts define the TypeScript interfaces for all public-facing components and library
functions. Implementations MUST satisfy these signatures exactly.

---

## Library Function Contracts

### `isSessionOpen(session, utcHour)`

```typescript
function isSessionOpen(session: TradingSession, utcHour: number): boolean
```

**Contract**:
- Returns `true` if `utcHour` falls within the session's open window (inclusive open, exclusive
  close).
- Handles midnight-crossing sessions (where `session.openHour > session.closeHour`).
- `utcHour` MUST be an integer in [0, 23]; callers are responsible for passing a valid value.

**Examples**:
```
isSessionOpen({ openHour: 8, closeHour: 17 }, 8)   → true   (boundary: open)
isSessionOpen({ openHour: 8, closeHour: 17 }, 17)  → false  (boundary: closed)
isSessionOpen({ openHour: 22, closeHour: 7 }, 0)   → true   (midnight-crossing)
isSessionOpen({ openHour: 22, closeHour: 7 }, 7)   → false  (boundary: closed)
isSessionOpen({ openHour: 22, closeHour: 7 }, 22)  → true   (boundary: open)
```

---

### `computeSessionStatuses(sessions, now)`

```typescript
function computeSessionStatuses(
  sessions: TradingSession[],
  now: Date
): SessionStatus[]
```

**Contract**:
- Returns one `SessionStatus` per entry in `sessions`, in the same order.
- Derives `utcHour` and `utcMinute` from `now.getUTCHours()` / `now.getUTCMinutes()`.
- `minutesUntilChange` is the number of whole minutes until the session next opens (if closed)
  or next closes (if open), based on UTC hours only (minute-resolution).

---

### `computeActiveOverlaps(windows, utcHour)`

```typescript
function computeActiveOverlaps(
  windows: OverlapWindow[],
  utcHour: number
): ActiveOverlap[]
```

**Contract**:
- Returns one `ActiveOverlap` per window with `isActive` set based on whether `utcHour` falls
  within `[openHour, closeHour)`.
- No overlap window crosses midnight; all use standard `openHour < closeHour` logic.

---

## Component Prop Contracts

### `<ForexHoursVisualiser />`

```typescript
// No props — top-level client boundary; owns all state via useClock hook.
interface ForexHoursVisualiserProps {}
```

Renders: `<LiveClock>`, `<SessionTimeline>`, and four `<SessionCard>` instances.

---

### `<LiveClock />`

```typescript
interface LiveClockProps {
  clock: ClockState;
}
```

Renders: current time in `HH:MM:SS` format for both local timezone and UTC.
MUST NOT start its own `setInterval`; receives `clock` from parent.

---

### `<SessionCard />`

```typescript
interface SessionCardProps {
  status: SessionStatus;
}
```

Renders: session name, open/closed badge, and `minutesUntilChange` label.
MUST use the session's `color` token for the status indicator; MUST NOT use inline styles.

---

### `<SessionTimeline />`

```typescript
interface SessionTimelineProps {
  sessions: TradingSession[];
  overlaps: OverlapWindow[];
  currentUtcHour: number;
  currentUtcMinute: number;  // 0–59; used for fractional cursor offset (hour + minute/60)
}
```

Renders: 24-column grid with session bars and overlap zones. A "current time" cursor line is
positioned at `currentUtcHour + currentUtcMinute / 60` (fractional column offset for
minute-resolution tracking). Sydney's midnight-crossing bar MUST be rendered as two contiguous
segments joined visually.

---

### `<OverlapBadge />`

```typescript
interface OverlapBadgeBadgeProps {
  overlap: ActiveOverlap;
}
```

Renders: a `Badge` with the overlap `label` and a visual active/inactive state.
Only rendered when `overlap.isActive` is `true` in the primary display; all windows are shown in
the timeline regardless.

---

## Custom Hook Contracts

### `useClock(intervalMs?)`

```typescript
function useClock(intervalMs?: number): ClockState
// default intervalMs = 1000
```

**Contract**:
- Returns a `ClockState` that updates on every interval tick.
- MUST call `clearInterval` in the `useEffect` cleanup.
- `localTimezone` is derived once on mount via `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- `intervalMs` parameter exists to allow Vitest to inject a large value and control ticks
  manually in tests.
