import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SessionStatus } from '@/lib/forex-sessions/types'

interface SessionCardProps {
  status: SessionStatus
}

export default function SessionCard({ status }: SessionCardProps) {
  const { session, isOpen, minutesUntilChange } = status

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full shrink-0 ${session.color}`} />
          <CardTitle>{session.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <Badge variant={isOpen ? 'default' : 'outline'}>
            {isOpen ? 'Open' : 'Closed'}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {isOpen
              ? `Closes in ${minutesUntilChange} min`
              : `Opens in ${minutesUntilChange} min`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
