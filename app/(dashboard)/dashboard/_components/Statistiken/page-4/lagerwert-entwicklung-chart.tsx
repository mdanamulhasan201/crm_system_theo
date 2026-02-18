'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { LAGERWERT_ENTWICKLUNG } from '../data/page-4-data'

const BLUE = '#2563eb'
const ORANGE = '#f97316'

export default function LagerwertEntwicklungChart () {
  const data = LAGERWERT_ENTWICKLUNG.map(d => ({ ...d }))

  return (
    <>
      <div className='flex flex-wrap gap-4 mb-2'>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: BLUE }}
          />
          Aktuell
        </span>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full border-2 border-dashed'
            style={{ borderColor: ORANGE }}
          />
          Vorperiode
        </span>
      </div>
      <ResponsiveContainer width='100%' height={240}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis
            dataKey='month'
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            height={32}
          />
          <YAxis
            domain={[0, 100]}
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
          <Line
            type='monotone'
            dataKey='aktuell'
            stroke={BLUE}
            strokeWidth={2}
            dot={{ fill: BLUE, r: 3 }}
          />
          <Line
            type='monotone'
            dataKey='vorperiode'
            stroke={ORANGE}
            strokeWidth={2}
            strokeDasharray='5 5'
            dot={{ fill: ORANGE, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
