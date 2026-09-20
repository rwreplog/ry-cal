import type { CreateMealPlanEntryRequest, MealPlanEntryDto, UpdateMealPlanEntryRequest } from '@/types/meals'
import { apiDelete, apiGet, apiPost, apiPut } from './httpClient'

export function fetchMeals(signal?: AbortSignal): Promise<MealPlanEntryDto[]> {
  return apiGet<MealPlanEntryDto[]>('/api/meals', signal)
}

export function createMeal(request: CreateMealPlanEntryRequest): Promise<MealPlanEntryDto> {
  return apiPost<MealPlanEntryDto>('/api/meals', request)
}

export function updateMeal(id: string, request: UpdateMealPlanEntryRequest): Promise<MealPlanEntryDto> {
  return apiPut<MealPlanEntryDto>(`/api/meals/${id}`, request)
}

export function deleteMeal(id: string): Promise<void> {
  return apiDelete<void>(`/api/meals/${id}`)
}
