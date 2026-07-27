import { motion } from 'motion/react'
import { Trans, useTranslation } from 'react-i18next'

interface PaginationProps {
  page: number
  pageCount: number
  pageSize: number
  totalItems: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useTranslation()
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)

  const buttonClass =
    'inline-flex items-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-h)] transition-colors enabled:hover:bg-[var(--social-bg)] disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-[var(--text)]">
          {t('pagination.rowsPerPage')}
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-[var(--text)]">
          <Trans
            i18nKey="pagination.showing"
            values={{ first: firstItem, last: lastItem, total: totalItems }}
            components={[
              <span className="font-semibold text-[var(--text-h)]" />,
              <span className="font-semibold text-[var(--text-h)]" />,
            ]}
          />
        </p>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            className={buttonClass}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            {t('pagination.previous')}
          </motion.button>
          <span className="px-2 text-sm text-[var(--text)]">
            <Trans
              i18nKey="pagination.page"
              values={{ page, pageCount }}
              components={[
                <span className="font-semibold text-[var(--text-h)]" />,
              ]}
            />
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            className={buttonClass}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            {t('pagination.next')}
          </motion.button>
        </div>
      )}
    </div>
  )
}
