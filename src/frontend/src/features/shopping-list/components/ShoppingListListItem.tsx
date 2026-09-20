import { useState } from 'react'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useShoppingListMutations } from '@/features/shopping-list/hooks/useShoppingListMutations'
import type { ShoppingListItemDto } from '@/types/shoppingList'
import { ShoppingListItemForm } from './ShoppingListItemForm'

export function ShoppingListListItem({ item }: { item: ShoppingListItemDto }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove, toggle } = useShoppingListMutations()

  return (
    <div className="flex items-center gap-3 rounded-2xl border p-4">
      <button
        type="button"
        aria-label={item.isChecked ? `Mark ${item.name} unchecked` : `Mark ${item.name} checked`}
        onClick={() => toggle.mutate(item.id)}
        className="shrink-0"
      >
        {item.isChecked ? (
          <CheckCircle2 className="size-5 text-emerald-500" aria-hidden="true" />
        ) : (
          <Circle className="text-muted-foreground size-5" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        className={item.isChecked ? 'text-muted-foreground flex-1 text-left line-through' : 'flex-1 text-left'}
        onClick={() => setEditOpen(true)}
      >
        {item.name}
      </button>

      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${item.name}`} onClick={() => remove.mutate(item.id)} disabled={remove.isPending}>
        <Trash2 className="size-4" />
      </Button>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit item</SheetTitle>
          </SheetHeader>
          <ShoppingListItemForm
            initial={item}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) => update.mutate({ id: item.id, request: values }, { onSuccess: () => setEditOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
