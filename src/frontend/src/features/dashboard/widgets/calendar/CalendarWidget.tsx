import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { cn } from '@/lib/utils'
import type { CalendarEventDto, ChoreSummaryDto, MealPlanSummaryDto } from '@/types/dashboard'
import {
  bucketChoresByDay,
  bucketEventsByDay,
  type ChoreOccurrence,
  bucketMealsByDay,
  formatEventTime,
  getAllDayBars,
  getUpcomingDays,
  getWeekDays,
  isAllDayEvent,
  isSameLocalDay,
  packAllDayLanes,
} from './weekUtils'
import { WEEKDAY_COLORS } from './weekdayColors'

const MAX_VISIBLE_EVENTS_PER_DAY = 4
const MAX_VISIBLE_CHORES_PER_DAY = 6
const FALLBACK_PILL_COLOR = '#94a3b8'

// Assignee colors are user-picked, so the pill's text/checkbox color is chosen per
// pill (black or white by perceived luminance) rather than assumed.
function readableTextColor(hex: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return '#0f172a'
  const n = parseInt(match[1], 16)
  const luminance = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return luminance > 0.6 ? '#0f172a' : '#ffffff'
}
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Empty sections show a quiet dash (screen readers still get the words) — seven
// repeated "No dinner planned" lines were visual noise on a wall display.
function EmptyDash({ label }: { label: string }) {
  return (
    <p className="text-muted-foreground/50 text-sm">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{label}</span>
    </p>
  )
}

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

const hasUnassignedChore = (chores: ChoreSummaryDto[]) => chores.some((c) => !c.assignedToFamilyMemberId)

export function CalendarWidget() {
  const { data, isLoading, isError } = useDashboard()
  const { data: config } = useDashboardConfig()
  const isRolling = config?.calendarView === 'rolling'
  const { complete } = useChoreMutations()
  const handleCompleteChore = (chore: ChoreSummaryDto) => {
    if (!chore.assignedToFamilyMemberId || chore.isComplete) return
    complete.mutate({ id: chore.id, request: { familyMemberId: chore.assignedToFamilyMemberId } })
  }
  // Re-evaluated periodically so a kiosk left running past midnight rolls the week
  // (and the "today" highlight) forward instead of freezing on the day it loaded.
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => {
      const current = new Date()
      setToday((prev) => (isSameLocalDay(prev, current) ? prev : current))
    }, 60 * 1000)
    return () => clearInterval(id)
  }, [])
  const weekDays = useMemo(() => (isRolling ? getUpcomingDays(today) : getWeekDays(today)), [isRolling, today])
  const eventsByDay = useMemo(
    () => bucketEventsByDay(data?.calendar.events ?? [], weekDays).map((day) => day.filter((e) => !isAllDayEvent(e))),
    [data, weekDays],
  )
  const allDayLanes = useMemo(() => packAllDayLanes(getAllDayBars(data?.calendar.events ?? [], weekDays)), [data, weekDays])
  const choresByDay = useMemo(
    () => bucketChoresByDay(data?.chores.items ?? [], weekDays),
    [data, weekDays],
  )
  const mealsByDay = useMemo(() => bucketMealsByDay(data?.meals.items ?? [], weekDays), [data, weekDays])
  const choreLegend = useMemo(() => buildChoreLegend(data?.chores.items ?? []), [data])
  const showUnassignedLegend = useMemo(() => hasUnassignedChore(data?.chores.items ?? []), [data])

  const rangeLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <CalendarDays className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">{isRolling ? 'Next 7 Days' : 'This Week'}</CardTitle>
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
            {/* Soft tint behind today's whole column, spanning every row. */}
            {weekDays.map(
              (day, i) =>
                isSameLocalDay(day, today) && (
                  <div
                    key="today-tint"
                    className={cn('bg-foreground/[0.04] pointer-events-none -m-1 row-span-5 row-start-1 rounded-xl', COL_START[i])}
                    aria-hidden="true"
                  />
                ),
            )}
            {allDayLanes.length > 0 && (
              <div className="col-span-7 col-start-1 row-start-2 flex flex-col gap-1">
                {allDayLanes.map((lane, laneIndex) => (
                  <div key={laneIndex} className="grid grid-cols-7 gap-x-2">
                    {lane.map((bar) => (
                      <div
                        key={bar.event.id}
                        title={bar.event.title}
                        style={{ gridColumn: `${bar.startIndex + 1} / span ${bar.endIndex - bar.startIndex + 1}` }}
                        className={cn(
                          'truncate rounded-md border px-2 py-0.5 text-xs font-medium',
                          WEEKDAY_COLORS[weekDays[bar.startIndex].getDay()].chip,
                        )}
                      >
                        {bar.event.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {weekDays.map((day, i) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                label={WEEKDAY_LABELS[day.getDay()]}
                events={eventsByDay[i]}
                meals={mealsByDay[i]}
                chores={choresByDay[i]}
                onCompleteChore={handleCompleteChore}
                color={WEEKDAY_COLORS[day.getDay()]}
                isToday={isSameLocalDay(day, today)}
                colStart={COL_START[i]}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && (choreLegend.length > 0 || showUnassignedLegend) && (
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
            {showUnassignedLegend && (
              <div className="flex items-center gap-1.5">
                <span className="border-muted-foreground size-2.5 shrink-0 rounded-full border border-dashed" aria-hidden="true" />
                <span className="text-sm">Unassigned</span>
              </div>
            )}
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
  chores: ChoreOccurrence[]
  color: (typeof WEEKDAY_COLORS)[number]
  isToday: boolean
  colStart: string
  onCompleteChore: (chore: ChoreSummaryDto) => void
}

// Renders as four separate grid items (header/events/meal/chores), each pinned to
// an explicit row via row-start-N, rather than one flex-column wrapper — see
// COL_START's comment for why: it's what makes each section line up across every
// day. All three sections below the header are read-only here: dinner is edited at
// /admin/meals. Chores are the one exception: each is a large tap target that
// checks it off directly, since this is used on a touchscreen.
function DayColumn({ day, label, events, meals, chores, color, isToday, colStart, onCompleteChore }: DayColumnProps) {
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

      <div className={cn('row-start-3 flex flex-col gap-1', colStart)}>
        {visibleEvents.length === 0 && <EmptyDash label="No events today" />}
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

      <div className={cn('border-border mt-0.5 flex flex-col gap-1 border-t pt-1.5', 'row-start-4', colStart)}>
        <span className="text-muted-foreground text-[0.6rem] font-semibold tracking-wide uppercase">Dinner</span>
        {!meal && <EmptyDash label="No dinner planned" />}
        {meal && (
          <p className="truncate text-sm leading-tight" title={meal.description ?? meal.name}>
            {meal.name}
          </p>
        )}
      </div>

      <div className={cn('border-border mt-0.5 flex flex-col gap-1 border-t pt-1.5', 'row-start-5', colStart)}>
        <span className="text-muted-foreground text-[0.6rem] font-semibold tracking-wide uppercase">Chores</span>
        {chores.length === 0 && <EmptyDash label="No chores due" />}
        {visibleChores.map((chore) => {
          // Unassigned chores can't be completed here (completion records who did
          // it) — assign them in /admin/chores first.
          const canComplete = Boolean(chore.assignedToFamilyMemberId) && !chore.isComplete && (!chore.isProjection || isToday)
          const isUnassigned = !chore.assignedToFamilyMemberId
          const pillColor = chore.assignedToColor ?? FALLBACK_PILL_COLOR
          return (
            <button
              key={chore.occurrenceKey}
              type="button"
              disabled={!canComplete}
              aria-label={chore.isComplete ? `${chore.title} is complete` : `Mark ${chore.title} complete`}
              title={`${chore.title} — ${chore.assignedTo}`}
              onClick={() => onCompleteChore(chore)}
              style={isUnassigned ? undefined : { backgroundColor: pillColor, color: readableTextColor(pillColor) }}
              className={cn(
                'flex min-h-11 w-full items-center gap-1.5 rounded-2xl px-2 py-1 text-left transition-opacity active:brightness-90 disabled:cursor-default',
                isUnassigned && 'text-muted-foreground border-muted-foreground/50 border-2 border-dashed',
                chore.isComplete && 'opacity-60',
              )}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-current"
                aria-hidden="true"
              >
                {chore.isComplete && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span
                className={cn('line-clamp-2 text-[0.8rem] leading-tight font-medium', chore.isComplete && 'line-through')}
              >
                {chore.title}
              </span>
            </button>
          )
        })}
        {choreOverflowCount > 0 && (
          <p className="text-muted-foreground px-1 text-[0.6rem]">+{choreOverflowCount} more</p>
        )}
      </div>
    </>
  )
}
