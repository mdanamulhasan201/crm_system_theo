'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import {
  DAUER_ARBEITSSCHRITT,
  BOTTLENECK_STEP,
  BOTTLENECK_LABEL,
  BOTTLENECK_SUB
} from '../data/page-3-data'

const SOLL_COLOR = '#d1d5db'
const IST_COLOR = '#36A866'
const BOTTLENECK_COLOR = '#ef4444'

export default function DauerArbeitsschrittChart () {
  const data = DAUER_ARBEITSSCHRITT.map(d => ({
    ...d,
    istColor: d.step === BOTTLENECK_STEP ? BOTTLENECK_COLOR : IST_COLOR
  }))

  const bottleneckIndex = data.findIndex(d => d.step === BOTTLENECK_STEP)

  return (
    <div className='relative'>
      {bottleneckIndex >= 0 && (
        <div
          className='absolute left-0 right-0 flex justify-center -top-2 z-10'
          style={{
            transform: `translateX(${
              (bottleneckIndex / (data.length - 1)) * 100 - 50
            }%)`
          }}
        >
          <div className='bg-white border-2 border-red-200 rounded-lg px-3 py-2 shadow-md flex items-center gap-2'>
            <span className='text-red-500' aria-hidden>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </span>
            <div className='text-left'>
              <p className='font-semibold text-gray-900 text-sm'>
                Bottleneck aktiv
              </p>
              <p className='text-xs text-gray-600'>{BOTTLENECK_STEP}</p>
              <p className='font-bold text-gray-900'>{BOTTLENECK_LABEL}</p>
              <p className='text-xs text-red-600'>{BOTTLENECK_SUB}</p>
            </div>
          </div>
        </div>
      )}
      <ResponsiveContainer width='100%' height={220}>
        <BarChart
          data={data}
          margin={{ top: 56, right: 8, left: 0, bottom: 8 }}
          barGap={0}
          barCategoryGap='12%'
        >
          <CartesianGrid
            strokeDasharray='0'
            stroke='#e5e7eb'
            vertical={false}
          />
          <XAxis
            dataKey='step'
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            height={48}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={28}
            tickFormatter={v => `${v}h`}
          />
          <Bar
            dataKey='soll'
            name='Soll'
            fill={SOLL_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar dataKey='ist' name='Ist' radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.istColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
