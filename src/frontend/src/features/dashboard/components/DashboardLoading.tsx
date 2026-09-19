import { Skeleton } from '@/components/ui/skeleton'

export function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading dashboard">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-48 w-full rounded-2xl" />
      ))}
    </div>
  )
}
