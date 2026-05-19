import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LiveClock from '@/components/forex-hours/LiveClock'
import type { ClockState } from '@/lib/forex-sessions/types'

const makeClockState = (utcHour: number, utcMinute: number, utcSecond = 30): ClockState => {
  const now = new Date()
  now.setUTCHours(utcHour, utcMinute, utcSecond, 0)
  return {
    now,
    utcHour,
    utcMinute,
    localTimezone: 'Australia/Sydney',
  }
}

describe('LiveClock', () => {
  it('renders UTC time string', () => {
    render(<LiveClock clock={makeClockState(14, 30, 45)} />)
    expect(screen.getByText(/14:30:45/)).toBeInTheDocument()
  })

  it('renders local timezone label', () => {
    render(<LiveClock clock={makeClockState(14, 30)} />)
    expect(screen.getByText(/Australia\/Sydney/i)).toBeInTheDocument()
  })

  it('renders both UTC and local time sections', () => {
    render(<LiveClock clock={makeClockState(10, 0)} />)
    expect(screen.getByText(/UTC/i)).toBeInTheDocument()
    expect(screen.getByText(/local/i)).toBeInTheDocument()
  })

  it('updates display when clock prop changes', () => {
    const { rerender } = render(<LiveClock clock={makeClockState(14, 30, 0)} />)
    expect(screen.getByText(/14:30:00/)).toBeInTheDocument()

    rerender(<LiveClock clock={makeClockState(14, 30, 1)} />)
    expect(screen.getByText(/14:30:01/)).toBeInTheDocument()
  })

  it('does not start its own setInterval', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    render(<LiveClock clock={makeClockState(10, 0)} />)
    expect(setIntervalSpy).not.toHaveBeenCalled()
    setIntervalSpy.mockRestore()
  })
})
