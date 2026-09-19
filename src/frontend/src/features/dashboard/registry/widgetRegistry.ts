import type { DashboardWidgetDefinition } from '@/types/widget'

const registry = new Map<string, DashboardWidgetDefinition>()

export function registerWidget(definition: DashboardWidgetDefinition): void {
  registry.set(definition.type, definition)
}

export function getWidget(type: string): DashboardWidgetDefinition | undefined {
  return registry.get(type)
}

export function getAllWidgets(): DashboardWidgetDefinition[] {
  return Array.from(registry.values())
}
