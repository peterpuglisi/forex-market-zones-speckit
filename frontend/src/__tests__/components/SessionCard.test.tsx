import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SessionCard from '@/components/forex-hours/SessionCard'
import type { SessionStatus, TradingSession } from '@/lib/forex-sessions/types'

const londonSession: TradingSession = {
  id: 'london',
  name: 'London',
  openHour: 8,
  closeHour: 17,
  color: 'bg-blue-500',
}

const openStatus: SessionStatus = {
  session: londonSession,
  isOpen: true,
  minutesUntilChange: 180,
}

const closedStatus: SessionStatus = {
  session: londonSession,
  isOpen: false,
  minutesUntilChange: 60,
}

describe('SessionCard', () => {
  it('renders the session name', () => {
    render(<SessionCard status={openStatus} />)
    expect(screen.getByText('London')).toBeInTheDocument()
  })

  it('renders open badge when isOpen is true', () => {
    render(<SessionCard status={openStatus} />)
    expect(screen.getByText(/open/i)).toBeInTheDocument()
  })

  it('renders closed badge when isOpen is false', () => {
    render(<SessionCard status={closedStatus} />)
    expect(screen.getByText(/closed/i)).toBeInTheDocument()
  })

  it('applies session color class to the status indicator', () => {
    const { container } = render(<SessionCard status={openStatus} />)
    const indicator = container.querySelector('.bg-blue-500')
    expect(indicator).toBeInTheDocument()
  })

  it('displays minutesUntilChange label', () => {
    render(<SessionCard status={openStatus} />)
    expect(screen.getByText(/180/)).toBeInTheDocument()
  })

  it('does not use inline styles on the color indicator', () => {
    const { container } = render(<SessionCard status={openStatus} />)
    const elements = container.querySelectorAll('[style]')
    // No element should have a background color set via inline style
    elements.forEach(el => {
      expect((el as HTMLElement).style.backgroundColor).toBe('')
    })
  })
})
