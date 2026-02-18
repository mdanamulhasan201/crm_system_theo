'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import {
  GESAMTKOSTEN_EINLAGE_BREAKDOWN,
  GESAMTKOSTEN_PRO_EINLAGE_TOTAL,
  GESAMTKOSTEN_EINLAGE_CENTER
} from '../data/page-2-data'

export default function GesamtkostenProEinlageCard () {
  const data = GESAMTKOSTEN_EINLAGE_BREAKDOWN.map(d => ({
    name: d.name,
    value: d.value,
    color: d.color,
    percent: d.percent
  }))

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
      <h3 className='font-bold text-gray-900 text-base mb-4'>
        Gesamtkosten pro Einlage = {GESAMTKOSTEN_PRO_EINLAGE_TOTAL}
      </h3>
      <div className='relative flex flex-col items-center'>
        <ResponsiveContainer width='100%' height={220}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius='58%'
              outerRadius='88%'
              paddingAngle={1}
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
          <span className='text-lg font-bold text-gray-900'>
            {GESAMTKOSTEN_EINLAGE_CENTER.value}
          </span>
          <span className='text-sm text-gray-600'>
            {GESAMTKOSTEN_EINLAGE_CENTER.sub}
          </span>
          <span className='text-sm font-semibold text-gray-700'>
            {GESAMTKOSTEN_EINLAGE_CENTER.percent}
          </span>
        </div>
      </div>
      <ul className='mt-4 space-y-2'>
        {GESAMTKOSTEN_EINLAGE_BREAKDOWN.map((row, i) => (
          <li key={i} className='flex items-center justify-between text-sm'>
            <span className='flex items-center gap-2'>
              <span
                className='w-2.5 h-2.5 rounded-full shrink-0'
                style={{ backgroundColor: row.color }}
              />
              {row.name}
            </span>
            <span className='text-gray-700'>
              {row.value.toLocaleString('de-DE')} € ({row.percent}%)
            </span>
          </li>
        ))}
      </ul>
      <p className='text-right text-sm font-bold text-gray-900 mt-3'>
        {GESAMTKOSTEN_PRO_EINLAGE_TOTAL} Gesamt
      </p>
    </div>
  )
}
