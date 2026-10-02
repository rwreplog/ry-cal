import { Circle, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useShoppingListMutations } from '@/features/shopping-list/hooks/useShoppingListMutations'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

export function ShoppingListWidget() {
  const { data, isLoading, isError } = useDashboard()
  const { toggle } = useShoppingListMutations()

  const overflowCount = data ? data.shoppingList.totalUncheckedCount - data.shoppingList.items.length : 0

  return (
    <Card className={widgetAccentClasses('shopping')}>
      <CardHeader className="flex-row items-center gap-2">
        <ShoppingCart className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Shopping List</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load the shopping list.</p>}

        {!isLoading && !isError && data && data.shoppingList.items.length === 0 && (
          <p className="text-muted-foreground text-sm">Shopping list is empty.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.shoppingList.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="active:bg-muted flex min-h-11 items-center gap-2 rounded-md text-left"
              onClick={() => toggle.mutate(item.id)}
              aria-label={`Mark ${item.name} checked`}
            >
              <Circle className="text-muted-foreground size-6 shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </button>
          ))}

        {!isLoading && !isError && overflowCount > 0 && <p className="text-muted-foreground text-sm">+{overflowCount} more</p>}
      </CardContent>
    </Card>
  )
}
