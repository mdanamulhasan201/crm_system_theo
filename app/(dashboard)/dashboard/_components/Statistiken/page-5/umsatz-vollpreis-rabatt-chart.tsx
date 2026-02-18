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
import { UMSATZ_VOLLPREIS_RABATT } from '../data/page-5-data'

const BLUE = '#2563eb'
const RED = '#ef4444'

export default function UmsatzVollpreisRabattChart () {
  const data = UMSATZ_VOLLPREIS_RABATT.map(d => ({ ...d }))

  return (
    <>
      <ResponsiveContainer width='100%' height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#e5e7eb'
            vertical={false}
          />
          <XAxis
            dataKey='month'
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            height={32}
          />
          <YAxis
            domain={[0, 60]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={v => `${v}k`}
          />
          <Tooltip
            formatter={(v: number) => [`${v}k €`, '']}
            contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
            labelFormatter={l => l}
          />
          <Bar
            dataKey='vollpreis'
            name='Vollpreis'
            stackId='stack'
            fill={BLUE}
            radius={[0, 0, 0, 0]}
            maxBarSize={48}
          />
          <Bar
            dataKey='rabatt'
            name='Rabatt'
            stackId='stack'
            fill={RED}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className='flex flex-wrap gap-6 mt-2'>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm shrink-0'
            style={{ backgroundColor: BLUE }}
          />
          Vollpreis
        </span>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm shrink-0'
            style={{ backgroundColor: RED }}
          />
          Rabatt
        </span>
      </div>
    </>
  )
}
