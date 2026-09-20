import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchLocations } from '@/services/api/dashboardApi'
import { useHouseholdLocation } from '@/features/dashboard/hooks/useHouseholdLocation'
import { useHouseholdLocationMutations } from '@/features/dashboard/hooks/useHouseholdLocationMutations'
import type { GeocodingResultDto } from '@/types/dashboard'

function resultLabel(result: GeocodingResultDto): string {
  return [result.name, result.admin1, result.country].filter(Boolean).join(', ')
}

export function LocationSettings() {
  const { data: location } = useHouseholdLocation()
  const { update } = useHouseholdLocationMutations()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResultDto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setSearchError(false)
    try {
      const found = await searchLocations(query.trim())
      setResults(found)
    } catch {
      setSearchError(true)
    } finally {
      setIsSearching(false)
    }
  }

  function handlePick(result: GeocodingResultDto) {
    update.mutate(
      { latitude: result.latitude, longitude: result.longitude, locationLabel: resultLabel(result) },
      { onSuccess: () => setResults([]) },
    )
    setQuery('')
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Location</h2>
      <p className="text-muted-foreground text-sm">
        {location?.locationLabel ? `Currently: ${location.locationLabel}` : 'Set your home location to see weather on the dashboard.'}
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a city" aria-label="Search for a city" />
        <Button type="submit" size="icon" variant="outline" disabled={!query.trim() || isSearching} aria-label="Search">
          <Search className="size-4" />
        </Button>
      </form>

      {searchError && <p className="text-destructive text-sm">Couldn&apos;t search right now. Try again.</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1 rounded-2xl border p-2">
          {results.map((result) => (
            <button
              key={`${result.latitude},${result.longitude}`}
              type="button"
              className="hover:bg-muted rounded-lg px-2 py-1.5 text-left text-sm"
              onClick={() => handlePick(result)}
              disabled={update.isPending}
            >
              {resultLabel(result)}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
