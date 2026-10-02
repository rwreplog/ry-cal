import { CheckCircle2, Circle, ListChecks, PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { isSameLocalDay } from '@/features/dashboard/widgets/calendar/weekUtils'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'
import type { ChoreSummaryDto } from '@/types/dashboard'

const MAX_VISIBLE_UPCOMING = 5

interface ChoreRowProps {
  chore: ChoreSummaryDto
  onComplete: () => void
}

function ChoreRow({ chore, onComplete }: ChoreRowProps) {
  // Unassigned chores aren't tap-completable here (no picker on the dashboard) —
  // assign them via /admin/chores instead.
  const canComplete = Boolean(chore.assignedToFamilyMemberId) && !chore.isComplete

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={!canComplete}
        aria-label={chore.isComplete ? `${chore.title} is complete` : `Mark ${chore.title} complete`}
        onClick={onComplete}
        className="-m-2.5 flex size-11 shrink-0 items-center justify-center disabled:cursor-not-allowed"
      >
        {chore.isComplete ? (
          <CheckCircle2 className="size-6 text-emerald-500" aria-hidden="true" />
        ) : (
          <Circle className="text-muted-foreground size-6" aria-hidden="true" />
        )}
      </button>
      <span className={chore.isComplete ? 'text-muted-foreground line-through' : undefined}>{chore.title}</span>
      <span className="text-muted-foreground ml-auto shrink-0 text-sm">{chore.assignedTo}</span>
    </div>
  )
}

export function ChoresWidget() {
  const { data, isLoading, isError } = useDashboard()
  const { complete } = useChoreMutations()

  const handleComplete = (chore: ChoreSummaryDto) => {
    if (!chore.assignedToFamilyMemberId || chore.isComplete) return
    complete.mutate({ id: chore.id, request: { familyMemberId: chore.assignedToFamilyMemberId } })
  }

  const items = data?.chores.items ?? []
  const now = new Date()
  // "Today" also absorbs anything overdue (due before today, still incomplete) —
  // those need attention even more urgently than today's, not less, so they
  // belong in the same primary section rather than a separate bucket.
  const todayOrOverdue = items
    .filter((c) => new Date(c.dueAtUtc).getTime() <= now.getTime() || isSameLocalDay(new Date(c.dueAtUtc), now))
    .sort((a, b) => new Date(a.dueAtUtc).getTime() - new Date(b.dueAtUtc).getTime())
  const upcoming = items
    .filter((c) => !todayOrOverdue.includes(c))
    .sort((a, b) => new Date(a.dueAtUtc).getTime() - new Date(b.dueAtUtc).getTime())
  const visibleUpcoming = upcoming.slice(0, MAX_VISIBLE_UPCOMING)
  const upcomingOverflow = upcoming.length - visibleUpcoming.length
  const allTodayDone = todayOrOverdue.length > 0 && todayOrOverdue.every((c) => c.isComplete)

  return (
    <Card className={widgetAccentClasses('chores')}>
      <CardHeader className="flex-row items-center gap-2">
        <ListChecks className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Chores</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load chores.</p>}

        {!isLoading && !isError && data && (
          <>
            <div className="flex flex-col gap-3">
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Today</span>

              {todayOrOverdue.length === 0 && (
                <p className="text-muted-foreground text-sm">Nothing due today — enjoy the free day.</p>
              )}

              {allTodayDone && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <PartyPopper className="size-4 shrink-0" aria-hidden="true" />
                  All done for today!
                </p>
              )}

              {todayOrOverdue.map((chore) => (
                <ChoreRow key={chore.id} chore={chore} onComplete={() => handleComplete(chore)} />
              ))}
            </div>

            {upcoming.length > 0 && (
              <div className="border-border flex flex-col gap-3 border-t pt-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Upcoming</span>
                {visibleUpcoming.map((chore) => (
                  <ChoreRow key={chore.id} chore={chore} onComplete={() => handleComplete(chore)} />
                ))}
                {upcomingOverflow > 0 && (
                  <p className="text-muted-foreground text-sm">+{upcomingOverflow} more</p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
