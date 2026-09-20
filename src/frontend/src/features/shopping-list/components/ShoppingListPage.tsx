import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useShoppingList } from '@/features/shopping-list/hooks/useShoppingList'
import { useShoppingListMutations } from '@/features/shopping-list/hooks/useShoppingListMutations'
import { ShoppingListItemForm } from './ShoppingListItemForm'
import { ShoppingListListItem } from './ShoppingListListItem'

export function ShoppingListPage() {
  const { data, isLoading, isError } = useShoppingList()
  const { create, clearChecked } = useShoppingListMutations()
  const [addOpen, setAddOpen] = useState(false)

  const hasCheckedItems = data?.some((i) => i.isChecked) ?? false

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping List</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load the shopping list.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">Shopping list is empty. Add an item to get started.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <ShoppingListListItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {hasCheckedItems && (
        <Button variant="outline" size="sm" onClick={() => clearChecked.mutate()} disabled={clearChecked.isPending}>
          Clear checked
        </Button>
      )}

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add item</SheetTitle>
          </SheetHeader>
          <ShoppingListItemForm
            submitLabel="Add item"
            isPending={create.isPending}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => setAddOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
