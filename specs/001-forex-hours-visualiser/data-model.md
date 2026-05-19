# Data Model: Forex Market Hours Visualiser

**Feature**: 001-forex-hours-visualiser
**Date**: 2026-05-19

---

## Core Types

### `SessionId`

```typescript
type SessionId = 'sydney' | 'tokyo' | 'london' | 'new-york';
```

Discriminated union used as a stable key throughout the app. Avoids magic strings.

---

### `TradingSession`

```typescript
interface TradingSession {
  id: SessionId;
  name: string;       // Display name: "Sydney", "Tokyo", "London", "New York"
  openHour: number;   // UTC hour the session opens (0–23)
  closeHour: number;  // UTC hour the session closes (0–23)
  color: string;      // Tailwind background color class, e.g. "bg-blue-500"
}
```

**Validation rules**:
- `openHour` and `closeHour` MUST be integers in [0, 23].
- If `openHour > closeHour`, the session crosses midnight (Sydney: 22 > 07 → wraps to next day).
- `color` MUST be a valid Tailwind class present in the project's safelist.

**Session constant values** (source of truth):

```typescript
const TRADING_SESSIONS: TradingSession[] = [
  { id: 'sydney',   name: 'Sydney',   openHour: 22, closeHour: 7,  color: 'bg-amber-500'  },
  { id: 'tokyo',    name: 'Tokyo',    openHour: 0,  closeHour: 9,  color: 'bg-red-500'    },
  { id: 'london',   name: 'London',   openHour: 8,  closeHour: 17, color: 'bg-blue-500'   },
  { id: 'new-york', name: 'New York', openHour: 13, closeHour: 22, color: 'bg-green-500'  },
];
```

---

### `SessionStatus`

```typescript
interface SessionStatus {
  session: TradingSession;
  isOpen: boolean;
  minutesUntilChange: number; // minutes until next open (if closed) or close (if open)
}
```

Derived at runtime from a `Date` input. Never persisted.

---

### `OverlapWindow`

```typescript
interface OverlapWindow {
  sessions: [SessionId, SessionId];  // exactly two sessions
  openHour: number;                  // UTC hour overlap begins
  closeHour: number;                 // UTC hour overlap ends
  label: string;                     // e.g., "London / New York"
}
```

**Overlap window constants** (derived from session hours, static):

```typescript
const OVERLAP_WINDOWS: OverlapWindow[] = [
  { sessions: ['sydney',  'tokyo'],    openHour: 0,  closeHour: 7,  label: 'Sydney / Tokyo'    },
  { sessions: ['tokyo',   'london'],   openHour: 8,  closeHour: 9,  label: 'Tokyo / London'    },
  { sessions: ['london',  'new-york'], openHour: 13, closeHour: 17, label: 'London / New York' },
];
```

**Active overlap** (runtime):

```typescript
interface ActiveOverlap {
  window: OverlapWindow;
  isActive: boolean;
}
```

---

### `ClockState`

```typescript
interface ClockState {
  now: Date;               // current moment (from device clock)
  utcHour: number;         // 0–23, derived from now.getUTCHours()
  utcMinute: number;       // 0–59
  localTimezone: string;   // e.g., "GMT+10", derived from Intl
}
```

Produced by the `useClock` hook; updated every 1000 ms.

---

## State Transitions

```
ClockState (ticks every 1s)
        │
        ▼
computeSessionStatuses(clockState, TRADING_SESSIONS)
        │
        ├─► SessionStatus[] ─► SessionCard (each session)
        │
computeActiveOverlaps(clockState, OVERLAP_WINDOWS)
        │
        └─► ActiveOverlap[] ─► SessionTimeline + OverlapBadge
```

All state transitions are pure function calls — no reducers, no global store.

---

## Midnight-Crossing Logic

For sessions where `openHour > closeHour` (currently only Sydney: 22 > 7):

```
isOpen = (utcHour >= openHour) OR (utcHour < closeHour)
```

For all other sessions (`openHour < closeHour`):

```
isOpen = (utcHour >= openHour) AND (utcHour < closeHour)
```

The boundary convention is **inclusive open, exclusive close** (session is open at `openHour:00`,
closed at `closeHour:00`). This matches standard forex market convention.
