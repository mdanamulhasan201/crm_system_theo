'use client'

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import { SPORT_SHARE } from '../data/page-2-data'

const GREEN = '#36A866'

export default function SportShareChart () {
  const data = SPORT_SHARE.map(d => ({ name: d.name, value: d.value }))

  return (
    <ResponsiveContainer width='100%' height={220}>
      <BarChart
        layout='vertical'
        data={data}
        margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
      >
        <XAxis
          type='number'
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}%`}
        />
        <YAxis
          type='category'
          dataKey='name'
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Bar dataKey='value' fill={GREEN} radius={[0, 4, 4, 0]} maxBarSize={24}>
          <LabelList dataKey='value' position='right' formatter={(v: number) => `${v}%`} fontSize={12} fill='#374151' />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
