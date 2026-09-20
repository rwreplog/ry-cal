import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card className={widgetAccentClasses('clock')}>
      <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
        <span className="text-6xl font-semibold tracking-tight tabular-nums">{time}</span>
        <span className="text-muted-foreground text-xl">{date}</span>
      </CardContent>
    </Card>
  )
}
