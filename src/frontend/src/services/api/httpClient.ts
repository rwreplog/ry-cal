const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

// For real browser navigations (not fetch) — e.g. redirecting to an OAuth consent flow.
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>('GET', path, undefined, signal)
}

export function apiPost<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>('POST', path, body, signal)
}

export function apiPut<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>('PUT', path, body, signal)
}

export function apiPatch<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>('PATCH', path, body, signal)
}

export function apiDelete<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>('DELETE', path, undefined, signal)
}
