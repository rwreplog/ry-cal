import { describe, expect, it } from 'vitest'
import { computeEasterSunday, getHolidayToday, resolveSeasonalTheme } from './seasonalTheme'

describe('computeEasterSunday', () => {
  // Well-known published Easter Sunday dates, spanning both March and April
  // outcomes, used to sanity-check the Meeus/Jones/Butcher implementation.
  it.each([
    [2023, 3, 9],
    [2024, 2, 31], // March 31 (month is 0-indexed)
    [2025, 3, 20],
    [2026, 3, 5],
    [2027, 2, 28],
  ])('computes %i Easter as %i/%i', (year, month, day) => {
    const easter = computeEasterSunday(year)
    expect(easter.getMonth()).toBe(month)
    expect(easter.getDate()).toBe(day)
  })
})

describe('resolveSeasonalTheme', () => {
  it.each([
    [new Date(2026, 0, 15), 'seasonal-winter'],
    [new Date(2026, 1, 1), 'seasonal-valentines'],
    [new Date(2026, 1, 14), 'seasonal-valentines'],
    [new Date(2026, 5, 15), 'seasonal-summer'],
    [new Date(2026, 6, 4), 'seasonal-fourth-of-july'],
    [new Date(2026, 7, 15), 'seasonal-summer'],
    [new Date(2026, 8, 15), 'seasonal-fall'],
    [new Date(2026, 9, 31), 'seasonal-halloween'],
    [new Date(2026, 10, 26), 'seasonal-thanksgiving'],
    [new Date(2026, 11, 25), 'seasonal-christmas'],
  ])('resolves %s to %s', (date, expected) => {
    expect(resolveSeasonalTheme(date)).toBe(expected)
  })

  it('resolves St Patrick\'s Day to the St Patrick\'s theme when it falls outside the Easter window', () => {
    // Easter 2026 is April 5, so its window (Mar 26 - Apr 6) doesn't reach St
    // Patrick's Day (Mar 17) at all this year.
    expect(resolveSeasonalTheme(new Date(2026, 2, 17))).toBe('seasonal-st-patricks')
  })

  it('resolves dates within the Easter window to the Easter theme, overriding the month default', () => {
    // Easter 2026 is April 5 — the day itself, and a day inside its ~10-day
    // lead-up window, should both resolve to Easter regardless of month default.
    expect(resolveSeasonalTheme(new Date(2026, 3, 5))).toBe('seasonal-easter')
    expect(resolveSeasonalTheme(new Date(2026, 2, 28))).toBe('seasonal-easter')
  })

  it('resolves the day after the Easter window back to the month default', () => {
    // Easter 2026 window ends Easter Monday, April 6 — April 7 falls back to Spring.
    expect(resolveSeasonalTheme(new Date(2026, 3, 7))).toBe('seasonal-spring')
  })

  it('resolves a year where Easter falls in March to Easter within its window and St Patrick\'s outside it', () => {
    // Easter 2024 is March 31 — window is roughly March 21 - April 1.
    expect(resolveSeasonalTheme(new Date(2024, 2, 17))).toBe('seasonal-st-patricks') // St Patrick's Day itself
    expect(resolveSeasonalTheme(new Date(2024, 2, 31))).toBe('seasonal-easter') // Easter Sunday
    expect(resolveSeasonalTheme(new Date(2024, 3, 1))).toBe('seasonal-easter') // Easter Monday
    expect(resolveSeasonalTheme(new Date(2024, 3, 2))).toBe('seasonal-spring') // back to the month default
  })
})

describe('getHolidayToday', () => {
  it.each([
    [new Date(2026, 1, 14), 'valentines'],
    [new Date(2026, 2, 17), 'st-patricks'],
    [new Date(2026, 3, 5), 'easter'], // Easter Sunday 2026
    [new Date(2026, 6, 4), 'fourth-of-july'],
    [new Date(2026, 9, 31), 'halloween'],
    [new Date(2026, 10, 26), 'thanksgiving'], // 4th Thursday of November 2026, verified by hand
    [new Date(2026, 11, 25), 'christmas'],
  ])('recognizes %s as %s', (date, expected) => {
    expect(getHolidayToday(date)).toBe(expected)
  })

  it('returns null for an ordinary day, including one within a holiday\'s themed month', () => {
    expect(getHolidayToday(new Date(2026, 9, 15))).toBeNull() // mid-October, not Halloween itself
    expect(getHolidayToday(new Date(2026, 11, 10))).toBeNull() // mid-December, not Christmas itself
  })

  it('does not recognize a day right next to Thanksgiving as Thanksgiving itself', () => {
    expect(getHolidayToday(new Date(2026, 10, 25))).toBeNull()
    expect(getHolidayToday(new Date(2026, 10, 27))).toBeNull()
  })
})
