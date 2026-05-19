import { Badge } from '@/components/ui/badge'
import type { ActiveOverlap } from '@/lib/forex-sessions/types'

interface OverlapBadgeProps {
  overlap: ActiveOverlap
}

export default function OverlapBadge({ overlap }: OverlapBadgeProps) {
  if (!overlap.isActive) return null

  return (
    <Badge variant="default" className="bg-yellow-500 text-white hover:bg-yellow-600">
      {overlap.window.label}
    </Badge>
  )
}
