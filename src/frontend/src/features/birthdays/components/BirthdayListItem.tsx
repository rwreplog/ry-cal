import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useBirthdayMutations } from '@/features/birthdays/hooks/useBirthdayMutations'
import type { BirthdayDto } from '@/types/birthdays'
import { BirthdayForm } from './BirthdayForm'

function formatBirthday(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
}

export function BirthdayListItem({ birthday }: { birthday: BirthdayDto }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove } = useBirthdayMutations()

  return (
    <div className="flex items-center gap-3 rounded-2xl border p-4">
      <Avatar>
        <AvatarFallback>{birthday.name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>

      <button type="button" className="flex-1 text-left" onClick={() => setEditOpen(true)}>
        <p className="font-medium">{birthday.name}</p>
        <p className="text-muted-foreground text-sm">{formatBirthday(birthday.date)}</p>
      </button>

      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${birthday.name}`} onClick={() => remove.mutate(birthday.id)} disabled={remove.isPending}>
        <Trash2 className="size-4" />
      </Button>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit birthday</SheetTitle>
          </SheetHeader>
          <BirthdayForm
            initial={birthday}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) => update.mutate({ id: birthday.id, request: values }, { onSuccess: () => setEditOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
