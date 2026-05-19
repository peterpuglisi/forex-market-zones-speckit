import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SessionTimeline from '@/components/forex-hours/SessionTimeline'
import { TRADING_SESSIONS, OVERLAP_WINDOWS } from '@/lib/forex-sessions/sessions'

const defaultProps = {
  sessions: TRADING_SESSIONS,
  overlaps: OVERLAP_WINDOWS,
  currentUtcHour: 14,
  currentUtcMinute: 0,
}

describe('SessionTimeline', () => {
  it('renders 24 grid columns', () => {
    const { container } = render(<SessionTimeline {...defaultProps} />)
    const grid = container.querySelector('[data-testid="timeline-grid"]')
    expect(grid).toBeInTheDocument()
    // 24-column grid
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' })
  })

  it('renders a bar for each session', () => {
    render(<SessionTimeline {...defaultProps} />)
    TRADING_SESSIONS.forEach(session => {
      expect(screen.getByTestId(`session-bar-${session.id}`)).toBeInTheDocument()
    })
  })

  it('Sydney bar has two segments for midnight crossing', () => {
    const { container } = render(<SessionTimeline {...defaultProps} />)
    const sydneySegments = container.querySelectorAll('[data-session="sydney"]')
    expect(sydneySegments.length).toBe(2)
  })

  it('renders the current-time cursor', () => {
    const { container } = render(<SessionTimeline {...defaultProps} />)
    const cursor = container.querySelector('[data-testid="time-cursor"]')
    expect(cursor).toBeInTheDocument()
  })

  it('overlap zones are rendered', () => {
    const { container } = render(<SessionTimeline {...defaultProps} />)
    const overlayEls = container.querySelectorAll('[data-testid="overlap-zone"]')
    expect(overlayEls.length).toBe(OVERLAP_WINDOWS.length)
  })

  it('renders session name label on each session bar', () => {
    render(<SessionTimeline {...defaultProps} />)
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('New York')).toBeInTheDocument()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
  })
})
