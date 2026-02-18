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
import { UEBERDURCHSCHNITTLICH_JULI } from '../data/page-3-data'

const URLAUB_COLOR = '#99DEAC'
const KRANK_COLOR = '#1a5f3a'

export default function UeberdurchschnittlichJuliChart () {
  const data = UEBERDURCHSCHNITTLICH_JULI.map(d => ({ ...d }))

  return (
    <>
      <div className='flex flex-wrap gap-4 mb-2'>
        <span className='flex items-center gap-2 text-xs text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{ backgroundColor: URLAUB_COLOR }}
          />
          Urlaub
        </span>
        <span className='flex items-center gap-2 text-xs text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{ backgroundColor: KRANK_COLOR }}
          />
          Krank
        </span>
      </div>
      <ResponsiveContainer width='100%' height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#e5e7eb'
            vertical={false}
          />
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
            fill={URLAUB_COLOR}
            radius={[0, 0, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey='krank'
            stackId='stack'
            fill={KRANK_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
