import { useEffect, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { useDashboardConfigMutations } from '@/features/dashboard/hooks/useDashboardConfigMutations'
import { getWidget } from '@/features/dashboard/registry/widgetRegistry'
import { AUTO_SEASONAL_THEME_ID, SEASONAL_THEMES, THEMES, getEffectiveTheme, seasonalThemeLabel } from '@/features/theme/constants'
import { usePreviewTheme } from '@/features/theme/PreviewThemeContext'
import { cn } from '@/lib/utils'
import type { CalendarView, DashboardLayout, DashboardWidgetConfigDto } from '@/types/dashboard'
import { LocationSettings } from './LocationSettings'

const SIZE_LABEL: Record<DashboardWidgetConfigDto['size'], string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
}

const CALENDAR_VIEW_LABEL: Record<CalendarView, string> = {
  week: 'Sunday – Saturday week',
  rolling: 'Next 7 days (starts today)',
}

const DASHBOARD_LAYOUT_LABEL: Record<DashboardLayout, string> = {
  stacked: 'Stacked (calendar on top, widgets below)',
  sidebar: 'Sidebar (calendar fills the right side)',
}

const SIZES: DashboardWidgetConfigDto['size'][] = ['sm', 'md', 'lg']

// Matches WidgetGrid's FULL_WIDTH_WIDGET_TYPES — the calendar widget's weekly
// grid always takes the full row, so its size picker would be misleading here.
const FULL_WIDTH_WIDGET_TYPES = new Set(['calendar'])

// Extracted from the DndContext's onDragEnd so the reorder logic itself — as
// opposed to dnd-kit's pointer/keyboard geometry, which needs a real layout to
// resolve — can be unit tested directly.
export function reorderWidgets(
  widgets: DashboardWidgetConfigDto[],
  activeType: string,
  overType: string,
): DashboardWidgetConfigDto[] {
  if (activeType === overType) return widgets
  const oldIndex = widgets.findIndex((w) => w.type === activeType)
  const newIndex = widgets.findIndex((w) => w.type === overType)
  if (oldIndex === -1 || newIndex === -1) return widgets
  return arrayMove(widgets, oldIndex, newIndex)
}

export function DashboardSettingsPage() {
  const { data, isLoading } = useDashboardConfig()
  const { update } = useDashboardConfigMutations()
  const { previewThemeId, setPreviewThemeId } = usePreviewTheme()

  // Seeded once from the server (staleTime: Infinity on useDashboardConfig means
  // this effect never fires again from a background refetch, so it can't clobber
  // in-progress drag/toggle/size edits).
  const [widgets, setWidgets] = useState<DashboardWidgetConfigDto[]>([])
  const [theme, setTheme] = useState('')
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>('stacked')
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    if (data && !seeded) {
      setWidgets(data.widgets)
      setTheme(data.theme)
      setCalendarView(data.calendarView)
      setDashboardLayout(data.dashboardLayout)
      setSeeded(true)
    }
  }, [data, seeded])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    setWidgets((current) => reorderWidgets(current, String(active.id), String(over.id)))
  }

  const toggleVisible = (type: string) => {
    setWidgets((current) => current.map((w) => (w.type === type ? { ...w, isVisible: !w.isVisible } : w)))
  }

  const changeSize = (type: string, size: DashboardWidgetConfigDto['size']) => {
    setWidgets((current) => current.map((w) => (w.type === type ? { ...w, size } : w)))
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setPreviewThemeId(null) // a real selection wins over a leftover preview
    // Instant preview, no reload — resolved the same way ThemeProvider resolves it
    // on every other page, so picking "Auto (Seasonal)" previews today's actual
    // holiday palette rather than literally applying the unstyled "auto" id.
    document.documentElement.dataset.theme = getEffectiveTheme(newTheme)
    update.mutate({ widgets, theme: newTheme, calendarView, dashboardLayout })
  }

  const handleCalendarViewChange = (view: CalendarView) => {
    setCalendarView(view)
    update.mutate({ widgets, theme, calendarView: view, dashboardLayout })
  }

  const handleDashboardLayoutChange = (layout: DashboardLayout) => {
    setDashboardLayout(layout)
    update.mutate({ widgets, theme, calendarView, dashboardLayout: layout })
  }

  const handleSave = () => {
    update.mutate({ widgets, theme, calendarView, dashboardLayout })
  }

  if (isLoading || !seeded) {
    return <p className="text-muted-foreground text-sm">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <LocationSettings />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Theme</h2>
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger aria-label="Theme" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {theme === AUTO_SEASONAL_THEME_ID && (
          <p className="text-muted-foreground text-sm">Showing {seasonalThemeLabel(getEffectiveTheme(theme))} today.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Calendar view</h2>
        <Select value={calendarView} onValueChange={(v) => handleCalendarViewChange(v as CalendarView)}>
          <SelectTrigger aria-label="Calendar view" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CALENDAR_VIEW_LABEL) as CalendarView[]).map((view) => (
              <SelectItem key={view} value={view}>
                {CALENDAR_VIEW_LABEL[view]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Dashboard layout</h2>
        <p className="text-muted-foreground text-sm">
          Sidebar suits a wide, landscape screen — the calendar fills the full height on the right and everything
          else (including the clock) lines up in a rail on the left. It falls back to Stacked on a narrower screen.
        </p>
        <Select value={dashboardLayout} onValueChange={(v) => handleDashboardLayoutChange(v as DashboardLayout)}>
          <SelectTrigger aria-label="Dashboard layout" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DASHBOARD_LAYOUT_LABEL) as DashboardLayout[]).map((layout) => (
              <SelectItem key={layout} value={layout}>
                {DASHBOARD_LAYOUT_LABEL[layout]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Preview a season or holiday</h2>
        <p className="text-muted-foreground text-sm">
          See what any of Auto&apos;s palettes looks like right now, without waiting for the date. This is just a look —
          it doesn&apos;t change or save your actual theme. It stays on as you look around, including on the dashboard
          itself — a banner will let you stop it from anywhere.
        </p>
        <div className="flex gap-2">
          <Select value={previewThemeId ?? undefined} onValueChange={setPreviewThemeId}>
            <SelectTrigger aria-label="Preview a season or holiday" className="w-full">
              <SelectValue placeholder="Choose one to preview" />
            </SelectTrigger>
            <SelectContent>
              {SEASONAL_THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {previewThemeId && (
            <Button type="button" variant="outline" onClick={() => setPreviewThemeId(null)}>
              Stop previewing
            </Button>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Widgets</h2>
        <p className="text-muted-foreground text-sm">Drag to reorder, toggle to show or hide.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map((w) => w.type)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {widgets.map((widget) => (
                <WidgetRow
                  key={widget.type}
                  widget={widget}
                  onToggleVisible={() => toggleVisible(widget.type)}
                  onChangeSize={(size) => changeSize(widget.type, size)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Sticky just above AdminLayout's fixed bottom nav (which reserves 5rem via
          pb-20 on the page shell) — with 7+ widgets in the list above, this used to
          require scrolling all the way down to find after making a change. */}
      <div className="bg-background sticky bottom-20 -mx-4 border-t px-4 py-3">
        <Button onClick={handleSave} disabled={update.isPending} className="w-full">
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}

interface WidgetRowProps {
  widget: DashboardWidgetConfigDto
  onToggleVisible: () => void
  onChangeSize: (size: DashboardWidgetConfigDto['size']) => void
}

function WidgetRow({ widget, onToggleVisible, onChangeSize }: WidgetRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.type })
  const definition = getWidget(widget.type)
  const label = definition?.name ?? widget.type
  const Icon = definition?.icon

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center gap-3 rounded-2xl border p-3', isDragging && 'opacity-50')}
    >
      <button
        type="button"
        className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      {Icon && <Icon className="text-muted-foreground size-5" />}

      <span className="flex-1 font-medium">{label}</span>

      {FULL_WIDTH_WIDGET_TYPES.has(widget.type) ? (
        <span className="text-muted-foreground text-xs">Full width</span>
      ) : (
        <Select value={widget.size} onValueChange={(value) => onChangeSize(value as DashboardWidgetConfigDto['size'])}>
          <SelectTrigger size="sm" aria-label={`${label} size`}>
            <SelectValue>{SIZE_LABEL[widget.size]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {SIZE_LABEL[size]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Switch checked={widget.isVisible} onCheckedChange={onToggleVisible} aria-label={`Show ${label}`} />
    </div>
  )
}
