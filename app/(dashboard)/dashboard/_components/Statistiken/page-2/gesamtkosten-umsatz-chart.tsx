'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot
} from 'recharts'
import { FEHLERQUOTE_12_MONATE } from '../data/page-2-data' 

const GREEN = '#36A866'
const RED = '#ef4444'

export default function GesamtkostenUmsatzChart () {
  const data = FEHLERQUOTE_12_MONATE.map(d => ({ ...d }))

  return (
    <>
      <p className='text-xs text-gray-500 mb-2'>
        Fehlerquote letzte 12 Monate = 4,2%
      </p>
      <div className='flex flex-wrap gap-4 mb-2'>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: GREEN }}
          />
          Fehlerquote
        </span>
      </div>
      <ResponsiveContainer width='100%' height={220}>
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
            domain={[2, 6]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={28}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Fehlerquote']}
            contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <Line
            type='monotone'
            dataKey='fehlerquote'
            name='Fehlerquote'
            stroke={GREEN}
            strokeWidth={2}
            dot={{ fill: GREEN, r: 3 }}
            activeDot={{ r: 4 }}
          />
          <ReferenceDot x='Mai' y={4.2} r={5} fill={RED} stroke={RED} />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
