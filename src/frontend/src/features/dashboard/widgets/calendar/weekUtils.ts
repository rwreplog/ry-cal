import type { CalendarEventDto } from '@/types/dashboard'

// Sunday-start week (standard US week).
export function getWeekDays(reference: Date): Date[] {
  const day = reference.getDay() // 0 = Sunday .. 6 = Saturday
  const sunday = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i))
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

// Heuristic for an all-day event: Google/ICS all-day events land on a local
// midnight start with a duration of roughly a full day (or more, for multi-day).
export function isAllDayEvent(event: CalendarEventDto): boolean {
  const start = new Date(event.startsAtUtc)
  const end = new Date(event.endsAtUtc)
  const isMidnight = start.getHours() === 0 && start.getMinutes() === 0
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return isMidnight && durationHours >= 20
}

export function formatEventTime(event: CalendarEventDto): string {
  if (isAllDayEvent(event)) return 'All day'
  const start = new Date(event.startsAtUtc)
  const end = new Date(event.endsAtUtc)
  const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
  return `${start.toLocaleTimeString(undefined, timeFormat)} – ${end.toLocaleTimeString(undefined, timeFormat)}`
}
