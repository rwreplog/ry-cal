export interface FamilyMemberDto {
  id: string
  name: string
  color: string | null
}

export interface CreateFamilyMemberRequest {
  name: string
  color: string | null
}

export interface UpdateFamilyMemberRequest {
  name: string
  color: string | null
}
