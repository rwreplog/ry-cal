import { ListChecks, Users, LayoutDashboard } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/chores', label: 'Chores', icon: ListChecks },
  { to: '/admin/family', label: 'Family', icon: Users },
]

export function AdminLayout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col pb-20">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <NavLink to="/" className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <LayoutDashboard className="size-4" />
          Dashboard
        </NavLink>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      <nav className="bg-background/95 fixed inset-x-0 bottom-0 mx-auto flex max-w-2xl border-t backdrop-blur">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
