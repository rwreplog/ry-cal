export interface AnnouncementDto {
  id: string
  message: string
  postedBy: string | null
  postedAtUtc: string
}

export interface CreateAnnouncementRequest {
  message: string
  postedBy: string | null
}

export interface UpdateAnnouncementRequest {
  message: string
  postedBy: string | null
}
