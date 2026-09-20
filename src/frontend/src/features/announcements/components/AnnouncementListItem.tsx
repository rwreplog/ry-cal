import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAnnouncementMutations } from '@/features/announcements/hooks/useAnnouncementMutations'
import type { AnnouncementDto } from '@/types/announcements'
import { AnnouncementForm } from './AnnouncementForm'

export function AnnouncementListItem({ announcement }: { announcement: AnnouncementDto }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove } = useAnnouncementMutations()

  return (
    <div className="flex items-start gap-3 rounded-2xl border p-4">
      <button type="button" className="flex-1 text-left" onClick={() => setEditOpen(true)}>
        <p>{announcement.message}</p>
        {announcement.postedBy && <p className="text-muted-foreground mt-1 text-sm">— {announcement.postedBy}</p>}
      </button>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete announcement"
        onClick={() => remove.mutate(announcement.id)}
        disabled={remove.isPending}
      >
        <Trash2 className="size-4" />
      </Button>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit announcement</SheetTitle>
          </SheetHeader>
          <AnnouncementForm
            initial={announcement}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) => update.mutate({ id: announcement.id, request: values }, { onSuccess: () => setEditOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
