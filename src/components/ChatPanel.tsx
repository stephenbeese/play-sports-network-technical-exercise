import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { VideoRow } from '../types'
import { useChat } from '../lib/useChat'
import type { DailyPoint } from '../lib/useFilteredVideos'

interface ChatPanelProps {
  /** Rows the assistant answers from (pass the filtered set). */
  rows: VideoRow[]
  /** Filtered daily time series, for month/date-range questions. */
  daily: DailyPoint[]
  /** True when any dashboard filter is active, so answers flag filtered totals. */
  filtersActive: boolean
}

const SUGGESTED_QUESTIONS = [
  'Top video by views',
  'Which channel has the most watch time?',
  'Views in December 2025',
  'How many Shorts vs long-form?',
]

/** Floating chat assistant: demo mode with no key, OpenAI when a key is set. */
export function ChatPanel({ rows, daily, filtersActive }: ChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [keyDraft, setKeyDraft] = useState('')
  const { messages, sending, demoMode, apiKey, setApiKey, send, clear } = useChat(
    rows,
    daily,
    filtersActive,
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view — jump instantly when the panel opens,
  // scroll smoothly as messages stream in.
  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    send(input)
    setInput('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        className="fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent)] p-3.5 text-xl text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? '✕' : '💬'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-21 right-5 z-40 flex h-[28rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-h)]">Data assistant</p>
                <p className="truncate text-[11px] text-[var(--text)]">
                  {demoMode ? 'Demo mode — answers computed locally' : 'OpenAI · gpt-4o-mini'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="whitespace-nowrap rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)] transition-colors hover:bg-[var(--social-bg)]"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setKeyDraft(apiKey)
                  setShowSettings((v) => !v)
                }}
                className="whitespace-nowrap rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)] transition-colors hover:bg-[var(--social-bg)]"
              >
                {apiKey ? 'Key ✓' : 'Add key'}
              </button>
              </div>
            </div>

            {showSettings && (
              <div className="flex gap-2 border-b border-[var(--border)] px-4 py-3">
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="OpenAI API key (stored in this browser only)"
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-xs text-[var(--text-h)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setApiKey(keyDraft)
                    setShowSettings(false)
                  }}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Save
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div>
                  <p className="text-xs text-[var(--text)]">
                    Ask about the videos, or try one of these — answers respect the current
                    filters.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => send(question)}
                        className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1.5 text-xs text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'ml-auto bg-[var(--accent)] text-white'
                      : 'bg-[var(--social-bg)] text-[var(--text-h)]'
                  } ${message.content === '' ? 'animate-pulse' : ''}`}
                >
                  {message.content || 'Thinking…'}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="flex gap-2 border-t border-[var(--border)] px-4 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                aria-label="Chat message"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)]"
              />
              <button
                type="submit"
                disabled={sending || input.trim() === ''}
                className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
