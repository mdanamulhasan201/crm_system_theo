'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { PRODUKTION_ABWESENHEIT } from '../data/page-3-data'

const GREY = '#9ca3af'
const GREEN = '#36A866'

export default function ProduktionAbwesenheitChart () {
  const data = PRODUKTION_ABWESENHEIT.map(d => ({ ...d }))

  return (
    <>
      <div className='flex flex-wrap gap-4 mb-2'>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full border-2 border-dashed'
            style={{ borderColor: GREY }}
          />
          Fertigungen
        </span>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: GREEN }}
          />
          Abwesenheit
        </span>
      </div>
      <ResponsiveContainer width='100%' height={260}>
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
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
            formatter={(value: number, name: string) => [
              value,
              name === 'fertigungen' ? 'Fertigungen' : 'Abwesenheit'
            ]}
          />
          <ReferenceArea x1='Apr' x2='Mai' fill='#fda4af' fillOpacity={0.4} />
          <Line
            type='monotone'
            dataKey='fertigungen'
            stroke={GREY}
            strokeWidth={2}
            strokeDasharray='5 5'
            dot={{ fill: GREY, r: 3 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey='abwesenheit'
            stroke={GREEN}
            strokeWidth={2}
            dot={{ fill: GREEN, r: 3 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className='flex justify-center -mt-2'>
        <span className='text-xs font-medium text-rose-400 bg-rose-50 px-2 py-0.5 rounded'>
          +18% -12%
        </span>
      </div>
    </>
  )
}
