import { Hourglass } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

function daysUntilLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Today!'
  if (daysUntil === 1) return '1 day'
  return `${daysUntil} days`
}

// Closer = louder, same idea as a countdown clock turning red near zero — gives
// the list a sense of urgency at a glance instead of every row looking identical.
function urgencyClasses(daysUntil: number): string {
  if (daysUntil <= 1) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
  if (daysUntil <= 7) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
  return 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
}

export function CountdownsWidget() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <Card className={widgetAccentClasses('countdowns')}>
      <CardHeader className="flex-row items-center gap-2">
        <Hourglass className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Countdowns</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load countdowns.</p>}

        {!isLoading && !isError && data && data.countdowns.items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Hourglass className="text-muted-foreground/40 size-8" aria-hidden="true" />
            <p className="text-muted-foreground text-sm">No countdowns yet — add one to look forward to.</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.countdowns.items.map((countdown) => (
            <div key={countdown.id} className="flex items-center justify-between gap-3">
              <span className="font-medium">{countdown.label}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap ${urgencyClasses(countdown.daysUntil)}`}
              >
                {daysUntilLabel(countdown.daysUntil)}
              </span>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
