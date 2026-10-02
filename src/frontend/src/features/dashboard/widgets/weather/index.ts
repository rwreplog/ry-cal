import { CloudSun } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { WeatherWidget } from './WeatherWidget'

registerWidget({
  type: 'weather',
  name: 'Weather',
  description: 'Current conditions and today\'s high/low',
  icon: CloudSun,
  component: WeatherWidget,
})
