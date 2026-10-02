import { useClock } from '@/features/dashboard/hooks/useClock'

// Always-visible page-header strip — not a toggleable widget. It ticks
// independently of the dashboard fetch so time never blocks on it. Weather used to
// live here too; it's now its own toggleable/resizable widget like everything
// else, since the clock is the only one of the two docs/UI.md's "readable at 10
// feet" checklist actually requires to always be visible.
//
// Date uses a short format (weekday/month abbreviated) deliberately — this sits in
// the header's narrow middle column, and the long form ("Monday, September 21")
// was wide enough to wrap onto a second line on its own.
interface HeaderClockProps {
  // "large" is the sidebar dashboard layout's hero treatment — the clock is the
  // one thing docs/UI.md requires to always be visible, so it gets to be the most
  // prominent thing in that rail rather than just another small text block.
  size?: 'default' | 'large'
}

// "large" picks up the theme's accent color and goes bold — "default" (the
// stacked layout's top strip) keeps its original plain treatment unchanged.
const TIME_CLASS = { default: 'text-3xl font-semibold', large: 'text-6xl text-primary font-bold' }
const DATE_CLASS = { default: 'text-sm', large: 'text-base font-medium' }

export function HeaderClock({ size = 'default' }: HeaderClockProps) {
  const now = useClock()

  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  // Split on the colon so it alone can blink (a CSS animation, decoupled from this
  // per-second re-render) — a small "alive" touch rather than static digits.
  const [timeHours, timeMinutes] = time.split(':')

  return (
    <div className={size === 'large' ? 'text-left' : 'text-center'}>
      <p className={`${TIME_CLASS[size]} leading-tight tracking-tight tabular-nums`}>
        {timeHours}
        <span className="clock-colon">:</span>
        {timeMinutes}
      </p>
      <p className={`text-muted-foreground ${DATE_CLASS[size]} leading-tight whitespace-nowrap`}>{date}</p>
    </div>
  )
}
