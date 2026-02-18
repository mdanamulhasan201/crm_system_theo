'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  BESTELLSTATUS_ABWESENHEIT,
  BESTELLSTATUS_ABWESENHEIT_INSIGHT
} from '../data/page-3-data'

const COLORS = {
  urlaub: '#36A866',
  krank: '#1a5f3a',
  fortbildung: '#ef4444'
}

export default function BestellstatusAbwesenheitChart () {
  const data = BESTELLSTATUS_ABWESENHEIT.map(d => ({ ...d }))

  return (
    <div className='flex flex-col lg:flex-row gap-4'>
      <div className='flex-1 min-w-0'>
        <div className='flex flex-wrap gap-4 mb-2'>
          <span className='flex items-center gap-2 text-xs text-gray-600'>
            <span
              className='w-3 h-3 rounded-sm'
              style={{ backgroundColor: COLORS.urlaub }}
            />
            Urlaub
          </span>
          <span className='flex items-center gap-2 text-xs text-gray-600'>
            <span
              className='w-3 h-3 rounded-sm'
              style={{ backgroundColor: COLORS.krank }}
            />
            Krank
          </span>
          <span className='flex items-center gap-2 text-xs text-gray-600'>
            <span
              className='w-3 h-3 rounded-sm'
              style={{ backgroundColor: COLORS.fortbildung }}
            />
            Fortbildung
          </span>
        </div>
        <ResponsiveContainer width='100%' height={220}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <XAxis
              dataKey='month'
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              height={28}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <Bar
              dataKey='urlaub'
              stackId='stack'
              fill={COLORS.urlaub}
              radius={[0, 0, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey='krank'
              stackId='stack'
              fill={COLORS.krank}
              radius={[0, 0, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey='fortbildung'
              stackId='stack'
              fill={COLORS.fortbildung}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className='lg:w-48 shrink-0 bg-gray-100 rounded-lg p-3 flex items-start'>
        <p className='text-xs text-gray-600'>
          {BESTELLSTATUS_ABWESENHEIT_INSIGHT}
        </p>
      </div>
    </div>
  )
}
