// No per-event family-member data exists yet (Google/ICS sync doesn't know who an
// event belongs to), so each weekday column gets its own fixed accent color instead
// — still gives the grid the colorful, at-a-glance organization of the reference
// design without inventing data the app doesn't have.
export interface WeekdayColor {
  header: string
  todayBadge: string
  chip: string
}

// Index 0 = Sunday .. 6 = Saturday, matching getWeekDays().
export const WEEKDAY_COLORS: WeekdayColor[] = [
  { header: 'text-rose-700 dark:text-rose-300', todayBadge: 'bg-rose-500 text-white', chip: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-100' },
  { header: 'text-amber-700 dark:text-amber-300', todayBadge: 'bg-amber-500 text-white', chip: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-100' },
  { header: 'text-emerald-700 dark:text-emerald-300', todayBadge: 'bg-emerald-500 text-white', chip: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-100' },
  { header: 'text-sky-700 dark:text-sky-300', todayBadge: 'bg-sky-500 text-white', chip: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-100' },
  { header: 'text-violet-700 dark:text-violet-300', todayBadge: 'bg-violet-500 text-white', chip: 'bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-900 dark:text-violet-100' },
  { header: 'text-pink-700 dark:text-pink-300', todayBadge: 'bg-pink-500 text-white', chip: 'bg-pink-50 border-pink-200 text-pink-900 dark:bg-pink-950/40 dark:border-pink-900 dark:text-pink-100' },
  { header: 'text-teal-700 dark:text-teal-300', todayBadge: 'bg-teal-500 text-white', chip: 'bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/40 dark:border-teal-900 dark:text-teal-100' },
]
