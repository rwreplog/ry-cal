import {
  Cake,
  CalendarDays,
  Hourglass,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  ShoppingCart,
  SlidersHorizontal,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/chores', label: 'Chores', icon: ListChecks },
  { to: '/admin/family', label: 'Family', icon: Users },
  { to: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/admin/dashboard', label: 'Display', icon: SlidersHorizontal },
  { to: '/admin/announcements', label: 'News', icon: Megaphone },
  { to: '/admin/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/admin/shopping', label: 'Shopping', icon: ShoppingCart },
  { to: '/admin/birthdays', label: 'Birthdays', icon: Cake },
  { to: '/admin/countdowns', label: 'Countdowns', icon: Hourglass },
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

      {/* Fixed-width, horizontally-scrollable items — at 9 tabs, evenly-spaced
          flex-1 items would be illegibly cramped on a phone. Native touch-scroll
          momentum keeps every tab a legible, consistent size regardless of count.
          The mask fades both edges so it's visually obvious the bar scrolls even
          before anyone tries swiping it — without it, tabs past the fold (5+ of
          the 9 here) were easy to never discover. */}
      <nav
        className="bg-background/95 fixed inset-x-0 bottom-0 mx-auto flex max-w-2xl overflow-x-auto border-t backdrop-blur"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
        }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex w-[72px] shrink-0 flex-col items-center gap-1 py-3 text-xs font-medium',
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
