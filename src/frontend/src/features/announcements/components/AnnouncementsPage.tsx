import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAnnouncementMutations } from '@/features/announcements/hooks/useAnnouncementMutations'
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements'
import { AnnouncementForm } from './AnnouncementForm'
import { AnnouncementListItem } from './AnnouncementListItem'

export function AnnouncementsPage() {
  const { data, isLoading, isError } = useAnnouncements()
  const { create } = useAnnouncementMutations()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load announcements.</p>}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-muted-foreground text-sm">No announcements yet. Add one to get started.</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((announcement) => (
            <AnnouncementListItem key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add announcement</SheetTitle>
          </SheetHeader>
          <AnnouncementForm
            submitLabel="Add announcement"
            isPending={create.isPending}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => setAddOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
