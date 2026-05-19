'use client'

import { useState, useEffect, useRef } from 'react'
import type { ClockState } from '@/lib/forex-sessions/types'

function makeTick(localTimezone: string): ClockState {
  const now = new Date()
  return {
    now,
    utcHour: now.getUTCHours(),
    utcMinute: now.getUTCMinutes(),
    localTimezone,
  }
}

export function useClock(intervalMs = 1000): ClockState {
  // Derived once on mount — does not change with DST within a session
  const timezone = useRef(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [state, setState] = useState<ClockState>(() => makeTick(timezone.current))

  useEffect(() => {
    const id = setInterval(() => setState(makeTick(timezone.current)), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return state
}
