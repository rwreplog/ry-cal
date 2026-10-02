import { CheckCircle2, Circle, ListChecks } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

export function ChoresWidget() {
  const { data, isLoading, isError } = useDashboard()
  const { complete } = useChoreMutations()

  return (
    <Card className={widgetAccentClasses('chores')}>
      <CardHeader className="flex-row items-center gap-2">
        <ListChecks className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Chores</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load chores.</p>}

        {!isLoading && !isError && data && data.chores.items.length === 0 && (
          <p className="text-muted-foreground text-sm">All chores are done.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.chores.items.map((chore) => {
            // Unassigned chores aren't tap-completable here (no picker on the
            // dashboard) — assign them via /admin/chores instead.
            const canComplete = Boolean(chore.assignedToFamilyMemberId) && !chore.isComplete

            return (
              <div key={chore.id} className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!canComplete}
                  aria-label={chore.isComplete ? `${chore.title} is complete` : `Mark ${chore.title} complete`}
                  onClick={() =>
                    chore.assignedToFamilyMemberId &&
                    complete.mutate({ id: chore.id, request: { familyMemberId: chore.assignedToFamilyMemberId } })
                  }
                  className="-m-2.5 flex size-11 shrink-0 items-center justify-center disabled:cursor-not-allowed"
                >
                  {chore.isComplete ? (
                    <CheckCircle2 className="size-6 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Circle className="text-muted-foreground size-6" aria-hidden="true" />
                  )}
                </button>
                <span className={chore.isComplete ? 'text-muted-foreground line-through' : undefined}>
                  {chore.title}
                </span>
                <span className="text-muted-foreground ml-auto shrink-0 text-sm">{chore.assignedTo}</span>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
