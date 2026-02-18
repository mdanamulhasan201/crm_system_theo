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
import { PREISENTWICKLUNG } from '../data/page-4-data'

const COLORS = {
  orthMuller: '#2563eb',
  lederwelt: '#0d9488',
  schaumTech: '#f97316',
  renia: '#8b5cf6'
}

const SERIES = [
  { key: 'orthMuller', label: 'Orth. Müller', color: COLORS.orthMuller },
  { key: 'lederwelt', label: 'Lederwelt', color: COLORS.lederwelt },
  { key: 'schaumTech', label: 'SchaumTech', color: COLORS.schaumTech },
  { key: 'renia', label: 'Renia', color: COLORS.renia }
] as const

export default function PreisentwicklungChart () {
  const data = PREISENTWICKLUNG.map(d => ({ ...d }))

  return (
    <>
      <div className='flex flex-wrap gap-4 mb-2'>
        {SERIES.map(s => (
          <span
            key={s.key}
            className='flex items-center gap-2 text-sm text-gray-600'
          >
            <span
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
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
            domain={[0, 160]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={v => `${v}€`}
          />
          <Tooltip
            formatter={(v: number) => [`${v} €`, '']}
            contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
            labelFormatter={l => l}
          />
          {SERIES.map(s => (
            <Line
              key={s.key}
              type='monotone'
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ fill: s.color, r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
