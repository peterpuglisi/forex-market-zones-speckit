import type { ClockState } from '@/lib/forex-sessions/types'

interface LiveClockProps {
  clock: ClockState
}

const pad = (n: number) => String(n).padStart(2, '0')

function formatHMS(date: Date, utc: boolean): string {
  if (utc) {
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  }
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default function LiveClock({ clock }: LiveClockProps) {
  const { now, localTimezone } = clock

  return (
    <div className="flex flex-col sm:flex-row gap-4 font-mono text-sm">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">UTC</span>
        <span className="text-lg font-semibold">{formatHMS(now, true)}</span>
      </div>
      <div className="hidden sm:block w-px bg-border self-stretch" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Local · {localTimezone}
        </span>
        <span className="text-lg font-semibold">{formatHMS(now, false)}</span>
      </div>
    </div>
  )
}
