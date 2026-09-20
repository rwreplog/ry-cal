import { Cake } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { BirthdaysWidget } from './BirthdaysWidget'

registerWidget({
  type: 'birthdays',
  name: 'Birthdays',
  description: 'Upcoming birthdays',
  icon: Cake,
  component: BirthdaysWidget,
})
