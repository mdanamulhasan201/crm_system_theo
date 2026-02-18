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
import { GESAMTKOSTEN_UMSATZ_MONAT } from '../data/page-2-data'

const GREY = '#9ca3af'
const GREEN = '#36A866'

export default function GesamtkostenUmsatzMonatChart () {
  const data = GESAMTKOSTEN_UMSATZ_MONAT.map(d => ({ ...d }))

  return (
    <>
      <div className='flex flex-wrap gap-6 mb-2'>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: GREY }}
          />
          Gesamtkosten
        </span>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: GREEN }}
          />
          Umsatz
        </span>
      </div>
      <ResponsiveContainer width='100%' height={280}>
        <LineChart
          data={data}
          margin={{ top: 24, right: 8, left: 0, bottom: 8 }}
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
            domain={[40, 120]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={v => `${v}K`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}K`,
              name === 'gesamtkosten' ? 'Gesamtkosten' : 'Umsatz'
            ]}
            contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <Line
            type='monotone'
            dataKey='gesamtkosten'
            name='Gesamtkosten'
            stroke={GREY}
            strokeWidth={2}
            dot={{ fill: GREY, r: 3 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey='umsatz'
            name='Umsatz'
            stroke={GREEN}
            strokeWidth={2}
            dot={{ fill: GREEN, r: 3 }}
            activeDot={{ r: 4 }}
          />
          <ReferenceDot
            x='Jul'
            y={72}
            r={0}
            label={{
              value: '+18 % Marge im Juli',
              position: 'top',
              fill: '#36A866',
              fontSize: 11,
              fontWeight: 600
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
