import { getWidget } from '@/features/dashboard/registry/widgetRegistry'
import type { WidgetInstanceDto } from '@/types/dashboard'
import { DashboardEmpty } from './DashboardEmpty'

const sizeClasses: Record<WidgetInstanceDto['size'], string> = {
  sm: 'xl:col-span-1',
  md: 'sm:col-span-2 xl:col-span-1',
  lg: 'sm:col-span-2 xl:col-span-2',
}

// The calendar widget is a 7-column weekly grid — it needs the full row to be
// legible and ignores its configured size, unlike every other widget. It's also
// the densest widget on the dashboard (multiple stacked sections per day plus a
// legend), so it gets a bit of extra bottom margin on top of the grid's normal
// gap-6, giving it more breathing room from whatever row follows than the uniform
// gap every other widget pair gets.
const FULL_WIDTH_WIDGET_TYPES = new Set(['calendar'])
const FULL_WIDTH_CLASS = 'sm:col-span-2 xl:col-span-3 mb-2'

interface WidgetGridProps {
  layout: WidgetInstanceDto[]
}

export function WidgetGrid({ layout }: WidgetGridProps) {
  const instances = [...layout].sort((a, b) => a.order - b.order)

  if (instances.length === 0) {
    return <DashboardEmpty />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {instances.map((instance) => {
        const definition = getWidget(instance.type)
        if (!definition) return null

        const WidgetComponent = definition.component
        const className = FULL_WIDTH_WIDGET_TYPES.has(instance.type) ? FULL_WIDTH_CLASS : sizeClasses[instance.size]
        return (
          <div key={instance.type} className={className}>
            <WidgetComponent />
          </div>
        )
      })}
    </div>
  )
}
