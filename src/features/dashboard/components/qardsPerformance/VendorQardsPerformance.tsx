import React from 'react'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Dropdown, Loader, Text } from '@/components'
import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'

type ChartDatum = {
  month: string
  dashX: number
  dashPass: number
}

type QardsPerformanceData = {
  period_key: string
  dashx_amount: number
  dashpass_amount: number
}

type TimeframeOption = 'Monthly' | 'Quarterly' | 'Yearly'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function parseMonthYear(monthYear: string): { month: number; year: number } {
  // Expected format: "YYYY-MM" or "MM-YYYY" or similar
  const parts = monthYear?.split('-')
  if (parts?.length === 2) {
    const first = parseInt(parts[0], 10)
    const second = parseInt(parts[1], 10)
    // If first part is 4 digits, it's year-month format
    if (first > 1000) {
      return { year: first, month: second }
    }
    // Otherwise it's month-year format
    return { month: first, year: second }
  }
  // Fallback: try to parse as date string
  const date = new Date(monthYear)
  if (!isNaN(date.getTime())) {
    return { month: date.getMonth() + 1, year: date.getFullYear() }
  }
  return { month: 1, year: new Date().getFullYear() }
}

function getQuarter(month: number): number {
  return Math.floor((month - 1) / 3) + 1
}

function transformToChartData(
  apiData: QardsPerformanceData[],
  timeframe: TimeframeOption,
): ChartDatum[] {
  if (!apiData || apiData.length === 0) return []

  // Transform the data
  const transformed = apiData.map((item) => {
    const { month, year } = parseMonthYear(item.period_key)
    return {
      month,
      year,
      quarter: getQuarter(month),
      dashX: item.dashx_amount || 0,
      dashPass: item.dashpass_amount || 0,
    }
  })

  if (timeframe === 'Monthly') {
    // Group by month-year and sum
    const grouped = transformed.reduce(
      (acc, item) => {
        const key = `${item.year}-${item.month}`
        if (!acc[key]) {
          acc[key] = {
            month: item.month,
            year: item.year,
            dashX: 0,
            dashPass: 0,
          }
        }
        acc[key].dashX += item.dashX
        acc[key].dashPass += item.dashPass
        return acc
      },
      {} as Record<
        string,
        {
          month: number
          year: number
          dashX: number
          dashPass: number
        }
      >,
    )

    return Object.values(grouped)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
      .map((item) => ({
        month: `${MONTH_NAMES[item.month - 1]} ${item.year}`,
        dashX: item.dashX,
        dashPass: item.dashPass,
      }))
  }

  if (timeframe === 'Quarterly') {
    // Group by quarter-year and sum
    const grouped = transformed.reduce(
      (acc, item) => {
        const quarter = getQuarter(item.month)
        const key = `${item.year}-Q${quarter}`
        if (!acc[key]) {
          acc[key] = {
            quarter,
            year: item.year,
            dashX: 0,
            dashPass: 0,
          }
        }
        acc[key].dashX += item.dashX
        acc[key].dashPass += item.dashPass
        return acc
      },
      {} as Record<
        string,
        {
          quarter: number
          year: number
          dashX: number
          dashPass: number
        }
      >,
    )

    return Object.values(grouped)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.quarter - b.quarter
      })
      .map((item) => ({
        month: `Q${item.quarter} ${item.year}`,
        dashX: item.dashX,
        dashPass: item.dashPass,
      }))
  }

  // Yearly
  const grouped = transformed.reduce(
    (acc, item) => {
      const key = item.year.toString()
      if (!acc[key]) {
        acc[key] = {
          year: item.year,
          dashX: 0,
          dashPass: 0,
        }
      }
      acc[key].dashX += item.dashX
      acc[key].dashPass += item.dashPass
      return acc
    },
    {} as Record<string, { year: number; dashX: number; dashPass: number }>,
  )

  return Object.values(grouped)
    .sort((a, b) => a.year - b.year)
    .map((item) => ({
      month: item.year.toString(),
      dashX: item.dashX,
      dashPass: item.dashPass,
    }))
}

// Mock data for vendor gift cards performance (only DashX and DashPass)
const MOCK_VENDOR_QARDS_PERFORMANCE: QardsPerformanceData[] = [
  {
    period_key: '2024-01',
    dashx_amount: 18900.25,
    dashpass_amount: 8750.0,
  },
  {
    period_key: '2024-02',
    dashx_amount: 22100.5,
    dashpass_amount: 10200.25,
  },
  {
    period_key: '2024-03',
    dashx_amount: 26500.75,
    dashpass_amount: 11800.5,
  },
  {
    period_key: '2024-04',
    dashx_amount: 24300.5,
    dashpass_amount: 9800.0,
  },
  {
    period_key: '2024-05',
    dashx_amount: 28900.25,
    dashpass_amount: 13200.75,
  },
  {
    period_key: '2024-06',
    dashx_amount: 31200.5,
    dashpass_amount: 14500.25,
  },
]

const LEGEND_ITEMS = [
  { key: 'dashX' as const, label: 'DashX', color: '#402D87' },
  { key: 'dashPass' as const, label: 'DashPass', color: '#ED186A' },
]

const TIMEFRAME_OPTIONS: TimeframeOption[] = ['Monthly', 'Quarterly', 'Yearly']

type TooltipProps = {
  active?: boolean
  payload?: { value: number; dataKey: keyof ChartDatum }[]
  label?: string
}

function QardsTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null

  const labelMap: Record<string, string> = {
    dashX: 'DashX',
    dashPass: 'DashPass',
  }

  return (
    <div className="rounded-2xl border border-[#E4E7EC] bg-white px-4 py-3 text-xs shadow-md">
      <p className="text-[#98A2B3]">{label}</p>
      {payload.map((item) => (
        <p key={`${item.dataKey}-${label}`} className="font-semibold text-[#101828]">
          {formatCurrency(item.value)}{' '}
          <span className="capitalize text-[#98A2B3]">
            {labelMap[item.dataKey as string] || item.dataKey}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function VendorQardsPerformance() {
  const [timeframe, setTimeframe] = React.useState<TimeframeOption>('Monthly')
  const [isLoading] = React.useState(false)

  const dropdownActions = React.useMemo(
    () =>
      TIMEFRAME_OPTIONS.map((option) => ({
        label: option,
        onClickFn: () => setTimeframe(option),
      })),
    [],
  )

  const data = React.useMemo(() => {
    // Use mock data - TODO: Replace with actual API call for vendor performance
    return transformToChartData(MOCK_VENDOR_QARDS_PERFORMANCE, timeframe)
  }, [timeframe])

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-[#EEEEF1] bg-white p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Text variant="h6" weight="semibold" className="text-[#212123]">
          Cards Performance
        </Text>

        <Dropdown actions={dropdownActions}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[6px] border border-[#E4E7EC] bg-white px-4 py-2 text-sm text-[#7C8689]"
          >
            {timeframe}
            <Icon icon="lucide:chevron-down" className="size-4 text-[#98A2B3]" />
          </button>
        </Dropdown>
      </header>

      <div className="h-[320px] w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            No performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%" barGap={8} stackOffset="sign">
              <CartesianGrid stroke="#F0F2F5" strokeDasharray="4 8" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#98A2B3', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#98A2B3', fontSize: 12 }}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : value.toString()
                }
              />
              <Tooltip cursor={{ fill: 'rgba(79,114,205,0.06)' }} content={<QardsTooltip />} />
              <Bar dataKey="dashX" stackId="qards" fill="#402D87" />
              <Bar dataKey="dashPass" stackId="qards" fill="#ED186A" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        {LEGEND_ITEMS.map((legend) => (
          <div key={legend.key} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: legend.color }}
            />
            <span className="text-[#475467]">{legend.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
