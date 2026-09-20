import { describe, expect, it } from 'vitest'
import type { CalendarEventDto } from '@/types/dashboard'
import { bucketEventsByDay, formatEventTime, getWeekDays, isAllDayEvent, isSameLocalDay } from './weekUtils'

function event(overrides: Partial<CalendarEventDto> = {}): CalendarEventDto {
  return {
    id: 'evt-1',
    title: 'Test event',
    startsAtUtc: '2026-01-06T14:00:00Z', // Tuesday
    endsAtUtc: '2026-01-06T15:00:00Z',
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
      [event({ startsAtUtc: '2026-01-05T00:00:00', endsAtUtc: '2026-01-09T00:00:00' })],
      weekDays,
    )
    expect(buckets.map((b) => b.length)).toEqual([0, 1, 1, 1, 1, 0, 0]) // Sun..Sat
  })

  it('does not include the exclusive end day of a multi-day all-day event', () => {
    const buckets = bucketEventsByDay(
      [event({ startsAtUtc: '2026-01-05T00:00:00', endsAtUtc: '2026-01-09T00:00:00' })],
      weekDays,
    )
    expect(buckets[5]).toHaveLength(0) // Friday Jan 9 — the exclusive end, not covered
  })
})

describe('isAllDayEvent', () => {
  it('is true for a local-midnight event spanning roughly a full day', () => {
    expect(isAllDayEvent(event({ startsAtUtc: '2026-01-06T00:00:00', endsAtUtc: '2026-01-07T00:00:00' }))).toBe(true)
  })

  it('is false for a normal timed event', () => {
    expect(isAllDayEvent(event({ startsAtUtc: '2026-01-06T09:00:00', endsAtUtc: '2026-01-06T10:00:00' }))).toBe(false)
  })
})

describe('formatEventTime', () => {
  it('renders "All day" for an all-day event', () => {
    expect(formatEventTime(event({ startsAtUtc: '2026-01-06T00:00:00', endsAtUtc: '2026-01-07T00:00:00' }))).toBe('All day')
  })

  it('renders a start–end time range for a timed event', () => {
    const result = formatEventTime(event({ startsAtUtc: '2026-01-06T09:00:00', endsAtUtc: '2026-01-06T09:30:00' }))
    expect(result).toContain('–')
    expect(result).not.toBe('All day')
  })
})
