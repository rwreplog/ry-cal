import { UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

function relativeDayLabel(date: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return target.toLocaleDateString(undefined, { weekday: 'long' })
}

export function MealsWidget() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <Card className={widgetAccentClasses('meals')}>
      <CardHeader className="flex-row items-center gap-2">
        <UtensilsCrossed className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Meal Plan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load the meal plan.</p>}

        {!isLoading && !isError && data && data.meals.items.length === 0 && (
          <p className="text-muted-foreground text-sm">No meals planned yet.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.meals.items.map((meal, index) => (
            <div key={meal.id}>
              <p className="text-muted-foreground text-sm">{relativeDayLabel(meal.date)}</p>
              <p className={index === 0 ? 'text-lg font-semibold' : 'font-medium'}>{meal.name}</p>
              {index === 0 && meal.description && <p className="text-muted-foreground text-sm">{meal.description}</p>}
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
