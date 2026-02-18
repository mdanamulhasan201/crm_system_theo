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
import {
  ABWESENHEIT_VS_PRODUKTIVITAET,
  ABWESENHEIT_PRODUKTIVITAET_BUBBLES
} from '../data/page-3-data'

const GREY = '#9ca3af'
const GREEN = '#36A866'

export default function AbwesenheitVsProduktivitaetChart () {
  const data = ABWESENHEIT_VS_PRODUKTIVITAET.map(d => ({ ...d }))

  return (
    <div className='flex flex-col sm:flex-row gap-4'>
      <div className='flex-1 min-w-0'>
        <div className='flex flex-wrap gap-4 mb-2'>
          <span className='flex items-center gap-2 text-xs text-gray-600'>
            <span
              className='w-3 h-3 rounded-full border-2 border-dashed'
              style={{ borderColor: GREY }}
            />
            Produktivität
          </span>
          <span className='flex items-center gap-2 text-xs text-gray-600'>
            <span
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: GREEN }}
            />
            Abwesenheit
          </span>
        </div>
        <ResponsiveContainer width='100%' height={200}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis
              dataKey='month'
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              height={28}
            />
            <YAxis
              domain={[0, 15]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={28}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip
              formatter={(v: number) => [`${v}%`, '']}
              contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <Line
              type='monotone'
              dataKey='produktivitaet'
              stroke={GREY}
              strokeWidth={2}
              strokeDasharray='5 5'
              dot={{ r: 3 }}
            />
            <Line
              type='monotone'
              dataKey='abwesenheit'
              stroke={GREEN}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className='flex flex-col gap-2 sm:w-48 shrink-0'>
        {ABWESENHEIT_PRODUKTIVITAET_BUBBLES.map((text, i) => (
          <div
            key={i}
            className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700'
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
