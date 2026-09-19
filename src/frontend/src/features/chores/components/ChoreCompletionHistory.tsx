import { Skeleton } from '@/components/ui/skeleton'
import { useCompletionHistory } from '@/features/chores/hooks/useCompletionHistory'

export function ChoreCompletionHistory() {
  const { data, isLoading, isError } = useCompletionHistory({ take: 20 })

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>

      {isLoading && <Skeleton className="h-24 w-full rounded-2xl" />}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load completion history.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">No chores completed yet.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((completion) => (
            <li key={completion.id} className="text-muted-foreground flex items-center justify-between text-sm">
              <span>
                <span className="text-foreground font-medium">{completion.familyMemberName}</span> completed{' '}
                <span className="text-foreground">{completion.choreTitle}</span>
              </span>
              <span className="shrink-0">
                {new Date(completion.completedAtUtc).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
