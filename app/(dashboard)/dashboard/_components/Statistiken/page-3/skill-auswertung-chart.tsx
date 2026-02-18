'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { SKILL_AUSWERTUNG, SKILL_LEGEND } from '../data/page-3-data'

const COLORS = {
  einlagen: '#1a5f3a',
  masschuhe: '#36A866',
  versorgung: '#0d9488',
  aussendienst: '#b8e6ce'
}

export default function SkillAuswertungChart () {
  const data = SKILL_AUSWERTUNG.map(d => ({
    name: d.name,
    einlagen: d.einlagen,
    masschuhe: d.masschuhe,
    versorgung: d.versorgung,
    aussendienst: d.aussendienst
  }))

  return (
    <div className='flex flex-col'>
      <div className='flex flex-wrap gap-4 mb-3'>
        {SKILL_LEGEND.map((l, i) => (
          <span
            key={i}
            className='flex items-center gap-2 text-xs text-gray-600'
          >
            <span
              className='w-3 h-3 rounded-sm shrink-0'
              style={{ backgroundColor: l.color }}
            />
            {l.name}
          </span>
        ))}
      </div>
      <ResponsiveContainer width='100%' height={280}>
        <BarChart
          layout='vertical'
          data={data}
          margin={{ top: 4, right: 8, left: 48, bottom: 4 }}
        >
          <XAxis
            type='number'
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type='category'
            dataKey='name'
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Bar
            dataKey='einlagen'
            stackId='stack'
            fill={COLORS.einlagen}
            radius={[0, 0, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey='masschuhe'
            stackId='stack'
            fill={COLORS.masschuhe}
            radius={[0, 0, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey='versorgung'
            stackId='stack'
            fill={COLORS.versorgung}
            radius={[0, 0, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey='aussendienst'
            stackId='stack'
            fill={COLORS.aussendienst}
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
