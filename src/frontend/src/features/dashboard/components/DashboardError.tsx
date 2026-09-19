import { Button } from '@/components/ui/button'

interface DashboardErrorProps {
  onRetry: () => void
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-xl font-medium">Couldn&apos;t load the dashboard.</p>
      <p className="text-muted-foreground">Check that the API is running and try again.</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
