import { describe, it, expect } from 'vitest'
import { isSessionOpen, computeSessionStatuses } from '@/lib/forex-sessions/session-status'
import { TRADING_SESSIONS } from '@/lib/forex-sessions/sessions'
import type { TradingSession } from '@/lib/forex-sessions/types'

// ─── helpers ────────────────────────────────────────────────────────────────

const utcDate = (hour: number, minute = 0): Date => {
  const d = new Date(0)
  d.setUTCHours(hour, minute, 0, 0)
  return d
}

const session = (openHour: number, closeHour: number): TradingSession => ({
  id: 'london',
  name: 'London',
  openHour,
  closeHour,
  color: 'bg-blue-500',
})

// ─── isSessionOpen ───────────────────────────────────────────────────────────

describe('isSessionOpen', () => {
  // Normal sessions (openHour < closeHour)
  it('returns true at open boundary', () => {
    expect(isSessionOpen(session(8, 17), 8)).toBe(true)
  })

  it('returns false at close boundary', () => {
    expect(isSessionOpen(session(8, 17), 17)).toBe(false)
  })

  it('returns true within window', () => {
    expect(isSessionOpen(session(8, 17), 12)).toBe(true)
  })

  it('returns false before open', () => {
    expect(isSessionOpen(session(8, 17), 7)).toBe(false)
  })

  it('returns false after close', () => {
    expect(isSessionOpen(session(8, 17), 18)).toBe(false)
  })

  // All four sessions — correct UTC hours
  it('London open at 8, closed at 17', () => {
    const london = TRADING_SESSIONS.find(s => s.id === 'london')!
    expect(isSessionOpen(london, 8)).toBe(true)
    expect(isSessionOpen(london, 17)).toBe(false)
  })

  it('Tokyo open at 0, closed at 9', () => {
    const tokyo = TRADING_SESSIONS.find(s => s.id === 'tokyo')!
    expect(isSessionOpen(tokyo, 0)).toBe(true)
    expect(isSessionOpen(tokyo, 9)).toBe(false)
  })

  it('New York open at 13, closed at 22', () => {
    const ny = TRADING_SESSIONS.find(s => s.id === 'new-york')!
    expect(isSessionOpen(ny, 13)).toBe(true)
    expect(isSessionOpen(ny, 22)).toBe(false)
  })

  // Midnight-crossing (Sydney: 22 > 7)
  it('Sydney open at 22 (open boundary)', () => {
    const sydney = TRADING_SESSIONS.find(s => s.id === 'sydney')!
    expect(isSessionOpen(sydney, 22)).toBe(true)
  })

  it('Sydney open at midnight (wraps past midnight)', () => {
    const sydney = TRADING_SESSIONS.find(s => s.id === 'sydney')!
    expect(isSessionOpen(sydney, 0)).toBe(true)
  })

  it('Sydney open at 6 (before close)', () => {
    const sydney = TRADING_SESSIONS.find(s => s.id === 'sydney')!
    expect(isSessionOpen(sydney, 6)).toBe(true)
  })

  it('Sydney closed at 7 (close boundary)', () => {
    const sydney = TRADING_SESSIONS.find(s => s.id === 'sydney')!
    expect(isSessionOpen(sydney, 7)).toBe(false)
  })

  it('Sydney closed at 10 (mid-day gap)', () => {
    const sydney = TRADING_SESSIONS.find(s => s.id === 'sydney')!
    expect(isSessionOpen(sydney, 10)).toBe(false)
  })
})

// ─── computeSessionStatuses ──────────────────────────────────────────────────

describe('computeSessionStatuses', () => {
  it('returns one status per session in same order', () => {
    const statuses = computeSessionStatuses(TRADING_SESSIONS, utcDate(10))
    expect(statuses).toHaveLength(TRADING_SESSIONS.length)
    statuses.forEach((s, i) => {
      expect(s.session.id).toBe(TRADING_SESSIONS[i].id)
    })
  })

  it('at 10:00 UTC only London is open', () => {
    const statuses = computeSessionStatuses(TRADING_SESSIONS, utcDate(10))
    const map = Object.fromEntries(statuses.map(s => [s.session.id, s.isOpen]))
    expect(map['sydney']).toBe(false)
    expect(map['tokyo']).toBe(false)
    expect(map['london']).toBe(true)
    expect(map['new-york']).toBe(false)
  })

  it('at 13:00 UTC London and New York are open', () => {
    const statuses = computeSessionStatuses(TRADING_SESSIONS, utcDate(13))
    const map = Object.fromEntries(statuses.map(s => [s.session.id, s.isOpen]))
    expect(map['london']).toBe(true)
    expect(map['new-york']).toBe(true)
    expect(map['sydney']).toBe(false)
    expect(map['tokyo']).toBe(false)
  })

  it('minutesUntilChange is non-negative for all sessions', () => {
    const statuses = computeSessionStatuses(TRADING_SESSIONS, utcDate(10))
    statuses.forEach(s => {
      expect(s.minutesUntilChange).toBeGreaterThanOrEqual(0)
    })
  })

  it('London minutesUntilChange at 10:00 UTC is 420 (7 hours until close at 17)', () => {
    const statuses = computeSessionStatuses(TRADING_SESSIONS, utcDate(10))
    const london = statuses.find(s => s.session.id === 'london')!
    expect(london.minutesUntilChange).toBe(420)
  })

  it('Sydney minutesUntilChange at 22:00 UTC is 540 (9 hours until close at 07)', () => {
    // Sydney opens at 22, closes at 07 — at 22:00 UTC, 9 hours = 540 min remain
    const statuses = computeSessionStatuses(TRADING_SESSIONS, utcDate(22))
    const sydney = statuses.find(s => s.session.id === 'sydney')!
    expect(sydney.isOpen).toBe(true)
    expect(sydney.minutesUntilChange).toBe(540)
  })
})
