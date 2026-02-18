'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const GREEN = '#36A866'

type ReklamationsquoteMitarbeiterProps = {
  title: string
  data: readonly { name: string; quote: number }[]
  className?: string
}

export default function ReklamationsquoteMitarbeiter ({
  title,
  data,
  className
}: ReklamationsquoteMitarbeiterProps) {
  const chartData = data.map((d, i) => ({
    name: d.name,
    quote: d.quote,
    index: i
  }))
  const maxQuote = Math.max(...chartData.map(d => d.quote), 10)

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-xs ${className}`}
    >
      <h3 className='font-semibold text-gray-800 text-sm mb-3 w-1/2'>
        {title}
      </h3>
      <ResponsiveContainer width='100%' height={chartData.length * 36 + 24}>
        <BarChart
          layout='vertical'
          data={chartData}
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <XAxis type='number' domain={[0, maxQuote]} hide />
          <YAxis
            type='category'
            dataKey='index'
            tickFormatter={i => chartData[i]?.name ?? ''}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Bar
            dataKey='quote'
            fill={GREEN}
            radius={[0, 4, 4, 0]}
            maxBarSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className='flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-600'>
        {chartData.map((d, i) => (
          <span key={i}>
            {d.name} {d.quote}%
          </span>
        ))}
      </div>
    </div>
  )
}
