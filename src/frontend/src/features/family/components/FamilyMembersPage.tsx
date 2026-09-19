import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useFamilyMemberMutations } from '@/features/family/hooks/useFamilyMemberMutations'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import { FamilyMemberForm } from './FamilyMemberForm'
import { FamilyMemberListItem } from './FamilyMemberListItem'

export function FamilyMembersPage() {
  const { data, isLoading, isError } = useFamilyMembers()
  const { create } = useFamilyMemberMutations()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Family</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add member
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load family members.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">No family members yet. Add one to get started.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((member) => (
            <FamilyMemberListItem key={member.id} member={member} />
          ))}
        </div>
      )}

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add family member</SheetTitle>
          </SheetHeader>
          <FamilyMemberForm
            submitLabel="Add member"
            isPending={create.isPending}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => setAddOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
