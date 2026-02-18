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
import { useDashboard } from '../dashboard-context'
import {
  getVollpreisVsRabattData,
  type PeriodDays
} from '../data/dashboard-data'

const GREEN = '#1abc9c'
const ORANGE = '#f59f0a'
const BAR_RADIUS = 6

export default function VollpreisVsRabattChart () {
  const { periodDays } = useDashboard()
  const data = getVollpreisVsRabattData(periodDays as PeriodDays)

  return (
    <>
      <ResponsiveContainer width='100%' height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray='0'
            stroke='#e5e7eb'
            vertical={false}
          />
          <XAxis
            dataKey='label'
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            height={36}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}k`}
            width={32}
          />
          <Tooltip
            formatter={(value: any) => {
              const numValue = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : null);
              return [
                numValue != null ? `${numValue}k` : '',
                ''
              ];
            }}
            contentStyle={{
              borderRadius: 6,
              border: '1px solid #e5e7eb'
            }}
            labelFormatter={label => label}
          />
          <Bar
            dataKey='vollpreis'
            name='Vollpreis'
            stackId='a'
            fill={GREEN}
            radius={[0, 0, 0, 0]}
            maxBarSize={52}
          />
          <Bar
            dataKey='rabatt'
            name='Rabatt'
            stackId='a'
            fill={ORANGE}
            radius={[BAR_RADIUS, BAR_RADIUS, 0, 0]}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className='flex flex-wrap gap-6 mt-2'>
        <div className='flex items-center gap-2'>
          <span className='w-3 h-3 rounded-sm bg-[#22c55e]' />
          <span className='text-sm text-gray-600'>Vollpreis</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='w-3 h-3 rounded-sm bg-[#f97316]' />
          <span className='text-sm text-gray-600'>Rabatt</span>
        </div>
      </div>
    </>
  )
}
