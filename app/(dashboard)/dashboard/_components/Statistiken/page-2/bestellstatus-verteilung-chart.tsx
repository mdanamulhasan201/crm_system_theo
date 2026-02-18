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
import { BESTELLSTATUS_MONAT } from '../data/page-2-data'

const COLORS = {
  materialkosten: '#1a5f3a',
  zeitkosten: '#36A866',
  fixkosten: '#7dd3a8',
  logistik: '#b8e6ce'
}

export default function BestellstatusVerteilungChart () {
  const data = BESTELLSTATUS_MONAT.map(d => ({ ...d }))

  return (
    <>
      <div className='flex flex-wrap gap-4 mb-3'>
        <span className='flex items-center gap-2 text-xs text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{ backgroundColor: COLORS.materialkosten }}
          />
          Materialkosten
        </span>
        <span className='flex items-center gap-2 text-xs text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{ backgroundColor: COLORS.zeitkosten }}
          />
          Zeitkosten
        </span>
        <span className='flex items-center gap-2 text-xs text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{ backgroundColor: COLORS.fixkosten }}
          />
          Fixkosten
        </span>
        <span className='flex items-center gap-2 text-xs text-gray-600'>
          <span
            className='w-3 h-3 rounded-sm'
            style={{ backgroundColor: COLORS.logistik }}
          />
          Logistik
        </span>
      </div>
      <ResponsiveContainer width='100%' height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid
            strokeDasharray='0'
            stroke='#e5e7eb'
            vertical={false}
          />
          <XAxis
            dataKey='month'
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            height={32}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={v => `${v}K`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}K`, name]}
            contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb' }}
            labelFormatter={label => label}
          />
          <Bar
            dataKey='materialkosten'
            stackId='stack'
            fill={COLORS.materialkosten}
            radius={[0, 0, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey='zeitkosten'
            stackId='stack'
            fill={COLORS.zeitkosten}
            radius={[0, 0, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey='fixkosten'
            stackId='stack'
            fill={COLORS.fixkosten}
            radius={[0, 0, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey='logistik'
            stackId='stack'
            fill={COLORS.logistik}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className='text-xs text-gray-500 mt-2'>
        Monat · Gesamtkosten · Material % · Zeit % · Fixkosten %
      </p>
    </>
  )
}
