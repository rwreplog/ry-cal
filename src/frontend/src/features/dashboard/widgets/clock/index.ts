import { Clock } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { ClockWidget } from './ClockWidget'

registerWidget({
  type: 'clock',
  name: 'Clock',
  description: 'Current time and date',
  icon: Clock,
  component: ClockWidget,
})
