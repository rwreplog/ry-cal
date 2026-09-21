import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { cn } from '@/lib/utils'
import type { CalendarEventDto, ChoreSummaryDto, MealPlanSummaryDto } from '@/types/dashboard'
import { bucketChoresByDay, bucketEventsByDay, bucketMealsByDay, formatEventTime, getWeekDays, isSameLocalDay } from './weekUtils'
import { WEEKDAY_COLORS } from './weekdayColors'

const MAX_VISIBLE_EVENTS_PER_DAY = 4
const MAX_VISIBLE_CHORES_PER_DAY = 3
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Literal, not interpolated (`col-start-${i}` is invisible to Tailwind's build-time
// scanner — the same dynamic-class-name bug this codebase has hit twice before).
// Used to place each day's header/events/meal/chores as four separate grid items in
// a shared 7-col grid, so CSS Grid's own row-sizing (each row sized to its tallest
// cell) lines up every section at the same height across every day, regardless of
// how much content any individual day has above it.
const COL_START = ['col-start-1', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7']

interface ChoreLegendEntry {
  id: string
  name: string
  color: string
}

// Dedup by family member, not by chore — one legend entry per person who has at
// least one colored, assigned chore, alphabetical so the row is stable across
// refetches regardless of chore order.
function buildChoreLegend(chores: ChoreSummaryDto[]): ChoreLegendEntry[] {
  const byMember = new Map<string, ChoreLegendEntry>()
  for (const chore of chores) {
    if (!chore.assignedToFamilyMemberId || !chore.assignedToColor) continue
    if (!byMember.has(chore.assignedToFamilyMemberId)) {
      byMember.set(chore.assignedToFamilyMemberId, {
        id: chore.assignedToFamilyMemberId,
        name: chore.assignedTo,
        color: chore.assignedToColor,
      })
    }
  }
  return [...byMember.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function CalendarWidget() {
  const { data, isLoading, isError } = useDashboard()
  const today = useMemo(() => new Date(), [])
  const weekDays = useMemo(() => getWeekDays(today), [today])
  const eventsByDay = useMemo(
    () => bucketEventsByDay(data?.calendar.events ?? [], weekDays),
    [data, weekDays],
  )
  const choresByDay = useMemo(
    () => bucketChoresByDay(data?.chores.items ?? [], weekDays),
    [data, weekDays],
  )
  const mealsByDay = useMemo(() => bucketMealsByDay(data?.meals.items ?? [], weekDays), [data, weekDays])
  const choreLegend = useMemo(() => buildChoreLegend(data?.chores.items ?? []), [data])

  const rangeLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <CalendarDays className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">This Week</CardTitle>
        <span className="text-muted-foreground text-sm">{rangeLabel}</span>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              // Segmented to roughly match the real header/events/dinner/chores
              // shape, not one flat block — the real content is noticeably taller
              // than a single small block, which made the card visibly jump in
              // height the instant data arrived.
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load calendar events.</p>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-7 gap-x-2 gap-y-1.5">
            {weekDays.map((day, i) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                label={WEEKDAY_LABELS[i]}
                events={eventsByDay[i]}
                meals={mealsByDay[i]}
                chores={choresByDay[i]}
                color={WEEKDAY_COLORS[i]}
                isToday={isSameLocalDay(day, today)}
                colStart={COL_START[i]}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && choreLegend.length > 0 && (
          <div className="border-border mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Chores by</span>
            {choreLegend.map((entry) => (
              <div key={entry.id} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DayColumnProps {
  day: Date
  label: string
  events: CalendarEventDto[]
  meals: MealPlanSummaryDto[]
  chores: ChoreSummaryDto[]
  color: (typeof WEEKDAY_COLORS)[number]
  isToday: boolean
  colStart: string
}

// Renders as four separate grid items (header/events/meal/chores), each pinned to
// an explicit row via row-start-N, rather than one flex-column wrapper — see
// COL_START's comment for why: it's what makes each section line up across every
// day. All three sections below the header are read-only here: dinner is edited at
// /admin/meals, chores from the Chores widget or /admin/chores — this is a "what's
// due when" glance, not another editor.
function DayColumn({ day, label, events, meals, chores, color, isToday, colStart }: DayColumnProps) {
  const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS_PER_DAY)
  const eventOverflowCount = events.length - visibleEvents.length
  const meal = meals[0] // one meal per day, enforced server-side
  const visibleChores = chores.slice(0, MAX_VISIBLE_CHORES_PER_DAY)
  const choreOverflowCount = chores.length - visibleChores.length

  return (
    <>
      <div className={cn('row-start-1 flex flex-col items-center gap-1 text-center', colStart)}>
        <span className={cn('text-xs font-semibold tracking-wide uppercase', color.header)}>{label}</span>
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-full text-sm font-medium',
            isToday ? color.todayBadge : 'text-foreground',
          )}
        >
          {day.getDate()}
        </span>
      </div>

      <div className={cn('row-start-2 flex flex-col gap-1', colStart)}>
        {visibleEvents.length === 0 && (
          <div className="border-border text-muted-foreground flex min-h-11 items-center justify-center rounded-md border border-dashed px-1.5 py-1 text-center text-[0.65rem] opacity-70">
            No events today
          </div>
        )}
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className={cn('rounded-md border px-1.5 py-1 text-left', color.chip)}
            title={event.title}
          >
            <p className="line-clamp-2 text-xs leading-tight font-medium">{event.title}</p>
            <p className="text-[0.65rem] leading-tight opacity-80">{formatEventTime(event)}</p>
          </div>
        ))}
        {eventOverflowCount > 0 && (
          <p className="text-muted-foreground px-1 text-[0.65rem]">+{eventOverflowCount} more</p>
        )}
      </div>

      <div className={cn('border-border mt-0.5 flex flex-col gap-1 border-t pt-1.5', 'row-start-3', colStart)}>
        <span className="text-muted-foreground text-[0.6rem] font-semibold tracking-wide uppercase">Dinner</span>
        {!meal && <p className="text-muted-foreground text-[0.65rem]">No dinner planned</p>}
        {meal && (
          <p className="truncate text-[0.65rem] leading-tight" title={meal.description ?? meal.name}>
            {meal.name}
          </p>
        )}
      </div>

      <div className={cn('border-border mt-0.5 flex flex-col gap-1 border-t pt-1.5', 'row-start-4', colStart)}>
        <span className="text-muted-foreground text-[0.6rem] font-semibold tracking-wide uppercase">Chores</span>
        {chores.length === 0 && <p className="text-muted-foreground text-[0.65rem]">No chores due</p>}
        {visibleChores.map((chore) => (
          <div key={chore.id} className="flex items-center gap-1.5" title={`${chore.title} — ${chore.assignedTo}`}>
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: chore.assignedToColor ?? 'var(--muted-foreground)' }}
              aria-hidden="true"
            />
            <span
              className={cn(
                'truncate text-[0.65rem] leading-tight',
                chore.isComplete && 'text-muted-foreground line-through',
              )}
            >
              {chore.title}
            </span>
          </div>
        ))}
        {choreOverflowCount > 0 && (
          <p className="text-muted-foreground px-1 text-[0.6rem]">+{choreOverflowCount} more</p>
        )}
      </div>
    </>
  )
}
