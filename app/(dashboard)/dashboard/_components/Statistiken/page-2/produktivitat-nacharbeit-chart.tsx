'use client'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import { PRODUKTIVITAT_NACHARBEIT } from '../data/page-2-data'

const GREEN = '#36A866'
const RED = '#ef4444'

export default function ProduktivitatNacharbeitChart () {
  const data = PRODUKTIVITAT_NACHARBEIT.map(d => ({
    name: d.name,
    produktivitaet: d.produktivitaet,
    nacharbeit: d.nacharbeit
  }))

  return (
    <>
      <div className='flex flex-wrap gap-4 mb-3 pb-9'>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: GREEN }}
          />
          Gefertigte Einlagen
        </span>
        <span className='flex items-center gap-2 text-sm text-gray-600'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: RED }}
          />
          Nachversorgung
        </span>
      </div>
      <ResponsiveContainer width='100%' height={220}>
        <BarChart
          layout='vertical'
          data={data}
          margin={{ top: 4, right: 8, left: 48, bottom: 4 }}
        >
          <XAxis
            type='number'
            domain={[0, 40]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type='category'
            dataKey='name'
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Bar
            dataKey='produktivitaet'
            name='Gefertigte Einlagen'
            stackId='stack'
            fill={GREEN}
            radius={[0, 0, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey='nacharbeit'
            name='Nachversorgung'
            stackId='stack'
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={RED} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
