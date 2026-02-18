'use client'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import { KOSTEN_GEWINN_CATEGORIES } from '../data/page-2-data'

export default function KostenGewinnAnalyse () {
  const data = KOSTEN_GEWINN_CATEGORIES.map(({ name, value, color }) => ({
    name,
    value,
    color
  }))

  return (
    <>
      <ResponsiveContainer width='100%' height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <XAxis
            dataKey='name'
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            height={40}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Bar
            dataKey='value'
            name='Wert'
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
