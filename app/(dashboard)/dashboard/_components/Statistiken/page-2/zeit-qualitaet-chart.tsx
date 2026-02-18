'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { EMPLOYEE_TIME_QUALITY } from '../data/page-2-data'

const COLORS = ['#36A866', '#36A866', '#36A866', '#36A866']

export default function ZeitQualitaetChart () {
  const scatterData = EMPLOYEE_TIME_QUALITY.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length]
  }))
  const barData = EMPLOYEE_TIME_QUALITY.map((d, i) => ({
    name: d.name,
    time: d.time,
    fill: COLORS[i % COLORS.length]
  }))

  return (
    <div className='space-y-6'>
      <div className='min-h-[220px]'>
        <p className='text-xs text-gray-500 mb-2'>
          Qualitätsquote (%) vs. Ø Bearbeitungszeit (min)
        </p>
        <ResponsiveContainer width='100%' height={200}>
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis
              type='number'
              dataKey='time'
              name='Zeit'
              domain={[25, 55]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Ø Bearbeitungszeit pro Einlage (min)',
                position: 'bottom',
                fontSize: 10
              }}
            />
            <YAxis
              type='number'
              dataKey='quality'
              name='Qualität'
              domain={[82, 100]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Qualitätsquote (%)',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(
                value: number,
                name: string,
                props: { payload?: { name: string } }
              ) => [
                value,
                name === 'time' ? 'Min' : props.payload?.name ?? name
              ]}
            />
            <Scatter data={scatterData} fill='#0b80b7'>
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className='flex flex-wrap gap-4 mt-1 justify-center'>
          {EMPLOYEE_TIME_QUALITY.map((d, i) => (
            <span key={d.name} className='flex items-center gap-1.5 text-xs'>
              <span
                className='w-2.5 h-2.5 rounded-full'
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {d.name}
            </span>
          ))}
        </div>
      </div>
      <div className='min-h-[140px]'>
        <p className='text-xs text-gray-500 mb-2'>
          Ø Bearbeitungszeit pro Einlage (min)
        </p>
        <ResponsiveContainer width='100%' height={120}>
          <BarChart
            layout='vertical'
            data={barData}
            margin={{ top: 4, right: 8, left: 32, bottom: 4 }}
          >
            <XAxis type='number' hide />
            <YAxis
              type='category'
              dataKey='name'
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Bar dataKey='time' radius={[0, 4, 4, 0]} maxBarSize={20}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
