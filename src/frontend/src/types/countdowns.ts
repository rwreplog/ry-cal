export interface CountdownDto {
  id: string
  label: string
  targetDate: string
}

export interface CreateCountdownRequest {
  label: string
  targetDate: string
}

export interface UpdateCountdownRequest {
  label: string
  targetDate: string
}
