import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { cn } from '@/lib/utils'
import type { CalendarEventDto } from '@/types/dashboard'
import { bucketEventsByDay, formatEventTime, getWeekDays, isSameLocalDay } from './weekUtils'
import { WEEKDAY_COLORS } from './weekdayColors'

const MAX_VISIBLE_EVENTS_PER_DAY = 4
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarWidget() {
  const { data, isLoading, isError } = useDashboard()
  const today = useMemo(() => new Date(), [])
  const weekDays = useMemo(() => getWeekDays(today), [today])
  const eventsByDay = useMemo(
    () => bucketEventsByDay(data?.calendar.events ?? [], weekDays),
    [data, weekDays],
  )

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
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load calendar events.</p>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                label={WEEKDAY_LABELS[i]}
                events={eventsByDay[i]}
                color={WEEKDAY_COLORS[i]}
                isToday={isSameLocalDay(day, today)}
              />
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
  color: (typeof WEEKDAY_COLORS)[number]
  isToday: boolean
}

function DayColumn({ day, label, events, color, isToday }: DayColumnProps) {
  const visible = events.slice(0, MAX_VISIBLE_EVENTS_PER_DAY)
  const overflowCount = events.length - visible.length

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col items-center gap-1 text-center">
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

      <div className="flex flex-col gap-1">
        {visible.map((event) => (
          <div
            key={event.id}
            className={cn('rounded-md border px-1.5 py-1 text-left', color.chip)}
            title={event.title}
          >
            <p className="line-clamp-2 text-xs leading-tight font-medium">{event.title}</p>
            <p className="text-[0.65rem] leading-tight opacity-80">{formatEventTime(event)}</p>
          </div>
        ))}
        {overflowCount > 0 && <p className="text-muted-foreground px-1 text-[0.65rem]">+{overflowCount} more</p>}
      </div>
    </div>
  )
}
