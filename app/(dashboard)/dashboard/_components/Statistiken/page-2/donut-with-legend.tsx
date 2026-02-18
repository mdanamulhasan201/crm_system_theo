'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

type DonutWithLegendProps = {
  data: readonly { name: string; value: number; color: string }[]
}

export default function DonutWithLegend ({ data }: DonutWithLegendProps) {
  const chartData = data.map(d => ({
    name: d.name,
    value: d.value,
    color: d.color
  }))

  return (
    <div className='flex flex-col'>
      <ResponsiveContainer width='100%' height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            innerRadius='55%'
            outerRadius='85%'
            paddingAngle={2}
            dataKey='value'
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className='flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2'>
        {chartData.map((d, i) => (
          <div
            key={i}
            className='flex items-center gap-2 text-sm text-gray-600'
          >
            <span
              className='w-3 h-3 rounded-full shrink-0'
              style={{ backgroundColor: d.color }}
            />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  )
}
