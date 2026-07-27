interface FormatBadgeProps {
  format: string
}

export function FormatBadge({ format }: FormatBadgeProps) {
  const isShorts = format.toLowerCase().includes('short')

  const palette = isShorts
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-300'

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${palette}`}
    >
      {format}
    </span>
  )
}
