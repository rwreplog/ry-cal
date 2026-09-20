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
  id: string
  title: string
  assignedTo: string
  assignedToFamilyMemberId: string | null
  dueAtUtc: string
  isComplete: boolean
}

export interface WeatherSnapshotDto {
  temperatureF: number
  condition: string
  highF: number
  lowF: number
}

export interface AnnouncementDto {
  id: string
  message: string
  postedAtUtc: string
  postedBy: string
}

export interface DashboardDto {
  generatedAtUtc: string
  layout: WidgetInstanceDto[]
  calendar: { events: CalendarEventDto[] }
  chores: { items: ChoreSummaryDto[] }
  weather: { current: WeatherSnapshotDto }
  announcements: { items: AnnouncementDto[] }
}

export interface DashboardWidgetConfigDto {
  type: string
  size: 'sm' | 'md' | 'lg'
  isVisible: boolean
}

export interface DashboardConfigDto {
  widgets: DashboardWidgetConfigDto[]
  theme: string
}

export type UpdateDashboardWidgetRequest = DashboardWidgetConfigDto

export interface UpdateDashboardConfigRequest {
  widgets: UpdateDashboardWidgetRequest[]
  theme: string
}
