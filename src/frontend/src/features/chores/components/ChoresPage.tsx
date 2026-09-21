import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useChores } from '@/features/chores/hooks/useChores'
import { ChoreCompletionHistory } from './ChoreCompletionHistory'
import { ChoreForm } from './ChoreForm'
import { ChoreListItem } from './ChoreListItem'

export function ChoresPage() {
  const { data, isLoading, isError } = useChores()
  const { create } = useChoreMutations()
  const [addOpen, setAddOpen] = useState(false)
  // Defaults to hiding completed chores — completion history already has its own
  // dedicated section below, so the main list defaulting to "what's still open" is
  // more useful than a flat, ever-growing feed mixing done and not-done together.
  const [hideCompleted, setHideCompleted] = useState(true)

  const visibleChores = useMemo(
    () => (hideCompleted ? (data?.filter((chore) => !chore.isComplete) ?? []) : (data ?? [])),
    [data, hideCompleted],
  )
  const completedCount = data ? data.length - data.filter((chore) => !chore.isComplete).length : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Chores</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add chore
        </Button>
      </div>

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="hide-completed" className="text-muted-foreground text-sm font-normal">
            Hide completed{completedCount > 0 ? ` (${completedCount})` : ''}
          </Label>
          <Switch id="hide-completed" checked={hideCompleted} onCheckedChange={setHideCompleted} />
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load chores.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">No chores yet. Add one to get started.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && visibleChores.length === 0 && (
        <p className="text-muted-foreground text-sm">All chores are complete.</p>
      )}

      {!isLoading && !isError && visibleChores.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleChores.map((chore) => (
            <ChoreListItem key={chore.id} chore={chore} />
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <ChoreCompletionHistory />
      </div>

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add chore</SheetTitle>
          </SheetHeader>
          <ChoreForm
            submitLabel="Add chore"
            isPending={create.isPending}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => setAddOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
