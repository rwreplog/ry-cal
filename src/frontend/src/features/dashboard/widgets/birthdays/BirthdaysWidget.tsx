import { Cake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

function daysUntilLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Today!'
  if (daysUntil === 1) return 'Tomorrow'
  return `In ${daysUntil} days`
}

export function BirthdaysWidget() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <Card className={widgetAccentClasses('birthdays')}>
      <CardHeader className="flex-row items-center gap-2">
        <Cake className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Birthdays</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load birthdays.</p>}

        {!isLoading && !isError && data && data.birthdays.items.length === 0 && (
          <p className="text-muted-foreground text-sm">No birthdays in the next 30 days.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.birthdays.items.map((birthday) => (
            <div key={birthday.id} className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{birthday.name}</span>
              <span className="text-muted-foreground shrink-0 text-sm">{daysUntilLabel(birthday.daysUntil)}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
