'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

const LABEL_LINE_STROKE = '#93c5fd'
const RADIAN = Math.PI / 180

function renderLabel (props: PieLabelRenderProps) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name, value } = props
  const cxNum = typeof cx === 'number' ? cx : Number(cx) || 0
  const cyNum = typeof cy === 'number' ? cy : Number(cy) || 0
  const midAngleNum = typeof midAngle === 'number' ? midAngle : Number(midAngle) || 0
  const outerRadiusNum = typeof outerRadius === 'number' ? outerRadius : Number(outerRadius) || 0
  const radius = outerRadiusNum + 28
  const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN)
  const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN)
  const textAnchor = x >= cxNum ? 'start' : 'end'

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline='central'
      className='fill-gray-700 text-sm font-medium'
    >
      {name} ({value}%)
    </text>
  )
}

type Props = {
  data: readonly { name: string; value: number; color: string }[]
}

export default function ZahlungsartenDonutChart ({ data }: Props) {
  const chartData = data.map(d => ({
    name: d.name,
    value: d.value,
    color: d.color
  }))

  return (
    <ResponsiveContainer width='100%' height={360}>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          innerRadius='55%'
          outerRadius='85%'
          paddingAngle={2}
          dataKey='value'
          label={renderLabel}
          labelLine={{
            stroke: LABEL_LINE_STROKE,
            strokeWidth: 1
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
