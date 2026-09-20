import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCountdownMutations } from '@/features/countdowns/hooks/useCountdownMutations'
import { useCountdowns } from '@/features/countdowns/hooks/useCountdowns'
import { CountdownForm } from './CountdownForm'
import { CountdownListItem } from './CountdownListItem'

export function CountdownsPage() {
  const { data, isLoading, isError } = useCountdowns()
  const { create } = useCountdownMutations()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Countdowns</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load countdowns.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">No countdowns yet. Add one to get started.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((countdown) => (
            <CountdownListItem key={countdown.id} countdown={countdown} />
          ))}
        </div>
      )}

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add countdown</SheetTitle>
          </SheetHeader>
          <CountdownForm
            submitLabel="Add countdown"
            isPending={create.isPending}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => setAddOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
