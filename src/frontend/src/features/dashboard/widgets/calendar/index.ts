import { CalendarDays } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { CalendarWidget } from './CalendarWidget'

registerWidget({
  type: 'calendar',
  name: 'Calendar',
  description: 'Upcoming family events',
  icon: CalendarDays,
  component: CalendarWidget,
})
