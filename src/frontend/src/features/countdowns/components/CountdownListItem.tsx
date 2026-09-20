import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCountdownMutations } from '@/features/countdowns/hooks/useCountdownMutations'
import type { CountdownDto } from '@/types/countdowns'
import { CountdownForm } from './CountdownForm'

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function isPassed(targetDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${targetDate}T00:00:00`) < today
}

export function CountdownListItem({ countdown }: { countdown: CountdownDto }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove } = useCountdownMutations()

  return (
    <div className="flex items-center gap-3 rounded-2xl border p-4">
      <button type="button" className="flex-1 text-left" onClick={() => setEditOpen(true)}>
        <div className="flex items-center gap-2">
          <p className="font-medium">{countdown.label}</p>
          {isPassed(countdown.targetDate) && (
            <Badge variant="outline" className="text-muted-foreground">
              Passed
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{formatDate(countdown.targetDate)}</p>
      </button>

      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${countdown.label}`} onClick={() => remove.mutate(countdown.id)} disabled={remove.isPending}>
        <Trash2 className="size-4" />
      </Button>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit countdown</SheetTitle>
          </SheetHeader>
          <CountdownForm
            initial={countdown}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) => update.mutate({ id: countdown.id, request: values }, { onSuccess: () => setEditOpen(false) })}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
