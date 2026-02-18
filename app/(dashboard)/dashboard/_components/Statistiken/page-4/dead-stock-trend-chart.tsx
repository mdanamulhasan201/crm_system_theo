'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { DEAD_STOCK_TREND } from '../data/page-4-data'

const RED = '#ef4444'

export default function DeadStockTrendChart () {
  const data = DEAD_STOCK_TREND.map(d => ({ ...d }))

  return (
    <ResponsiveContainer width='100%' height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id='areaDeadStock' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={RED} stopOpacity={0.35} />
            <stop offset='100%' stopColor={RED} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis
          dataKey='month'
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          height={32}
        />
        <YAxis
          domain={[0, 6]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={v => `${v.toFixed(1)}k`}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)}k €`, '']}
          contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <Area
          type='monotone'
          dataKey='value'
          stroke={RED}
          strokeWidth={2}
          fill='url(#areaDeadStock)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
