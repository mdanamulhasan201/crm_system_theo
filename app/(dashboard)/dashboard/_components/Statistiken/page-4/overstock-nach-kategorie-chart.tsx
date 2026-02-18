'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { OVERSTOCK_NACH_KATEGORIE } from '../data/page-4-data'

const ORANGE = '#f97316'

export default function OverstockNachKategorieChart () {
  const data = OVERSTOCK_NACH_KATEGORIE.map(d => ({ ...d }))

  return (
    <ResponsiveContainer width='100%' height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='#e5e7eb'
          vertical={false}
        />
        <XAxis
          dataKey='name'
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          height={40}
        />
        <YAxis
          domain={[0, 4.5]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={v => `${v.toFixed(1)}k`}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)}k €`, 'Wert']}
          contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <Bar
          dataKey='value'
          fill={ORANGE}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
