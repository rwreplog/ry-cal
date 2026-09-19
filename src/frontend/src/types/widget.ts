import type { ComponentType } from 'react'

export interface WidgetComponentProps {
  settings?: Record<string, unknown>
}

export interface DashboardWidgetDefinition {
  type: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }>
  component: ComponentType<WidgetComponentProps>
  settingsComponent?: ComponentType<WidgetComponentProps>
}
