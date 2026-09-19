import { ListChecks } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { ChoresWidget } from './ChoresWidget'

registerWidget({
  type: 'chores',
  name: 'Chores',
  description: "Today's chore status",
  icon: ListChecks,
  component: ChoresWidget,
})
