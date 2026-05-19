# Quickstart: Forex Market Hours Visualiser

**Feature**: 001-forex-hours-visualiser
**Stack**: Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui · Vitest

---

## Prerequisites

- Node.js 20+ and npm 10+
- Git

---

## 1. Scaffold the Next.js project

The Next.js application lives in the `frontend/` subdirectory so a backend can be added
alongside it in the future without restructuring the repository.

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint
cd frontend
```

---

## 2. Initialise shadcn/ui

```bash
npx shadcn@latest init
# Choose: Default style, Slate base color, CSS variables: yes
```

Add the components used by this feature:

```bash
npx shadcn@latest add badge card separator
```

---

## 3. Add Vitest

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event
```

Create `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: { lines: 80, functions: 80, branches: 80, statements: 80 },
        'src/lib/forex-sessions/**': {
          lines: 100, functions: 100, branches: 100, statements: 100,
        },
      },
    },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 4. Project source structure

All commands below are run from the `frontend/` directory.

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── forex-hours/
│   │       ├── ForexHoursVisualiser.tsx   # 'use client' boundary
│   │       ├── SessionCard.tsx
│   │       ├── SessionTimeline.tsx
│   │       ├── OverlapBadge.tsx
│   │       └── LiveClock.tsx
│   ├── lib/
│   │   └── forex-sessions/
│   │       ├── sessions.ts               # TRADING_SESSIONS + OVERLAP_WINDOWS constants
│   │       ├── session-status.ts         # isSessionOpen, computeSessionStatuses
│   │       └── overlap-windows.ts        # computeActiveOverlaps
│   └── hooks/
│       └── useClock.ts
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

---

## 5. Run the development server

```bash
# From repo root:
cd frontend
npm run dev
# Opens http://localhost:3000
```

---

## 6. Run tests

```bash
# From frontend/ directory:
npm test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Validation checklist

After setup, verify:

- [ ] `npm run dev` starts without errors and `localhost:3000` loads
- [ ] The live clock displays and ticks every second
- [ ] At UTC 14:00 (or simulate via OS clock), London and New York show as open
- [ ] The 13:00–17:00 overlap zone is visually distinct on the timeline
- [ ] `npm test` runs and all tests pass
- [ ] `npm run test:coverage` shows ≥ 80% global and 100% for `lib/forex-sessions/`
- [ ] `npm run build` succeeds with no TypeScript errors
