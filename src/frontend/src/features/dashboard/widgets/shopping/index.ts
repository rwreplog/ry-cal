import { ShoppingCart } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { ShoppingListWidget } from './ShoppingListWidget'

registerWidget({
  type: 'shopping',
  name: 'Shopping List',
  description: 'Items still needed',
  icon: ShoppingCart,
  component: ShoppingListWidget,
})
