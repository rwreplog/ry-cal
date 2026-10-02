import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { DashboardShell } from './DashboardShell'
import { SidebarDashboardShell } from './SidebarDashboardShell'

// Picks which page shell to mount for "/" based on the household's saved
// "Dashboard layout" setting. Defaults to the stacked shell while the config is
// still loading (its normal first-load state anyway) rather than blocking on a
// second fetch before anything renders.
export function DashboardRoute() {
  const { data } = useDashboardConfig()
  return data?.dashboardLayout === 'sidebar' ? <SidebarDashboardShell /> : <DashboardShell />
}
