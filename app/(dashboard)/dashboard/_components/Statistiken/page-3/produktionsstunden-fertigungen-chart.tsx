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
import { PRODUKTIONSSTUNDEN_FERTIGUNGEN } from '../data/page-3-data'

const GREEN = '#36A866'
const GREY = '#d1d5db'

export default function ProduktionsstundenFertigungenChart () {
  const data = PRODUKTIONSSTUNDEN_FERTIGUNGEN.map(d => ({ ...d }))

  return (
    <ResponsiveContainer width='100%' height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray='0' stroke='#e5e7eb' vertical={false} />
        <XAxis
          dataKey='month'
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          height={32}
        />
        <YAxis
          domain={[0, 150]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
          formatter={(value: number, name: string) => [
            value,
            name === 'produktionsstunden' ? 'Produktionsstunden' : 'Fertigungen'
          ]}
        />
        <Bar
          dataKey='produktionsstunden'
          stackId='stack'
          fill={GREEN}
          radius={[0, 0, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey='fertigungen'
          stackId='stack'
          fill={GREY}
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
