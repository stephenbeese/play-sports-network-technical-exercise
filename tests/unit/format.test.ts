import { describe, expect, it } from 'vitest'
import {
  formatCompact,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatWatchTime,
} from '../../src/lib/format'

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1452781)).toBe('1,452,781')
  })

  it('leaves small numbers ungrouped', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
  })
})

describe('formatCompact', () => {
  it('renders values under 1,000 as whole numbers', () => {
    expect(formatCompact(0)).toBe('0')
    expect(formatCompact(999)).toBe('999')
  })

  it('rounds fractional values below the compact threshold', () => {
    expect(formatCompact(12.4)).toBe('12')
    expect(formatCompact(12.6)).toBe('13')
  })

  it('switches to compact notation at 1,000 and above', () => {
    expect(formatCompact(1000)).toBe('1k')
    expect(formatCompact(11700)).toBe('11.7k')
  })

  it('keeps at most one fraction digit', () => {
    // 2,770,000 would be 2.77m at full precision; it rounds to one digit.
    expect(formatCompact(2770000)).toBe('2.8m')
  })
})

describe('formatWatchTime', () => {
  it('converts minutes to hours with a unit suffix', () => {
    expect(formatWatchTime(60)).toBe('1 hrs')
  })

  it('uses compact notation for large hour counts', () => {
    // 702,000 min / 60 = 11,700 hrs -> "11.7k hrs".
    expect(formatWatchTime(11700 * 60)).toBe('11.7k hrs')
  })
})

describe('formatPercent', () => {
  it('rounds a 0..1 ratio to a whole percentage', () => {
    expect(formatPercent(0.486)).toBe('49%')
    expect(formatPercent(1)).toBe('100%')
  })

  it('returns a dash for non-finite ratios', () => {
    expect(formatPercent(Number.NaN)).toBe('—')
    expect(formatPercent(Number.POSITIVE_INFINITY)).toBe('—')
  })
})

describe('formatDuration', () => {
  it('formats sub-hour lengths as m:ss with a zero-padded seconds field', () => {
    expect(formatDuration(45000)).toBe('0:45')
    expect(formatDuration(125000)).toBe('2:05')
  })

  it('formats hour-plus lengths as h:mm:ss', () => {
    // 1h 02m 05s.
    expect(formatDuration(3725000)).toBe('1:02:05')
  })

  it('rounds to the nearest second at the boundary', () => {
    expect(formatDuration(59400)).toBe('0:59')
    expect(formatDuration(59600)).toBe('1:00')
  })
})

describe('formatDate', () => {
  it('reformats an ISO date into a readable day/month/year string', () => {
    const result = formatDate('2025-12-13')
    expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/)
    // Month and year are timezone-stable for a mid-month date.
    expect(result).toContain('Dec 2025')
  })

  it('returns the original string when the date is invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
