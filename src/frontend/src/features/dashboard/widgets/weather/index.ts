import { CloudSun } from 'lucide-react'
import { registerWidget } from '@/features/dashboard/registry/widgetRegistry'
import { WeatherWidget } from './WeatherWidget'

registerWidget({
  type: 'weather',
  name: 'Weather',
  description: 'Current conditions and forecast',
  icon: CloudSun,
  component: WeatherWidget,
})
