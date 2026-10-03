import type { RecurrenceType } from './chores'

export interface WidgetInstanceDto {
  type: string
  order: number
  size: 'sm' | 'md' | 'lg'
}

export interface CalendarEventDto {
  id: string
  title: string
  startsAtUtc: string
  endsAtUtc: string
  location?: string
}

export interface ChoreSummaryDto {
  // Per-occurrence-unique (a 'weekdays' chore emits several rows a week sharing
  // one choreId) — choreId is what gets sent back to complete/assign.
  id: string
  choreId: string
  title: string
  assignedTo: string
  assignedToFamilyMemberId: string | null
  assignedToColor: string | null
  dueAtUtc: string
  isComplete: boolean
  recurrence: RecurrenceType
}

export interface WeatherSnapshotDto {
  temperatureF: number
  condition: string
  highF: number
  lowF: number
  inclementWeatherExpected: boolean
  forecastCondition: string
}

export interface AnnouncementDto {
  id: string
  message: string
  postedAtUtc: string
  postedBy: string
}

export interface MealPlanSummaryDto {
  id: string
  date: string
  name: string
  description: string | null
}

export interface ShoppingListItemSummaryDto {
  id: string
  name: string
}

export interface UpcomingBirthdayDto {
  id: string
  name: string
  date: string
  daysUntil: number
}

export interface CountdownSummaryDto {
  id: string
  label: string
  targetDate: string
  daysUntil: number
}

export interface DashboardDto {
  generatedAtUtc: string
  layout: WidgetInstanceDto[]
  calendar: { events: CalendarEventDto[] }
  chores: { items: ChoreSummaryDto[] }
  weather: { current: WeatherSnapshotDto | null }
  announcements: { items: AnnouncementDto[] }
  meals: { items: MealPlanSummaryDto[] }
  shoppingList: { items: ShoppingListItemSummaryDto[]; totalUncheckedCount: number }
  birthdays: { items: UpcomingBirthdayDto[] }
  countdowns: { items: CountdownSummaryDto[] }
}

export interface DashboardWidgetConfigDto {
  type: string
  size: 'sm' | 'md' | 'lg'
  isVisible: boolean
}

export type CalendarView = 'week' | 'rolling'
export type DashboardLayout = 'stacked' | 'sidebar'

export interface DashboardConfigDto {
  widgets: DashboardWidgetConfigDto[]
  theme: string
  calendarView: CalendarView
  dashboardLayout: DashboardLayout
}

export type UpdateDashboardWidgetRequest = DashboardWidgetConfigDto

export interface UpdateDashboardConfigRequest {
  widgets: UpdateDashboardWidgetRequest[]
  theme: string
  calendarView?: CalendarView
  dashboardLayout?: DashboardLayout
}

export interface HouseholdLocationDto {
  latitude: number | null
  longitude: number | null
  locationLabel: string | null
}

export interface UpdateHouseholdLocationRequest {
  latitude: number
  longitude: number
  locationLabel: string | null
}

export interface GeocodingResultDto {
  name: string
  latitude: number
  longitude: number
  admin1: string | null
  country: string
}
