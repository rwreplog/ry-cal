// Per-widget accent colors, used only by the "family" theme (see index.css) — the
// CSS custom properties these arbitrary values reference are undefined under every
// other theme, so `bg-card`/`text-card-foreground` (the CSS var fallback) is what
// actually renders there. Adding a widget here is opt-in per theme, not required.
//
// Class strings must be fully spelled out (not built via template-literal
// interpolation) — Tailwind's build-time content scanner only generates CSS for
// arbitrary-value classes it can see as literal text in the source. A dynamically
// interpolated `bg-[var(--widget-${type}-bg,...)]` is invisible to it, so no CSS
// rule gets generated, while tailwind-merge still (correctly, per its own logic)
// drops the earlier bg-card class it appears to conflict with — net result:
// no background at all.
export type AccentableWidget =
  | 'clock'
  | 'chores'
  | 'weather'
  | 'announcements'
  | 'meals'
  | 'shopping'
  | 'birthdays'
  | 'countdowns'

const WIDGET_ACCENT_CLASSES: Record<AccentableWidget, string> = {
  clock: 'bg-[var(--widget-clock-bg,var(--card))] text-[var(--widget-clock-fg,var(--card-foreground))]',
  chores: 'bg-[var(--widget-chores-bg,var(--card))] text-[var(--widget-chores-fg,var(--card-foreground))]',
  weather: 'bg-[var(--widget-weather-bg,var(--card))] text-[var(--widget-weather-fg,var(--card-foreground))]',
  announcements:
    'bg-[var(--widget-announcements-bg,var(--card))] text-[var(--widget-announcements-fg,var(--card-foreground))]',
  meals: 'bg-[var(--widget-meals-bg,var(--card))] text-[var(--widget-meals-fg,var(--card-foreground))]',
  shopping: 'bg-[var(--widget-shopping-bg,var(--card))] text-[var(--widget-shopping-fg,var(--card-foreground))]',
  birthdays: 'bg-[var(--widget-birthdays-bg,var(--card))] text-[var(--widget-birthdays-fg,var(--card-foreground))]',
  countdowns:
    'bg-[var(--widget-countdowns-bg,var(--card))] text-[var(--widget-countdowns-fg,var(--card-foreground))]',
}

export function widgetAccentClasses(type: AccentableWidget): string {
  return WIDGET_ACCENT_CLASSES[type]
}
