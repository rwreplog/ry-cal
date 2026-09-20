import { UtensilsCrossed } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { MealsWidget } from './MealsWidget'

registerWidget({
  type: 'meals',
  name: 'Meal Plan',
  description: "This week's planned meals",
  icon: UtensilsCrossed,
  component: MealsWidget,
})
