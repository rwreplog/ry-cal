import { Hourglass } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { CountdownsWidget } from './CountdownsWidget'

registerWidget({
  type: 'countdowns',
  name: 'Countdowns',
  description: 'Days until upcoming events',
  icon: Hourglass,
  component: CountdownsWidget,
})
