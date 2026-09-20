import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AnnouncementDto } from '@/types/announcements'

interface AnnouncementFormProps {
  initial?: AnnouncementDto
  submitLabel: string
  isPending: boolean
  onSubmit: (values: { message: string; postedBy: string | null }) => void
}

export function AnnouncementForm({ initial, submitLabel, isPending, onSubmit }: AnnouncementFormProps) {
  const [message, setMessage] = useState(initial?.message ?? '')
  const [postedBy, setPostedBy] = useState(initial?.postedBy ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim()) return
    onSubmit({ message: message.trim(), postedBy: postedBy.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-message">Message</Label>
        <Textarea
          id="announcement-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Grandma's visiting this weekend!"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-posted-by">Posted by (optional)</Label>
        <Input id="announcement-posted-by" value={postedBy} onChange={(e) => setPostedBy(e.target.value)} placeholder="e.g. Mom" />
      </div>

      <Button type="submit" disabled={!message.trim() || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
