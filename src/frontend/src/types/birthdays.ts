export interface BirthdayDto {
  id: string
  name: string
  date: string
}

export interface CreateBirthdayRequest {
  name: string
  date: string
}

export interface UpdateBirthdayRequest {
  name: string
  date: string
}
