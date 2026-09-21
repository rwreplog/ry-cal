import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { useFamilyMemberMutations } from '@/features/family/hooks/useFamilyMemberMutations'
import type { FamilyMemberDto } from '@/types/family'
import { FamilyMemberForm } from './FamilyMemberForm'

export function FamilyMemberListItem({ member }: { member: FamilyMemberDto }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove } = useFamilyMemberMutations()

  return (
    <div className="flex items-center gap-3 rounded-2xl border p-4">
      <Avatar>
        <AvatarFallback style={member.color ? { backgroundColor: member.color, color: 'white' } : undefined}>
          {member.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <button type="button" className="flex-1 text-left font-medium" onClick={() => setEditOpen(true)}>
        {member.name}
      </button>

      <DeleteConfirmDialog
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${member.name}`} disabled={remove.isPending}>
            <Trash2 className="size-4" />
          </Button>
        }
        title={`Remove ${member.name}?`}
        description="Their assigned chores will become unassigned. This can't be undone."
        confirmLabel="Remove"
        onConfirm={() => remove.mutate(member.id)}
      />

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit family member</SheetTitle>
          </SheetHeader>
          <FamilyMemberForm
            initial={member}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) => update.mutate({ id: member.id, request: values }, { onSuccess: () => setEditOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
