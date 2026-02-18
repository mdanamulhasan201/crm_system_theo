'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { BOTTLENECK_DATA, BOTTLENECK_CENTER } from '../data/page-2-data'

export default function BottleneckDonutChart () {
  const data = BOTTLENECK_DATA.map(d => ({
    name: d.name,
    value: d.value,
    color: d.color
  }))

  return (
    <div className='flex flex-col items-center'>
      <div className='relative w-full' style={{ height: 200 }}>
        <ResponsiveContainer width='100%' height={200}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius='55%'
              outerRadius='85%'
              paddingAngle={2}
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <p className='text-sm font-semibold text-gray-900 text-center px-4'>
            {BOTTLENECK_CENTER.label}
          </p>
        </div>
      </div>
      <p className='text-sm text-gray-600 mt-2'>{BOTTLENECK_CENTER.percent}</p>
    </div>
  )
}
