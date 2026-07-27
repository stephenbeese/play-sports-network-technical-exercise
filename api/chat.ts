// Vercel edge function that proxies chat requests to OpenAI so the API key
// stays server-side. GET is a probe the frontend uses to detect this proxy;
// deployments without it (GitHub Pages, local dev) fall back to demo mode
// or a pasted key.
//
// The system prompt is injected HERE, not accepted from the client — callers
// send only the fact-sheet context plus user/assistant history, so the key
// can't be repurposed as a general OpenAI proxy by swapping the instructions.
import { SYSTEM_PROMPT } from '../src/lib/chatPrompt'

export const config = { runtime: 'edge' }

const MAX_MESSAGES = 40
const MAX_MESSAGE_CHARS = 4_000 // per user/assistant message
const MAX_CONTEXT_CHARS = 32_000 // fact sheet is a few KB; this is generous
const RATE_LIMIT = 20 // requests per window per IP
const WINDOW_MS = 60_000
const MAX_TRACKED_IPS = 10_000

// ponytail: in-memory per-instance rate limit — enough to stop casual abuse
// on a low-traffic demo; use Upstash/KV if this ever needs to be watertight.
const hits = new Map<string, { count: number; start: number }>()

function clientIp(req: Request): string {
  // x-real-ip is set by Vercel's edge and can't be spoofed by the caller;
  // x-forwarded-for is a client-controllable fallback for other hosts.
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  // Evict expired windows so the map can't grow without bound.
  if (hits.size >= MAX_TRACKED_IPS) {
    for (const [key, entry] of hits) {
      if (now - entry.start > WINDOW_MS) hits.delete(key)
    }
  }
  const entry = hits.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return Response.json({ ok: true })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Proxy is not configured with an API key.' }, { status: 503 })
  }

  if (rateLimited(clientIp(req))) {
    return Response.json({ error: 'Too many requests — slow down.' }, { status: 429 })
  }

  let context: unknown
  let messages: unknown
  try {
    const body = await req.json()
    context = body.context
    messages = body.messages
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (typeof context !== 'string' || context.length === 0 || context.length > MAX_CONTEXT_CHARS) {
    return Response.json({ error: 'Invalid context.' }, { status: 400 })
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(
      (m) =>
        m &&
        typeof m.content === 'string' &&
        m.content.length <= MAX_MESSAGE_CHARS &&
        ['user', 'assistant'].includes(m.role),
    )
  ) {
    return Response.json({ error: 'Invalid messages.' }, { status: 400 })
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [{ role: 'system', content: SYSTEM_PROMPT + context }, ...messages],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: `OpenAI request failed (${upstream.status}).` }, { status: 502 })
  }

  // Pass the SSE stream straight through — the frontend parses it the same
  // way as a direct OpenAI response.
  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
