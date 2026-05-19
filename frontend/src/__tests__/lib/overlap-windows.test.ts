import { describe, it, expect } from 'vitest'
import { computeActiveOverlaps } from '@/lib/forex-sessions/overlap-windows'
import { OVERLAP_WINDOWS } from '@/lib/forex-sessions/sessions'

describe('computeActiveOverlaps', () => {
  it('returns one entry per window in same order', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 10)
    expect(result).toHaveLength(OVERLAP_WINDOWS.length)
    result.forEach((r, i) => {
      expect(r.window).toBe(OVERLAP_WINDOWS[i])
    })
  })

  // Sydney / Tokyo (00–07)
  it('Sydney/Tokyo active at 0 (open boundary)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 0)
    const st = result.find(r => r.window.label === 'Sydney / Tokyo')!
    expect(st.isActive).toBe(true)
  })

  it('Sydney/Tokyo active at 4 (mid window)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 4)
    const st = result.find(r => r.window.label === 'Sydney / Tokyo')!
    expect(st.isActive).toBe(true)
  })

  it('Sydney/Tokyo inactive at 7 (close boundary)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 7)
    const st = result.find(r => r.window.label === 'Sydney / Tokyo')!
    expect(st.isActive).toBe(false)
  })

  it('Sydney/Tokyo inactive at 14', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 14)
    const st = result.find(r => r.window.label === 'Sydney / Tokyo')!
    expect(st.isActive).toBe(false)
  })

  // Tokyo / London (08–09)
  it('Tokyo/London active at 8 (open boundary)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 8)
    const tl = result.find(r => r.window.label === 'Tokyo / London')!
    expect(tl.isActive).toBe(true)
  })

  it('Tokyo/London inactive at 9 (close boundary)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 9)
    const tl = result.find(r => r.window.label === 'Tokyo / London')!
    expect(tl.isActive).toBe(false)
  })

  it('Tokyo/London inactive at 10', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 10)
    const tl = result.find(r => r.window.label === 'Tokyo / London')!
    expect(tl.isActive).toBe(false)
  })

  // London / New York (13–17)
  it('London/New York active at 13 (open boundary)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 13)
    const lny = result.find(r => r.window.label === 'London / New York')!
    expect(lny.isActive).toBe(true)
  })

  it('London/New York active at 14', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 14)
    const lny = result.find(r => r.window.label === 'London / New York')!
    expect(lny.isActive).toBe(true)
  })

  it('London/New York inactive at 17 (close boundary)', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 17)
    const lny = result.find(r => r.window.label === 'London / New York')!
    expect(lny.isActive).toBe(false)
  })

  it('London/New York inactive at 18', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 18)
    const lny = result.find(r => r.window.label === 'London / New York')!
    expect(lny.isActive).toBe(false)
  })

  // No overlaps active at 10:00
  it('no overlaps active at 10:00 UTC', () => {
    const result = computeActiveOverlaps(OVERLAP_WINDOWS, 10)
    expect(result.every(r => !r.isActive)).toBe(true)
  })
})
