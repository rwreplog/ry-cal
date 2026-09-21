import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { useMealMutations } from '@/features/meals/hooks/useMealMutations'
import type { MealPlanEntryDto } from '@/types/meals'
import { MealPlanForm } from './MealPlanForm'

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function MealPlanListItem({ meal, takenDates }: { meal: MealPlanEntryDto; takenDates: string[] }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove } = useMealMutations()

  return (
    <div className="flex items-start gap-3 rounded-2xl border p-4">
      <button type="button" className="flex-1 text-left" onClick={() => setEditOpen(true)}>
        <p className="text-muted-foreground text-sm">{formatDate(meal.date)}</p>
        <p className="font-medium">{meal.name}</p>
        {meal.description && <p className="text-muted-foreground mt-1 text-sm">{meal.description}</p>}
      </button>

      <DeleteConfirmDialog
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${meal.name}`} disabled={remove.isPending}>
            <Trash2 className="size-4" />
          </Button>
        }
        title={`Delete "${meal.name}"?`}
        onConfirm={() => remove.mutate(meal.id)}
      />

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit meal</SheetTitle>
          </SheetHeader>
          <MealPlanForm
            initial={meal}
            takenDates={takenDates.filter((d) => d !== meal.date)}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) => update.mutate({ id: meal.id, request: values }, { onSuccess: () => setEditOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
