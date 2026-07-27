import { useCallback, useEffect, useState } from 'react'
import type { VideoRow } from '../types'
import { SYSTEM_PROMPT, TOP_N } from './chatPrompt'
import { formatWatchTime } from './format'
import { answerLocally, DEMO_FALLBACK } from './localAnswers'
import type { DailyPoint } from './useFilteredVideos'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const KEY_STORAGE = 'openai_api_key'

/** OpenAI key from the paste-in-panel field or a local .env — never committed. */
function storedKey(): string {
  return (
    localStorage.getItem(KEY_STORAGE) ||
    (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ||
    ''
  )
}

/**
 * Precomputed fact sheet the model answers from. Aggregating in code (exact)
 * rather than handing the model thousands of raw rows to sum (unreliable)
 * keeps its answers consistent with the dashboard.
 */
function buildContext(rows: VideoRow[], daily: DailyPoint[]): string {
  const sum = (metric: 'views' | 'engagements' | 'watchtime') =>
    rows.reduce((total, row) => total + row[metric], 0)

  const byChannel = new Map<string, { views: number; engagements: number; watchtime: number; count: number }>()
  const byFormat = new Map<string, { views: number; count: number }>()
  for (const row of rows) {
    const channel = byChannel.get(row.account_name) ?? { views: 0, engagements: 0, watchtime: 0, count: 0 }
    channel.views += row.views
    channel.engagements += row.engagements
    channel.watchtime += row.watchtime
    channel.count += 1
    byChannel.set(row.account_name, channel)

    const format = byFormat.get(row.video_type) ?? { views: 0, count: 0 }
    format.views += row.views
    format.count += 1
    byFormat.set(row.video_type, format)
  }

  const topBy = (metric: 'views' | 'engagements' | 'watchtime') =>
    [...rows]
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, TOP_N)
      .map(
        (r, i) =>
          `${i + 1}. ${r.title} | ${r.account_name} | ${r.video_type} | published ${r.published_at_date} | views ${r.views} | engagements ${r.engagements} | watch time ${formatWatchTime(r.watchtime)}`,
      )
      .join('\n')

  const dates = rows.map((r) => r.published_at_date).sort()

  const byMonth = new Map<string, { views: number; engagements: number }>()
  for (const point of daily) {
    const month = point.date.slice(0, 7)
    const current = byMonth.get(month) ?? { views: 0, engagements: 0 }
    current.views += point.views
    current.engagements += point.engagements
    byMonth.set(month, current)
  }

  return [
    `OVERALL (all ${rows.length} videos matching the current dashboard filters; publish dates ${dates[0]} to ${dates[dates.length - 1]}):`,
    `total_views=${sum('views')} total_engagements=${sum('engagements')} total_watch_time=${formatWatchTime(sum('watchtime'))}`,
    '',
    'PER CHANNEL (channel | videos | views | engagements | watch time):',
    ...Array.from(byChannel.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .map(([name, c]) => `${name} | ${c.count} | ${c.views} | ${c.engagements} | ${formatWatchTime(c.watchtime)}`),
    '',
    'PER MONTH — activity recorded in that calendar month, from daily stats (month | views | engagements):',
    ...Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, m]) => `${month} | ${m.views} | ${m.engagements}`),
    '',
    'PER FORMAT (format | videos | views):',
    ...Array.from(byFormat.entries()).map(([name, f]) => `${name} | ${f.count} | ${f.views}`),
    '',
    `TOP ${TOP_N} VIDEOS BY VIEWS:`,
    topBy('views'),
    '',
    `TOP ${TOP_N} VIDEOS BY ENGAGEMENTS:`,
    topBy('engagements'),
    '',
    `TOP ${TOP_N} VIDEOS BY WATCH TIME:`,
    topBy('watchtime'),
  ].join('\n')
}

async function streamOpenAI(
  apiKey: string,
  rows: VideoRow[],
  daily: DailyPoint[],
  filtersActive: boolean,
  history: ChatMessage[],
  onToken: (text: string) => void,
): Promise<void> {
  const context =
    (filtersActive
      ? 'IMPORTANT: dashboard filters are active, so the fact sheet covers a filtered subset — start every answer with "Across your current filters,".\n\n'
      : '') + buildContext(rows, daily)

  // A pasted key calls OpenAI directly; otherwise the Vercel proxy
  // (/api/chat) holds the key server-side, injects the system prompt itself
  // (so callers can't replace it), and relays the same SSE stream.
  const res = apiKey
    ? await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          stream: true,
          messages: [{ role: 'system', content: SYSTEM_PROMPT + context }, ...history],
        }),
      })
    : await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, messages: history }),
      })

  if (res.status === 401) throw new Error('OpenAI rejected the API key — check it and try again.')
  if (res.status === 429) throw new Error('OpenAI rate limit hit — wait a moment and retry.')
  if (!res.ok || !res.body) throw new Error(`OpenAI request failed (${res.status}).`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const data = line.replace(/^data: /, '').trim()
      if (!data || data === '[DONE]') continue
      try {
        const token = JSON.parse(data).choices?.[0]?.delta?.content
        if (token) onToken(token)
      } catch {
        // ignore malformed keep-alive chunks
      }
    }
  }
}

export interface Chat {
  messages: ChatMessage[]
  sending: boolean
  /** True when no OpenAI key is configured and the local engine answers. */
  demoMode: boolean
  /** True when the Vercel proxy answers, so no client-side key is needed. */
  proxyAvailable: boolean
  apiKey: string
  setApiKey: (key: string) => void
  send: (question: string) => Promise<void>
  clear: () => void
}

/**
 * Chat state for the dashboard assistant. With no API key it answers from the
 * local demo engine; with a key it streams from OpenAI with the (filtered)
 * rows serialized into the system prompt.
 */
export function useChat(rows: VideoRow[], daily: DailyPoint[], filtersActive = false): Chat {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [apiKey, setApiKeyState] = useState(storedKey)
  const [proxyAvailable, setProxyAvailable] = useState(false)

  // Detect the Vercel proxy (api/chat.ts). Present on the deployed site;
  // absent under `yarn dev`/`yarn preview`, where demo mode or a pasted key
  // takes over.
  useEffect(() => {
    fetch('/api/chat')
      .then((res) => res.ok && res.headers.get('content-type')?.includes('json') && setProxyAvailable(true))
      .catch(() => {})
  }, [])

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim()
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed)
    else localStorage.removeItem(KEY_STORAGE)
    setApiKeyState(trimmed)
  }, [])

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || sending) return
      const history: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
      setSending(true)

      if (!apiKey && !proxyAvailable) {
        const local = answerLocally(trimmed, rows, daily)
        // Flag filtered numbers so they aren't mistaken for global totals.
        const answer =
          local && filtersActive ? `Across your current filters: ${local}` : (local ?? DEMO_FALLBACK)
        setMessages([...history, { role: 'assistant', content: answer }])
        setSending(false)
        return
      }

      setMessages([...history, { role: 'assistant', content: '' }])
      let answer = ''
      try {
        await streamOpenAI(apiKey, rows, daily, filtersActive, history, (token) => {
          answer += token
          setMessages([...history, { role: 'assistant', content: answer }])
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.'
        setMessages([...history, { role: 'assistant', content: `⚠️ ${message}` }])
      } finally {
        setSending(false)
      }
    },
    [apiKey, daily, filtersActive, messages, proxyAvailable, rows, sending],
  )

  const clear = useCallback(() => setMessages([]), [])

  return { messages, sending, demoMode: !apiKey && !proxyAvailable, proxyAvailable, apiKey, setApiKey, send, clear }
}
