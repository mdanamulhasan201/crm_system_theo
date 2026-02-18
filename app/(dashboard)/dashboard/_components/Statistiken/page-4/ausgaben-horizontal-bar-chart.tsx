'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

type DataItem = { name: string; value: number }

type Props = {
  data: readonly DataItem[]
  barColor: string
  maxDomain?: number
}

export default function AusgabenHorizontalBarChart ({
  data,
  barColor,
  maxDomain = 6
}: Props) {
  const chartData = data.map(d => ({ name: d.name, value: d.value }))

  return (
    <ResponsiveContainer width='100%' height={260}>
      <BarChart
        layout='vertical'
        data={chartData}
        margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
      >
        <XAxis
          type='number'
          domain={[0, maxDomain]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v.toFixed(1)}k`}
        />
        <YAxis
          type='category'
          dataKey='name'
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Bar
          dataKey='value'
          fill={barColor}
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
