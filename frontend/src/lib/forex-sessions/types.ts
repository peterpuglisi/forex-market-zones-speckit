export type SessionId = 'sydney' | 'tokyo' | 'london' | 'new-york'

export interface TradingSession {
  id: SessionId
  name: string
  openHour: number
  closeHour: number
  color: string
}

export interface SessionStatus {
  session: TradingSession
  isOpen: boolean
  minutesUntilChange: number
}

export interface OverlapWindow {
  sessions: [SessionId, SessionId]
  openHour: number
  closeHour: number
  label: string
}

export interface ActiveOverlap {
  window: OverlapWindow
  isActive: boolean
}

export interface ClockState {
  now: Date
  utcHour: number
  utcMinute: number
  localTimezone: string
}
