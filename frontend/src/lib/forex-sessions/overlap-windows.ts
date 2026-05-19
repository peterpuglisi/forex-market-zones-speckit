import type { OverlapWindow, ActiveOverlap } from './types'

export function computeActiveOverlaps(
  windows: OverlapWindow[],
  utcHour: number
): ActiveOverlap[] {
  return windows.map(window => ({
    window,
    isActive: utcHour >= window.openHour && utcHour < window.closeHour,
  }))
}
