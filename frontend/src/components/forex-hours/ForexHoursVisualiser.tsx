'use client'

import { TRADING_SESSIONS, OVERLAP_WINDOWS } from '@/lib/forex-sessions/sessions'
import { computeSessionStatuses } from '@/lib/forex-sessions/session-status'
import { computeActiveOverlaps } from '@/lib/forex-sessions/overlap-windows'
import { useClock } from '@/hooks/useClock'
import SessionCard from './SessionCard'
import SessionTimeline from './SessionTimeline'
import OverlapBadge from './OverlapBadge'
import LiveClock from './LiveClock'

export default function ForexHoursVisualiser() {
  const clock = useClock()
  const { utcHour, utcMinute } = clock
  const sessionStatuses = computeSessionStatuses(TRADING_SESSIONS, clock.now)
  const activeOverlaps = computeActiveOverlaps(OVERLAP_WINDOWS, utcHour)
  const openSessions = sessionStatuses.filter(s => s.isOpen)

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Forex Market Hours</h1>
        <LiveClock clock={clock} />
      </div>

      {/* Active overlap badges */}
      {activeOverlaps.some(o => o.isActive) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium self-center">Active overlaps:</span>
          {activeOverlaps.map(overlap => (
            <OverlapBadge key={overlap.window.label} overlap={overlap} />
          ))}
        </div>
      )}

      {/* No sessions open empty state (T029) */}
      {openSessions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-xl mb-6">
          No sessions are currently open
        </div>
      )}

      {/* Session status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sessionStatuses.map(status => (
          <SessionCard key={status.session.id} status={status} />
        ))}
      </div>

      {/* 24-hour timeline */}
      <div className="border rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3">24-Hour Timeline (UTC)</h2>
        <SessionTimeline
          sessions={TRADING_SESSIONS}
          overlaps={OVERLAP_WINDOWS}
          currentUtcHour={utcHour}
          currentUtcMinute={utcMinute}
        />
      </div>
    </main>
  )
}
