export interface MealPlanEntryDto {
  id: string
  date: string
  name: string
  description: string | null
}

export interface CreateMealPlanEntryRequest {
  date: string
  name: string
  description: string | null
}

export interface UpdateMealPlanEntryRequest {
  date: string
  name: string
  description: string | null
}
