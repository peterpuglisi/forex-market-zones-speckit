# Metrics — SpecKit (Forex Market Zones Visualiser)

## Time
- Plan phase (prompt → plan generated): 1h 30m
- Build phase (red tests → green tests): 30m
- Total wall-clock time: 2 hrs

## Cost
- Total token cost (Claude usage dashboard, full session): $11.40
- Models used:
  claude-haiku-4-5:
  claude-sonnet-4-6:  (default agent)
  claude-opus-4-7: (configured as model advisor and used when needed, minimal)

## Output
- Lines of code (src/ only, excluding shadcn ui/ scaffold): 397
- Lines of code (src/ total incl. shadcn ui/ components): 619
- Lines of test code: 378
- Test count: 55 (across 6 files)
- Coverage %: 92.3% stmts / 100% branches / 84.84% fns / 94.91% lines (global); 100% all metrics for `src/lib/forex-sessions/`

## Quality
- Code review verdict (Ready / With fixes / Needs work): Ready — with fixes applied
- Code review — notable issues:
  1. **Dead code** — `col()` and `span()` helpers defined in `SessionTimeline.tsx` but never called; bars use inline percentage math. Removed.
  2. **Spec violation** — `localTimezone` recomputed on every `setInterval` tick; spec requires "derived once on mount." Fixed with `useRef`.
  3. **FR-008 gap** — Sydney bar segment 2 (00–07) had no visible UTC range label. Fixed.
- Mid-build issues caught by per-task reviews: n/a — single-agent build
- Security issues caught by /security-review: none — purely static client-side app; no user input rendered, no API routes, no auth, no PII. `output: 'export'` in next.config.ts structurally prevents server routes.
- Security issues missed (manual check): none found

## Key findings
- Session boundary logic generated correctly? **yes** — inclusive open, exclusive close; midnight-crossing via `utcHour >= openHour || utcHour < closeHour`; all boundary tests pass
- DST handling included without prompting? **no** — model respected the spec's explicit "out of scope for v1" constraint; fixed UTC hours throughout
- Weekend/closed market case handled? **partially** — "no sessions open" empty state implemented; weekend-specific detection not coded (also out of scope per spec)
- Edge cases Speckit added that weren't in the prompt:
  - Fractional-minute cursor on timeline (minute-resolution tracking, not whole-hour)
  - `minutesUntilChange` countdown label on each session card
  - Sydney bar rendered as two visually joined segments across the midnight boundary
  - Responsive `overflow-x-auto` + `min-w-[600px]` scroll wrapper on timeline for mobile
  - Lighthouse CI baseline config (`lighthouserc.js`) with per-run assertions
- Biggest surprise or failure to enforce a requirement: shadcn/ui 4.x installed `@base-ui/react` (Base UI) instead of Radix UI — spec assumed Radix. API differs (`useRender`/`mergeProps`) but visual output is equivalent and all tests pass against the Base UI versions.