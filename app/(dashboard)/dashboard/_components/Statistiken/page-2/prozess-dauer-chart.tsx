'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { PROZESS_DAUER } from '../data/page-2-data'

const GREEN = '#36A866'

export default function ProzessDauerChart () {
  const data = PROZESS_DAUER.map(d => ({ ...d }))

  return (
    <ResponsiveContainer width='100%' height={220}>
      <BarChart
        layout='vertical'
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
      >
        <XAxis
          type='number'
          domain={[0, 4]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}`}
        />
        <YAxis
          type='category'
          dataKey='name'
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Bar
          dataKey='minuten'
          name='Minuten'
          fill={GREEN}
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
