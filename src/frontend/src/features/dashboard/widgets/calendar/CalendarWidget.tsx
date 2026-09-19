import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'

export function CalendarWidget() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <CalendarDays className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Upcoming</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load calendar events.</p>}

        {!isLoading && !isError && data && data.calendar.events.length === 0 && (
          <p className="text-muted-foreground text-sm">Nothing on the calendar.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.calendar.events.map((event) => (
            <div key={event.id} className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{event.title}</span>
              <span className="text-muted-foreground shrink-0 text-sm">
                {new Date(event.startsAtUtc).toLocaleString(undefined, {
                  weekday: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
