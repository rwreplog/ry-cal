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
          <p className="text-muted-foreground text-sm">No countdowns yet.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.countdowns.items.map((countdown) => (
            <div key={countdown.id} className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{countdown.label}</span>
              <span className="text-muted-foreground shrink-0 text-sm">{daysUntilLabel(countdown.daysUntil)}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
