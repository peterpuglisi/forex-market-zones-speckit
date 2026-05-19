import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClock } from '@/hooks/useClock'

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns a ClockState with the correct shape', () => {
    const { result } = renderHook(() => useClock())
    expect(result.current).toMatchObject({
      now: expect.any(Date),
      utcHour: expect.any(Number),
      utcMinute: expect.any(Number),
      localTimezone: expect.any(String),
    })
  })

  it('updates ClockState on each interval tick', () => {
    const { result } = renderHook(() => useClock(100))
    const initial = result.current.now.getTime()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.now.getTime()).not.toBe(initial)
  })

  it('calls clearInterval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = renderHook(() => useClock())
    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })

  it('localTimezone is populated from Intl', () => {
    const { result } = renderHook(() => useClock())
    expect(result.current.localTimezone.length).toBeGreaterThan(0)
  })

  it('utcHour is derived from now.getUTCHours()', () => {
    const { result } = renderHook(() => useClock())
    expect(result.current.utcHour).toBe(result.current.now.getUTCHours())
  })

  it('utcMinute is derived from now.getUTCMinutes()', () => {
    const { result } = renderHook(() => useClock())
    expect(result.current.utcMinute).toBe(result.current.now.getUTCMinutes())
  })
})
