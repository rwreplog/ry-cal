// Resolves "Auto (Seasonal)" mode to a concrete, renderable theme id based on
// today's date. Every month gets a look: the seven major U.S. holidays the
// household asked for each theme their whole month, and the months without one of
// those get a generic seasonal palette instead of falling back to plain Modern.
// Easter is the one movable holiday — rather than claiming a whole month (which
// would sometimes swallow St Patrick's Day entirely, since Easter can fall in
// March), it gets a ~10-day window ending the day after Easter Sunday, and the
// fixed month-based mapping applies outside that window.
export function resolveSeasonalTheme(date: Date): string {
  if (isWithinEasterWindow(date)) {
    return 'seasonal-easter'
  }

  switch (date.getMonth()) {
    case 0: // January — after the holidays, before anything else starts
      return 'seasonal-winter'
    case 1:
      return 'seasonal-valentines'
    case 2:
      return 'seasonal-st-patricks'
    case 3:
    case 4:
      return 'seasonal-spring'
    case 5:
    case 7: // June, August — July itself is claimed by the 4th
      return 'seasonal-summer'
    case 6:
      return 'seasonal-fourth-of-july'
    case 8: // September — early autumn, before Halloween's own look
      return 'seasonal-fall'
    case 9:
      return 'seasonal-halloween'
    case 10:
      return 'seasonal-thanksgiving'
    case 11:
      return 'seasonal-christmas'
    default:
      return 'modern'
  }
}

const EASTER_WINDOW_LEAD_DAYS = 10

function isWithinEasterWindow(date: Date): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const easter = computeEasterSunday(day.getFullYear())

  const windowStart = new Date(easter)
  windowStart.setDate(windowStart.getDate() - EASTER_WINDOW_LEAD_DAYS)

  const windowEnd = new Date(easter)
  windowEnd.setDate(windowEnd.getDate() + 1) // through Easter Monday

  return day.getTime() >= windowStart.getTime() && day.getTime() <= windowEnd.getTime()
}

export type HolidayId = 'valentines' | 'st-patricks' | 'easter' | 'fourth-of-july' | 'halloween' | 'thanksgiving' | 'christmas'

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// The exact calendar date of Thanksgiving: the 4th Thursday of November.
export function computeThanksgiving(year: number): Date {
  const nov1 = new Date(year, 10, 1)
  const THURSDAY = 4
  const daysToFirstThursday = (THURSDAY - nov1.getDay() + 7) % 7
  const firstThursday = 1 + daysToFirstThursday
  return new Date(year, 10, firstThursday + 21) // +3 weeks
}

// Unlike resolveSeasonalTheme's month-long (or Easter's ~10-day) windows, this only
// matches the exact calendar date of each holiday — used to layer a one-day
// animated flourish (HolidayAnimationOverlay) on top of the month's theme, not to
// pick the theme itself.
export function getHolidayToday(date: Date): HolidayId | null {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const month = day.getMonth()
  const dayOfMonth = day.getDate()

  if (isSameCalendarDay(day, computeEasterSunday(day.getFullYear()))) return 'easter'
  if (month === 1 && dayOfMonth === 14) return 'valentines'
  if (month === 2 && dayOfMonth === 17) return 'st-patricks'
  if (month === 6 && dayOfMonth === 4) return 'fourth-of-july'
  if (month === 9 && dayOfMonth === 31) return 'halloween'
  if (month === 10 && isSameCalendarDay(day, computeThanksgiving(day.getFullYear()))) return 'thanksgiving'
  if (month === 11 && dayOfMonth === 25) return 'christmas'

  return null
}

// Which of the 7 exact-day holidays (if any) a seasonal theme id represents — a
// direct, date-independent mapping, deliberately not derived from a "preview date"
// run back through getHolidayToday: a fixed preview date picked to land in, say,
// St Patrick's Day's month could accidentally fall inside a given year's Easter
// window (Easter's practical range reaches into mid-to-late March), silently
// showing Easter's animation while claiming to preview St Patrick's. This mapping
// can't drift out of sync with what it's naming. Backs DashboardSettingsPage's
// preview picker together with SEASONAL_THEMES (features/theme/constants.ts) for
// the palette half and this for the "does it also get particles" half.
const SEASONAL_THEME_HOLIDAYS: Partial<Record<string, HolidayId>> = {
  'seasonal-valentines': 'valentines',
  'seasonal-st-patricks': 'st-patricks',
  'seasonal-easter': 'easter',
  'seasonal-fourth-of-july': 'fourth-of-july',
  'seasonal-halloween': 'halloween',
  'seasonal-thanksgiving': 'thanksgiving',
  'seasonal-christmas': 'christmas',
}

export function holidayForSeasonalTheme(seasonalThemeId: string): HolidayId | null {
  return SEASONAL_THEME_HOLIDAYS[seasonalThemeId] ?? null
}

// Meeus/Jones/Butcher Gregorian algorithm for the date of Easter Sunday — the
// standard closed-form calculation, valid for any Gregorian-calendar year.
export function computeEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}
