import { describe, expect, it } from 'vitest'
import type { CalendarEventDto, ChoreSummaryDto, MealPlanSummaryDto } from '@/types/dashboard'
import {
  bucketChoresByDay,
  bucketEventsByDay,
  bucketMealsByDay,
  formatEventTime,
  getAllDayBars,
  getUpcomingDays,
  getWeekDays,
  isAllDayEvent,
  isSameLocalDay,
  packAllDayLanes,
} from './weekUtils'

function event(overrides: Partial<CalendarEventDto> = {}): CalendarEventDto {
  return {
    id: 'evt-1',
    title: 'Test event',
    startsAtUtc: '2026-01-06T14:00:00Z', // Tuesday
    endsAtUtc: '2026-01-06T15:00:00Z',
    ...overrides,
  }
}

function chore(overrides: Partial<ChoreSummaryDto> = {}): ChoreSummaryDto {
  return {
    id: 'chore-1',
    title: 'Test chore',
    assignedTo: 'Sam',
    assignedToFamilyMemberId: 'member-1',
    assignedToColor: '#0ea5e9',
    dueAtUtc: '2026-01-06T14:00:00Z', // Tuesday
    isComplete: false,
    recurrence: 'none',
    ...overrides,
  }
}

function meal(overrides: Partial<MealPlanSummaryDto> = {}): MealPlanSummaryDto {
  return {
    id: 'meal-1',
    date: '2026-01-06', // Tuesday
    name: 'Tacos',
    description: null,
    ...overrides,
  }
}

describe('getWeekDays', () => {
  it('returns Sunday through Saturday for a mid-week reference date', () => {
    const days = getWeekDays(new Date(2026, 0, 7)) // Wednesday Jan 7, 2026
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(0) // Sunday
    expect(days[6].getDay()).toBe(6) // Saturday
    expect(days[0].getDate()).toBe(4)
    expect(days[6].getDate()).toBe(10)
  })

  it('keeps a Sunday reference date as the start of its own week, not the previous one', () => {
    const days = getWeekDays(new Date(2026, 0, 11)) // Sunday Jan 11, 2026
    expect(days[0].getDate()).toBe(11)
    expect(days[6].getDate()).toBe(17)
  })

  it('rolls a Saturday reference date back to that week\'s Sunday, not forward', () => {
    const days = getWeekDays(new Date(2026, 0, 10)) // Saturday Jan 10, 2026
    expect(days[0].getDate()).toBe(4)
    expect(days[6].getDate()).toBe(10)
  })
})

describe('isSameLocalDay', () => {
  it('is true for two dates on the same day at different times', () => {
    expect(isSameLocalDay(new Date(2026, 0, 5, 1, 0), new Date(2026, 0, 5, 23, 0))).toBe(true)
  })

  it('is false across a day boundary', () => {
    expect(isSameLocalDay(new Date(2026, 0, 5, 23, 59), new Date(2026, 0, 6, 0, 0))).toBe(false)
  })
})

describe('bucketEventsByDay', () => {
  const weekDays = getWeekDays(new Date(2026, 0, 7))

  it('places an event in the bucket matching its local start date', () => {
    const buckets = bucketEventsByDay([event({ startsAtUtc: '2026-01-06T14:00:00Z' })], weekDays)
    expect(buckets[2]).toHaveLength(1) // Tuesday is index 2 in a Sunday-start week
    expect(buckets.filter((b) => b.length > 0)).toHaveLength(1)
  })

  it('drops events outside the given week', () => {
    const buckets = bucketEventsByDay([event({ startsAtUtc: '2026-02-01T14:00:00Z' })], weekDays)
    expect(buckets.every((b) => b.length === 0)).toBe(true)
  })

  it('sorts events within a day chronologically', () => {
    const buckets = bucketEventsByDay(
      [
        event({ id: 'later', startsAtUtc: '2026-01-06T18:00:00Z' }),
        event({ id: 'earlier', startsAtUtc: '2026-01-06T09:00:00Z' }),
      ],
      weekDays,
    )
    expect(buckets[2].map((e) => e.id)).toEqual(['earlier', 'later'])
  })

  it('places a multi-day all-day event in every day it covers, not just its start day', () => {
    // Mon Jan 5 through Thu Jan 8 — endsAtUtc is Fri Jan 9 per the ICS/Google
    // exclusive-end convention for all-day events.
    const buckets = bucketEventsByDay(
      [event({ startsAtUtc: '2026-01-05T00:00:00Z', endsAtUtc: '2026-01-09T00:00:00Z' })],
      weekDays,
    )
    expect(buckets.map((b) => b.length)).toEqual([0, 1, 1, 1, 1, 0, 0]) // Sun..Sat
  })

  it('does not include the exclusive end day of a multi-day all-day event', () => {
    const buckets = bucketEventsByDay(
      [event({ startsAtUtc: '2026-01-05T00:00:00Z', endsAtUtc: '2026-01-09T00:00:00Z' })],
      weekDays,
    )
    expect(buckets[5]).toHaveLength(0) // Friday Jan 9 — the exclusive end, not covered
  })
})

describe('bucketChoresByDay', () => {
  const weekDays = getWeekDays(new Date(2026, 0, 7))

  it('places a chore in the bucket matching its local due date', () => {
    const buckets = bucketChoresByDay([chore({ dueAtUtc: '2026-01-06T14:00:00Z' })], weekDays)
    expect(buckets[2]).toHaveLength(1) // Tuesday is index 2 in a Sunday-start week
    expect(buckets.filter((b) => b.length > 0)).toHaveLength(1)
  })

  it('drops chores due outside the given week', () => {
    const buckets = bucketChoresByDay([chore({ dueAtUtc: '2026-02-01T14:00:00Z' })], weekDays)
    expect(buckets.every((b) => b.length === 0)).toBe(true)
  })

  it('sorts chores within a day chronologically', () => {
    const buckets = bucketChoresByDay(
      [
        chore({ id: 'later', dueAtUtc: '2026-01-06T18:00:00Z' }),
        chore({ id: 'earlier', dueAtUtc: '2026-01-06T09:00:00Z' }),
      ],
      weekDays,
    )
    expect(buckets[2].map((c) => c.id)).toEqual(['earlier', 'later'])
  })
})

describe('bucketMealsByDay', () => {
  const weekDays = getWeekDays(new Date(2026, 0, 7))

  it('places a meal in the bucket matching its date', () => {
    const buckets = bucketMealsByDay([meal({ date: '2026-01-06' })], weekDays)
    expect(buckets[2]).toHaveLength(1) // Tuesday is index 2 in a Sunday-start week
    expect(buckets.filter((b) => b.length > 0)).toHaveLength(1)
  })

  it('drops meals planned outside the given week', () => {
    const buckets = bucketMealsByDay([meal({ date: '2026-02-01' })], weekDays)
    expect(buckets.every((b) => b.length === 0)).toBe(true)
  })

  it('parses the DateOnly string as a local date, not UTC midnight', () => {
    // A naive `new Date('2026-01-04')` reads as UTC midnight, which is still Jan 3
    // in any timezone west of UTC — this must land on Jan 4 (Sunday, index 0)
    // regardless of the machine's local timezone.
    const buckets = bucketMealsByDay([meal({ date: '2026-01-04' })], weekDays)
    expect(buckets[0]).toHaveLength(1)
  })
})

describe('isAllDayEvent', () => {
  it('is true for a UTC-midnight event spanning roughly a full day', () => {
    expect(isAllDayEvent(event({ startsAtUtc: '2026-01-06T00:00:00Z', endsAtUtc: '2026-01-07T00:00:00Z' }))).toBe(true)
  })

  it('is false for a normal timed event', () => {
    expect(isAllDayEvent(event({ startsAtUtc: '2026-01-06T09:00:00Z', endsAtUtc: '2026-01-06T10:00:00Z' }))).toBe(false)
  })

  // Regression test using the exact shape of a real bug report: a UTC-midnight
  // start reads as 8 PM the previous day in US Eastern (UTC-4 in September), so
  // checking *local* hours instead of UTC hours made this render as
  // "8:00 PM – 8:00 PM" for anyone west of UTC. getUTCHours() is immune to the
  // viewer's local timezone by construction, so this holds regardless of which
  // timezone the test (or a family member's browser) runs in.
  it('is true for a real-world UTC-midnight all-day event', () => {
    expect(isAllDayEvent(event({ startsAtUtc: '2026-09-21T00:00:00+00:00', endsAtUtc: '2026-09-27T00:00:00+00:00' }))).toBe(
      true,
    )
  })
})

describe('formatEventTime', () => {
  it('renders "All Day" for an all-day event', () => {
    expect(formatEventTime(event({ startsAtUtc: '2026-01-06T00:00:00Z', endsAtUtc: '2026-01-07T00:00:00Z' }))).toBe('All Day')
  })

  it('renders a start–end time range for a timed event', () => {
    const result = formatEventTime(event({ startsAtUtc: '2026-01-06T09:00:00Z', endsAtUtc: '2026-01-06T09:30:00Z' }))
    expect(result).toContain('–')
    expect(result).not.toBe('All Day')
  })
})

describe('getUpcomingDays', () => {
  it('starts on the reference day and covers 7 consecutive days', () => {
    const days = getUpcomingDays(new Date(2026, 0, 10)) // Saturday
    expect(days).toHaveLength(7)
    expect(isSameLocalDay(days[0], new Date(2026, 0, 10))).toBe(true)
    expect(isSameLocalDay(days[6], new Date(2026, 0, 16))).toBe(true)
  })
})

describe('bucketChoresByDay (rolling window)', () => {
  const days = getUpcomingDays(new Date(2026, 0, 7)) // Wed Jan 7 .. Tue Jan 13

  it('leaves a past-due chore on its own (now hidden) day instead of piling onto today', () => {
    const buckets = bucketChoresByDay([chore({ dueAtUtc: '2026-01-02T14:00:00Z' })], days)
    expect(buckets.every((b) => b.length === 0)).toBe(true)
  })

  it('shows a daily chore on every visible day from its due date', () => {
    const buckets = bucketChoresByDay([chore({ recurrence: 'daily', dueAtUtc: '2026-01-08T14:00:00Z' })], days)
    expect(buckets.map((b) => b.length)).toEqual([0, 1, 1, 1, 1, 1, 1])
    expect(buckets[1][0].isProjection).toBe(false)
    expect(buckets[2][0].isProjection).toBe(true)
  })

  it('shows a weekly chore only on its weekday, including a later repeat inside the window', () => {
    const wideDays = getUpcomingDays(new Date(2026, 0, 7), 14)
    const buckets = bucketChoresByDay([chore({ recurrence: 'weekly', dueAtUtc: '2026-01-07T14:00:00Z' })], wideDays)
    const hit = buckets.map((b, i) => (b.length ? i : -1)).filter((i) => i !== -1)
    expect(hit).toEqual([0, 7])
  })

  it('does not repeat completed entries', () => {
    const buckets = bucketChoresByDay([chore({ recurrence: 'daily', isComplete: true, dueAtUtc: '2026-01-07T14:00:00Z' })], days)
    expect(buckets.map((b) => b.length)).toEqual([1, 0, 0, 0, 0, 0, 0])
  })
})

describe('all-day bars', () => {
  const days = getUpcomingDays(new Date(2026, 0, 6))
  const multiDay = event({ id: 'multi', startsAtUtc: '2026-01-06T00:00:00Z', endsAtUtc: '2026-01-09T00:00:00Z' })

  it('turns a multi-day all-day event into one bar spanning its days', () => {
    const bars = getAllDayBars([multiDay], days)
    expect(bars).toHaveLength(1)
    expect([bars[0].startIndex, bars[0].endIndex]).toEqual([0, 2])
  })

  it('ignores timed events', () => {
    expect(getAllDayBars([event()], days)).toHaveLength(0)
  })

  it('stacks overlapping bars in separate lanes and shares a lane when they do not overlap', () => {
    const other = event({ id: 'other', startsAtUtc: '2026-01-07T00:00:00Z', endsAtUtc: '2026-01-08T00:00:00Z' })
    const later = event({ id: 'later', startsAtUtc: '2026-01-10T00:00:00Z', endsAtUtc: '2026-01-11T00:00:00Z' })
    const lanes = packAllDayLanes(getAllDayBars([multiDay, other, later], days))
    expect(lanes).toHaveLength(2)
    expect(lanes[0].map((b) => b.event.id)).toEqual(['multi', 'later'])
    expect(lanes[1].map((b) => b.event.id)).toEqual(['other'])
  })
})
