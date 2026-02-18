'use client'

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import { EINLAGENKATEGORIE_TOP3 } from '../data/page-2-data'

const GREEN = '#36A866'

export default function EinlagenkategorieTop3Chart () {
  const data = EINLAGENKATEGORIE_TOP3.map(d => ({
    name: d.name,
    value: d.value
  }))

  return (
    <ResponsiveContainer width='100%' height={200}>
      <BarChart
        layout='vertical'
        data={data}
        margin={{ top: 4, right: 36, left: 0, bottom: 4 }}
      >
        <XAxis
          type='number'
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type='category'
          dataKey='name'
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Bar dataKey='value' fill={GREEN} radius={[0, 4, 4, 0]} maxBarSize={32}>
          <LabelList
            dataKey='value'
            position='right'
            fontSize={12}
            fill='#374151'
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
