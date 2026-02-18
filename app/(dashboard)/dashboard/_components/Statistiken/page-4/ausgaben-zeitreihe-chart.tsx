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
import { AUSGABEN_ZEITREIHE } from '../data/page-4-data'

const ORANGE = '#f97316'

export default function AusgabenZeitreiheChart () {
  const data = AUSGABEN_ZEITREIHE.map(d => ({ ...d }))

  return (
    <ResponsiveContainer width='100%' height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id='areaOrange' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={ORANGE} stopOpacity={0.4} />
            <stop offset='100%' stopColor={ORANGE} stopOpacity={0} />
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
          domain={[0, 20]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={v => `${v}k`}
        />
        <Tooltip
          formatter={(v: number) => [`${v}k`, '']}
          contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <Area
          type='monotone'
          dataKey='value'
          stroke={ORANGE}
          strokeWidth={2}
          fill='url(#areaOrange)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
