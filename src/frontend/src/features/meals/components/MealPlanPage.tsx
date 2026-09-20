import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMealMutations } from '@/features/meals/hooks/useMealMutations'
import { useMeals } from '@/features/meals/hooks/useMeals'
import { MealPlanForm } from './MealPlanForm'
import { MealPlanListItem } from './MealPlanListItem'

export function MealPlanPage() {
  const { data, isLoading, isError } = useMeals()
  const { create } = useMealMutations()
  const [addOpen, setAddOpen] = useState(false)

  const takenDates = data?.map((m) => m.date) ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add meal
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load the meal plan.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">No meals planned yet. Add one to get started.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((meal) => (
            <MealPlanListItem key={meal.id} meal={meal} takenDates={takenDates} />
          ))}
        </div>
      )}

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add meal</SheetTitle>
          </SheetHeader>
          <MealPlanForm
            takenDates={takenDates}
            submitLabel="Add meal"
            isPending={create.isPending}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => setAddOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
