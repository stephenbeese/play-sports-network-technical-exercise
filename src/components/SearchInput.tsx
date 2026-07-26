import { useEffect, useMemo, useRef, useState } from 'react'

interface SearchInputProps {
  value: string
  /** Candidate strings (e.g. video titles and channel names) to suggest from. */
  suggestions: string[]
  placeholder?: string
  className?: string
  onChange: (value: string) => void
}

const MAX_SUGGESTIONS = 8

/** Search box with a keyboard-accessible autocomplete dropdown. */
export function SearchInput({
  value,
  suggestions,
  placeholder,
  className = '',
  onChange,
}: SearchInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const query = value.trim().toLowerCase()

  const matches = useMemo(() => {
    if (query === '') return []
    const seen = new Set<string>()
    const result: string[] = []
    for (const suggestion of suggestions) {
      const key = suggestion.toLowerCase()
      if (key === query || seen.has(key) || !key.includes(query)) continue
      seen.add(key)
      result.push(suggestion)
      if (result.length >= MAX_SUGGESTIONS) break
    }
    return result
  }, [suggestions, query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showList = open && matches.length > 0

  const select = (suggestion: string) => {
    onChange(suggestion)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (event.key === 'ArrowDown' && matches.length > 0) {
        setOpen(true)
        setActiveIndex(0)
        event.preventDefault()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => (index + 1) % matches.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => (index - 1 + matches.length) % matches.length)
        break
      case 'Enter':
        if (activeIndex >= 0) {
          event.preventDefault()
          select(matches[activeIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        aria-activedescendant={
          activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
        }
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {showList && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] py-1 text-sm shadow-lg"
        >
          {matches.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`search-suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault()
                select(suggestion)
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer truncate px-3 py-1.5 text-[var(--text-h)] ${
                index === activeIndex ? 'bg-[var(--social-bg)]' : ''
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
