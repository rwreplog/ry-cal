import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMeal, deleteMeal, updateMeal } from '@/services/api/mealsApi'
import type { CreateMealPlanEntryRequest, UpdateMealPlanEntryRequest } from '@/types/meals'
import { mealsQueryKey } from './useMeals'

export function useMealMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: mealsQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const create = useMutation({
    mutationFn: (request: CreateMealPlanEntryRequest) => createMeal(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateMealPlanEntryRequest }) => updateMeal(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteMeal(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
