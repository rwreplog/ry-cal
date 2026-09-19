import { getWidget } from '@/features/dashboard/registry/widgetRegistry'
import type { WidgetInstanceDto } from '@/types/dashboard'
import { DashboardEmpty } from './DashboardEmpty'

const sizeClasses: Record<WidgetInstanceDto['size'], string> = {
  sm: 'xl:col-span-1',
  md: 'sm:col-span-2 xl:col-span-1',
  lg: 'sm:col-span-2 xl:col-span-2',
}

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
        return (
          <div key={instance.type} className={sizeClasses[instance.size]}>
            <WidgetComponent />
          </div>
        )
      })}
    </div>
  )
}
