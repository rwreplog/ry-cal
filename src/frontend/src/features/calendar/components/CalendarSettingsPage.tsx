import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { apiUrl } from '@/services/api/httpClient'
import { calendarConnectionQueryKey, useCalendarConnection } from '@/features/calendar/hooks/useCalendarConnection'
import { useCalendarConnectionMutations } from '@/features/calendar/hooks/useCalendarConnectionMutations'
import { useAvailableCalendars } from '@/features/calendar/hooks/useAvailableCalendars'

function IcsConnectForm({ submitLabel }: { submitLabel: string }) {
  const { connectIcs } = useCalendarConnectionMutations()
  const [url, setUrl] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!url.trim()) return
    connectIcs.mutate({ icsUrl: url.trim() }, { onSuccess: () => setUrl('') })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Label htmlFor="ics-url">Public calendar link (webcal:// or https://, .ics)</Label>
      <Input
        id="ics-url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="webcal://p123-caldav.icloud.com/published/2/..."
      />
      <Button type="submit" disabled={!url.trim() || connectIcs.isPending}>
        {connectIcs.isPending ? 'Checking feed…' : submitLabel}
      </Button>
      {connectIcs.isError && (
        <p className="text-destructive text-sm">Couldn&apos;t load that calendar feed. Check the link and try again.</p>
      )}
    </form>
  )
}

export function CalendarSettingsPage() {
  const { data, isLoading, isError } = useCalendarConnection()
  const { disconnect, selectCalendar } = useCalendarConnectionMutations()
  const isGoogle = data?.provider === 'Google'
  const isIcs = data?.provider === 'Ics'
  const { data: calendars, isLoading: calendarsLoading } = useAvailableCalendars(isGoogle)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')

  useEffect(() => {
    if (connected === null) return

    if (connected === 'true') {
      queryClient.invalidateQueries({ queryKey: calendarConnectionQueryKey })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }

    navigate('/admin/calendar', { replace: true })
  }, [connected, navigate, queryClient])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>

      {connected === 'true' && <p className="text-sm text-emerald-600">Google Calendar connected.</p>}
      {connected === 'false' && (
        <p className="text-destructive text-sm">
          Couldn&apos;t connect Google Calendar{error ? ` (${error})` : ''}. Please try again.
        </p>
      )}

      {isLoading && <Skeleton className="h-20 w-full rounded-2xl" />}

      {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load calendar connection status.</p>}

      {!isLoading && !isError && data && isGoogle && (
        <div className="flex flex-col gap-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connected to Google</p>
              <p className="text-muted-foreground text-sm">{data.connectedEmail}</p>
            </div>
            <Button variant="outline" onClick={() => disconnect.mutate(data.id)} disabled={disconnect.isPending}>
              Disconnect
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Calendar to show on the dashboard</Label>
            {calendarsLoading && <Skeleton className="h-8 w-full" />}
            {!calendarsLoading && (
              <Select
                value={data.calendarId ?? undefined}
                onValueChange={(calendarId) => selectCalendar.mutate({ id: data.id, request: { calendarId } })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calendars?.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.summary}
                      {calendar.isPrimary ? ' (primary)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {!isLoading && !isError && data && isIcs && (
        <div className="flex flex-col gap-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">Connected to a public calendar link</p>
              <p className="text-muted-foreground truncate text-sm">{data.icsUrl}</p>
            </div>
            <Button variant="outline" onClick={() => disconnect.mutate(data.id)} disabled={disconnect.isPending}>
              Disconnect
            </Button>
          </div>

          <div className="border-t pt-4">
            <IcsConnectForm submitLabel="Replace link" />
          </div>
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border p-4">
            <p className="text-muted-foreground text-sm">
              Connect your Google account to show upcoming events on the dashboard.
            </p>
            <Button asChild>
              <a href={apiUrl('/api/calendar/connect')}>Connect Google Calendar</a>
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border p-4">
            <p className="text-muted-foreground text-sm">
              Or paste a public calendar link — works with an iCloud shared calendar&apos;s public link, or any
              public .ics feed.
            </p>
            <IcsConnectForm submitLabel="Connect calendar link" />
          </div>
        </div>
      )}
    </div>
  )
}
