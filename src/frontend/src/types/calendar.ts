export interface CalendarConnectionDto {
  id: string
  provider: string
  connectedEmail: string | null
  calendarId: string | null
  icsUrl: string | null
  connectedAtUtc: string
}

export interface CalendarListItemDto {
  id: string
  summary: string
  isPrimary: boolean
}

export interface UpdateSelectedCalendarRequest {
  calendarId: string
}

export interface ConnectIcsRequest {
  icsUrl: string
}
