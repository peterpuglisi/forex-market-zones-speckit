import type { TradingSession, OverlapWindow } from '@/lib/forex-sessions/types'

interface SessionTimelineProps {
  sessions: TradingSession[]
  overlaps: OverlapWindow[]
  currentUtcHour: number
  currentUtcMinute: number
}

export default function SessionTimeline({
  sessions,
  overlaps,
  currentUtcHour,
  currentUtcMinute,
}: SessionTimelineProps) {
  const cursorOffset = ((currentUtcHour + currentUtcMinute / 60) / 24) * 100

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
      {/* Hour labels */}
      <div
        className="relative grid mb-1"
        style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-xs text-muted-foreground text-center select-none">
            {h === 0 ? '00' : h % 6 === 0 ? String(h).padStart(2, '0') : ''}
          </div>
        ))}
      </div>

      {/* Timeline grid */}
      <div className="relative">
        {/* Background 24-column grid */}
        <div
          data-testid="timeline-grid"
          className="relative grid h-full"
          style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
        >
          {/* Column dividers */}
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="border-l border-border/40 h-full min-h-[120px]" />
          ))}
        </div>

        {/* Session bars (absolute, overlaid on grid) */}
        <div className="absolute inset-0 flex flex-col gap-1 py-1">
          {sessions.map(session => (
            <SessionBar key={session.id} session={session} />
          ))}
        </div>

        {/* Overlap zones */}
        {overlaps.map(overlap => (
          <div
            key={overlap.label}
            data-testid="overlap-zone"
            className="absolute top-0 bottom-0 bg-yellow-300/20 border-x border-yellow-400/40 pointer-events-none"
            style={{
              left: `${(overlap.openHour / 24) * 100}%`,
              width: `${((overlap.closeHour - overlap.openHour) / 24) * 100}%`,
            }}
          />
        ))}

        {/* Current-time cursor */}
        <div
          data-testid="time-cursor"
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
          style={{ left: `${cursorOffset}%` }}
        />
      </div>
      </div>
    </div>
  )
}

function SessionBar({ session }: { session: TradingSession }) {
  const isMidnightCrossing = session.openHour > session.closeHour

  if (isMidnightCrossing) {
    // Sydney: two segments — 22–24 and 0–closeHour
    return (
      <div data-testid={`session-bar-${session.id}`} className="relative h-7 flex">
        {/* Segment 1: openHour → 24 */}
        <div
          data-session={session.id}
          className={`absolute flex items-center justify-end pr-1 h-full rounded-l ${session.color} opacity-80`}
          style={{
            left: `${(session.openHour / 24) * 100}%`,
            width: `${((24 - session.openHour) / 24) * 100}%`,
          }}
        >
          <span className="text-xs font-medium text-white truncate">{session.name}</span>
        </div>
        {/* Segment 2: 0 → closeHour */}
        <div
          data-session={session.id}
          className={`absolute flex items-center pl-1 h-full rounded-r ${session.color} opacity-80`}
          style={{
            left: '0%',
            width: `${(session.closeHour / 24) * 100}%`,
          }}
        >
          <span className="text-xs text-white/70 hidden sm:inline">
            00–{String(session.closeHour).padStart(2, '0')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div data-testid={`session-bar-${session.id}`} className="relative h-7">
      <div
        data-session={session.id}
        className={`absolute flex items-center pl-1 h-full rounded ${session.color} opacity-80`}
        style={{
          left: `${(session.openHour / 24) * 100}%`,
          width: `${((session.closeHour - session.openHour) / 24) * 100}%`,
        }}
      >
        <span className="text-xs font-medium text-white truncate">{session.name}</span>
        <span className="text-xs text-white/70 ml-1 hidden sm:inline">
          {String(session.openHour).padStart(2, '0')}–{String(session.closeHour).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
