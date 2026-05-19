import type { TradingSession, SessionStatus } from './types'

export function isSessionOpen(session: TradingSession, utcHour: number): boolean {
  const { openHour, closeHour } = session
  if (openHour > closeHour) {
    // midnight-crossing (e.g. Sydney 22–07)
    return utcHour >= openHour || utcHour < closeHour
  }
  return utcHour >= openHour && utcHour < closeHour
}

export function computeSessionStatuses(
  sessions: TradingSession[],
  now: Date
): SessionStatus[] {
  const utcHour = now.getUTCHours()
  const utcMinute = now.getUTCMinutes()

  return sessions.map(session => {
    const open = isSessionOpen(session, utcHour)
    const minutesUntilChange = open
      ? minutesUntilClose(session, utcHour, utcMinute)
      : minutesUntilOpen(session, utcHour, utcMinute)

    return { session, isOpen: open, minutesUntilChange }
  })
}

function minutesUntilClose(
  session: TradingSession,
  utcHour: number,
  utcMinute: number
): number {
  const closeMinutes = session.closeHour * 60
  const nowMinutes = utcHour * 60 + utcMinute
  const diff = closeMinutes - nowMinutes
  return diff > 0 ? diff : diff + 24 * 60
}

function minutesUntilOpen(
  session: TradingSession,
  utcHour: number,
  utcMinute: number
): number {
  const openMinutes = session.openHour * 60
  const nowMinutes = utcHour * 60 + utcMinute
  const diff = openMinutes - nowMinutes
  return diff > 0 ? diff : diff + 24 * 60
}
