import type { CalendarEventDto, ChoreSummaryDto, MealPlanSummaryDto } from '@/types/dashboard'

// Sunday-start week (standard US week).
export function getWeekDays(reference: Date): Date[] {
  const day = reference.getDay() // 0 = Sunday .. 6 = Saturday
  const sunday = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i))
}

// Rolling window starting at `reference` (today is always first) — more useful on a
// wall display than a fixed Sun–Sat week, where late-week days are mostly the past.
export function getUpcomingDays(reference: Date, count = 7): Date[] {
  return Array.from({ length: count }, (_, i) => new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + i))
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// The local calendar-day range an event covers, at day granularity (time-of-day
// dropped). All-day events use an exclusive end per the ICS/Google convention (a
// Mon-Thu all-day event's endsAtUtc lands on Friday) — stepped back a day so the
// range actually ends on the last day the event covers, not the day after.
function getEventDayRange(event: CalendarEventDto): { start: Date; end: Date } {
  const start = new Date(event.startsAtUtc)
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())

  const rawEnd = new Date(event.endsAtUtc)
  let endDate = new Date(rawEnd.getFullYear(), rawEnd.getMonth(), rawEnd.getDate())

  if (isAllDayEvent(event) && endDate.getTime() > startDate.getTime()) {
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1)
  }

  if (endDate.getTime() < startDate.getTime()) {
    endDate = startDate // malformed/zero-length range — never worse than a single day
  }

  return { start: startDate, end: endDate }
}

// Buckets events into the 7 weekDays they overlap — a multi-day all-day event
// (e.g. Mon-Thu) appears in each of those day columns, not just its start day.
// Events entirely outside the given week (the dashboard fetches a wider range)
// are dropped.
export function bucketEventsByDay(events: CalendarEventDto[], weekDays: Date[]): CalendarEventDto[][] {
  const buckets: CalendarEventDto[][] = weekDays.map(() => [])
  for (const event of events) {
    const { start, end } = getEventDayRange(event)
    weekDays.forEach((day, index) => {
      if (day.getTime() >= start.getTime() && day.getTime() <= end.getTime()) {
        buckets[index].push(event)
      }
    })
  }
  for (const bucket of buckets) {
    bucket.sort((a, b) => new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime())
  }
  return buckets
}

// Shared by chores/meals: each has a single date (unlike events' start/end range),
// so bucketing is a plain same-day match against one of the 7 weekDays. Items
// landing outside the given week (each dashboard section fetches further ahead than
// 7 days) are dropped. sortKey defaults to the same date used for bucketing; chores
// pass a distinct one (dueAtUtc has time-of-day, useful for ordering same-day
// chores, where the bucketing date itself is midnight-truncated).
function bucketByDay<T>(items: T[], weekDays: Date[], getDate: (item: T) => Date, getSortKey: (item: T) => number = (item) => getDate(item).getTime()): T[][] {
  const buckets: T[][] = weekDays.map(() => [])
  for (const item of items) {
    const date = getDate(item)
    const index = weekDays.findIndex((day) => isSameLocalDay(day, date))
    if (index !== -1) buckets[index].push(item)
  }
  for (const bucket of buckets) {
    bucket.sort((a, b) => getSortKey(a) - getSortKey(b))
  }
  return buckets
}

export interface ChoreOccurrence extends ChoreSummaryDto {
  // Unique per rendered pill — a recurring chore can appear on several days.
  occurrenceKey: string
  // A repeat of a recurring chore on a later matching day, rather than the chore's
  // actual next due date. Only completable once its day arrives.
  isProjection: boolean
}

// A chore sits on the day it's due. A recurring chore also repeats on every later
// visible day its pattern hits (daily: every day; weekly: the same weekday), so
// "Laundry every Wednesday" shows on each Wednesday in view instead of only the
// next one. Completed entries are historical and never repeat, and past-due chores
// stay on their original (now-past) day rather than piling onto today.
export function bucketChoresByDay(chores: ChoreSummaryDto[], weekDays: Date[]): ChoreOccurrence[][] {
  const buckets: ChoreOccurrence[][] = weekDays.map(() => [])
  for (const chore of chores) {
    const due = new Date(chore.dueAtUtc)
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())

    weekDays.forEach((day, index) => {
      if (isSameLocalDay(day, due)) {
        buckets[index].push({ ...chore, occurrenceKey: chore.id, isProjection: false })
        return
      }
      if (chore.isComplete || chore.recurrence === 'none' || day.getTime() <= dueDay.getTime()) return
      const matches = chore.recurrence === 'daily' || (chore.recurrence === 'weekly' && day.getDay() === dueDay.getDay())
      if (!matches) return
      const projected = new Date(day.getFullYear(), day.getMonth(), day.getDate(), due.getHours(), due.getMinutes())
      buckets[index].push({
        ...chore,
        dueAtUtc: projected.toISOString(),
        occurrenceKey: `${chore.id}:${index}`,
        isProjection: true,
      })
    })
  }
  for (const bucket of buckets) {
    bucket.sort((a, b) => new Date(a.dueAtUtc).getTime() - new Date(b.dueAtUtc).getTime())
  }
  return buckets
}

// MealPlanEntry.Date is a DateOnly, serialized as "yyyy-MM-dd" with no time/zone —
// parsing it with `new Date(string)` reads it as UTC midnight, which can land on the
// wrong local day west of UTC. Split-and-construct instead to build it in local time.
function parseDateOnly(dateOnly: string): Date {
  const [year, month, day] = dateOnly.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function bucketMealsByDay(meals: MealPlanSummaryDto[], weekDays: Date[]): MealPlanSummaryDto[][] {
  return bucketByDay(meals, weekDays, (meal) => parseDateOnly(meal.date))
}

// Heuristic for an all-day event: Google/ICS all-day events carry a bare date (no
// time/zone) that CalendarProvider.cs parses as midnight in the backend container's
// own timezone (UTC) — so the UTC hour, not the viewer's local hour, is what's
// reliably 0 for one of these. Checking local hours here was the bug behind
// "8:00 PM – 8:00 PM" for anyone west of UTC: a UTC-midnight start reads as 8 PM the
// previous day in US Eastern (UTC-4/-5), so it never matched local midnight at all.
export function isAllDayEvent(event: CalendarEventDto): boolean {
  const start = new Date(event.startsAtUtc)
  const end = new Date(event.endsAtUtc)
  const isMidnightUtc = start.getUTCHours() === 0 && start.getUTCMinutes() === 0
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return isMidnightUtc && durationHours >= 20
}

export function formatEventTime(event: CalendarEventDto): string {
  if (isAllDayEvent(event)) return 'All Day'
  const start = new Date(event.startsAtUtc)
  const end = new Date(event.endsAtUtc)
  const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
  return `${start.toLocaleTimeString(undefined, timeFormat)} – ${end.toLocaleTimeString(undefined, timeFormat)}`
}

export interface AllDayBar {
  event: CalendarEventDto
  startIndex: number
  endIndex: number
}

// All-day events as bars over the visible days, clamped to the window — a Sun–Fri
// event becomes one bar spanning six columns instead of six repeated chips.
export function getAllDayBars(events: CalendarEventDto[], days: Date[]): AllDayBar[] {
  const bars: AllDayBar[] = []
  for (const event of events) {
    if (!isAllDayEvent(event)) continue
    const { start, end } = getEventDayRange(event)
    const indices = days.map((day, i) => (day.getTime() >= start.getTime() && day.getTime() <= end.getTime() ? i : -1)).filter((i) => i !== -1)
    if (indices.length === 0) continue
    bars.push({ event, startIndex: indices[0], endIndex: indices[indices.length - 1] })
  }
  return bars.sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex)
}

// Greedy lane packing so overlapping bars stack instead of covering each other.
export function packAllDayLanes(bars: AllDayBar[]): AllDayBar[][] {
  const lanes: AllDayBar[][] = []
  for (const bar of bars) {
    const lane = lanes.find((l) => l[l.length - 1].endIndex < bar.startIndex)
    if (lane) lane.push(bar)
    else lanes.push([bar])
  }
  return lanes
}
