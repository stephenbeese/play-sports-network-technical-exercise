import { vi } from 'vitest'
import { posts, poststats } from './videoData'

function jsonResponse(data: unknown): Response {
  return {
    ok: true,
    json: async () => data,
  } as Response
}

export function mockDataFetch() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('posts.json')) return jsonResponse(posts)
    if (url.includes('poststats.json')) return jsonResponse(poststats)
    throw new Error(`Unexpected fetch: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function mockFailedFetch() {
  const fetchMock = vi.fn(async () => ({ ok: false }) as Response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
