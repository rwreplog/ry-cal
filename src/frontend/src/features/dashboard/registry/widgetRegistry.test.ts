import { describe, expect, it } from 'vitest'
import type { DashboardWidgetDefinition } from '@/types/widget'
import { getAllWidgets, getWidget, registerWidget } from './widgetRegistry'

function TestComponent() {
  return null
}

const definition: DashboardWidgetDefinition = {
  type: 'test-widget',
  name: 'Test Widget',
  description: 'A widget used only in tests',
  icon: TestComponent,
  component: TestComponent,
}

describe('widgetRegistry', () => {
  it('returns undefined for an unregistered widget type', () => {
    expect(getWidget('does-not-exist')).toBeUndefined()
  })

  it('registers a widget and makes it retrievable by type', () => {
    registerWidget(definition)

    expect(getWidget('test-widget')).toBe(definition)
    expect(getAllWidgets()).toContainEqual(definition)
  })
})
