import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatChannel, formatCompact, formatDate, formatNumber, formatWatchTime } from '../lib/format'
import { useChartData } from '../lib/useChartData'
import { prefersReducedMotion } from '../lib/motion'
import type { VideoRow } from '../types'

interface ChartsProps {
  rows: VideoRow[]
  daily: { date: string; views: number; engagements: number }[]
}

const COLORS = {
  accent: 'var(--accent)',
  slate: '#94a3b8',
}

const VIEWS_COLOR = 'var(--metric-views)'
const ENGAGEMENTS_COLOR = 'var(--metric-engagements)'
const WATCHTIME_COLOR = 'var(--metric-watchtime)'

const PIE_COLORS = [COLORS.accent, COLORS.slate]

const HOVER_CURSOR = { fill: 'var(--accent-bg)' } as const

const cardClass =
  'rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm'

const titleClass = 'mb-4 text-sm font-semibold text-[var(--text-h)]'

const axisProps = {
  stroke: 'var(--text)',
  fontSize: 12,
  tickLine: false,
} as const

function TitleTick({
  x,
  y,
  payload,
}: {
  x?: number
  y?: number
  payload?: { value?: string }
}) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="var(--text)"
      fontSize={12}
    >
      {payload?.value ?? ''}
    </text>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = formatNumber,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string | number
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="mb-1 font-semibold text-[var(--text-h)]">
          {labelFormatter ? labelFormatter(String(label)) : label}
        </p>
      )}
      {payload.map((entry, index) => (
        <p key={index} className="text-[var(--text)]" style={{ color: entry.color }}>
          {entry.name}: {valueFormatter(entry.value ?? 0)}
        </p>
      ))}
    </div>
  )
}

export function Charts({ rows, daily }: ChartsProps) {
  const { t } = useTranslation()
  const { topVideos, viewsByChannel, watchTimeByChannel, formatSplit } =
    useChartData(rows)

  const animate = !prefersReducedMotion()

  const narrow = typeof window !== 'undefined' && window.innerWidth < 640

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-10 text-center text-sm text-[var(--text)]">
        {t('charts.empty')}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className={`${cardClass} lg:col-span-2`}>
        <h3 className={titleClass}>{t('charts.viewsOverTime')}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={daily} margin={{ left: 8, right: 16 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={VIEWS_COLOR} stopOpacity={0.4} />
                <stop offset="95%" stopColor={VIEWS_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} {...axisProps} />
            <YAxis tickFormatter={formatCompact} {...axisProps} />
            <Tooltip
              content={
                <ChartTooltip labelFormatter={formatDate} valueFormatter={formatNumber} />
              }
            />
            <Area
              isAnimationActive={animate}
              type="monotone"
              dataKey="views"
              name={t('charts.seriesViews')}
              stroke={VIEWS_COLOR}
              fill="url(#viewsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={`${cardClass} lg:col-span-2`}>
        <h3 className={titleClass}>{t('charts.engagementsOverTime')}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={daily} margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} {...axisProps} />
            <YAxis tickFormatter={formatCompact} {...axisProps} />
            <Tooltip
              content={
                <ChartTooltip labelFormatter={formatDate} valueFormatter={formatNumber} />
              }
            />
            <Line
              isAnimationActive={animate}
              type="monotone"
              dataKey="engagements"
              name={t('charts.seriesEngagements')}
              stroke={ENGAGEMENTS_COLOR}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>{t('charts.top10')}</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={topVideos}
            layout="vertical"
            margin={{ left: 8, right: 52 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatCompact}
              {...axisProps}
            />
            <YAxis
              type="category"
              dataKey="title"
              width={narrow ? 110 : 190}
              interval={0}
              tick={<TitleTick />}
              {...axisProps}
            />
            <Tooltip
              cursor={HOVER_CURSOR}
              content={<ChartTooltip valueFormatter={formatNumber} />}
            />
            <Bar isAnimationActive={animate} dataKey="views" name={t('charts.seriesViews')} fill={VIEWS_COLOR} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="views"
                position="right"
                formatter={(value) => formatCompact(Number(value))}
                fill="var(--text)"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>{t('charts.viewsByChannel')}</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={viewsByChannel}
            layout="vertical"
            margin={{ left: 8, right: 52 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tickFormatter={formatCompact} {...axisProps} />
            <YAxis
              type="category"
              dataKey="account_name"
              width={narrow ? 95 : 130}
              interval={0}
              tickFormatter={formatChannel}
              {...axisProps}
            />
            <Tooltip
              cursor={HOVER_CURSOR}
              content={<ChartTooltip labelFormatter={formatChannel} valueFormatter={formatNumber} />}
            />
            <Bar isAnimationActive={animate} dataKey="views" name={t('charts.seriesViews')} fill={VIEWS_COLOR} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="views"
                position="right"
                formatter={(value) => formatCompact(Number(value))}
                fill="var(--text)"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>{t('charts.videoCountByFormat')}</h3>
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              isAnimationActive={animate}
              data={formatSplit}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
            >
              {formatSplit.map((entry, index) => (
                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={formatNumber} />} />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span className="text-[var(--text)]">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={cardClass}>
        <h3 className={titleClass}>{t('charts.watchTimeByChannel')}</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={watchTimeByChannel} margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="account_name"
              interval={0}
              angle={-30}
              textAnchor="end"
              height={80}
              tickFormatter={formatChannel}
              {...axisProps}
            />
            <YAxis
              tickFormatter={(value: number) => formatCompact(value / 60)}
              {...axisProps}
            />
            <Tooltip
              cursor={HOVER_CURSOR}
              content={<ChartTooltip labelFormatter={formatChannel} valueFormatter={formatWatchTime} />}
            />
            <Bar
              isAnimationActive={animate}
              dataKey="watchtime"
              name={t('charts.seriesWatchTime')}
              fill={WATCHTIME_COLOR}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
