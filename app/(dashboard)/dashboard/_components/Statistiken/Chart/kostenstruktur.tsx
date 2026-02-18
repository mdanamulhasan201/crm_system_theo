'use client'

import { useMemo } from 'react'
import { CanvasJSChart } from 'canvasjs-react-charts'
import { useDashboard } from '../dashboard-context'
import {
  getKostenstrukturData,
  type PeriodDays
} from '../data/dashboard-data'

export default function KostenstrukturChart () {
  const { periodDays } = useDashboard()
  const options = useMemo(() => {
    const data = getKostenstrukturData(periodDays as PeriodDays)
    return {
      animationEnabled: true,
      theme: 'light2',
      data: [
        {
          type: 'doughnut',
          startAngle: 90,
          innerRadius: '60%',
          radius: '90%',
          indexLabelLineThickness: 0,
          dataPoints: data.map(d => ({
            y: d.y,
            color: d.color
          }))
        }
      ]
    }
  }, [periodDays])

  return (
    <>
      <CanvasJSChart
        options={options}
        containerProps={{ style: { height: '240px', width: '100%' } }}
      />
      <div className='flex flex-wrap gap-6 mt-2 justify-center'>
        {getKostenstrukturData(periodDays as PeriodDays).map(d => (
          <div key={d.name} className='flex items-center gap-2'>
            <span
              className='w-3 h-3 rounded-sm'
              style={{ backgroundColor: d.color }}
            />
            <span className='text-sm text-gray-600'>{d.name}</span>
          </div>
        ))}
      </div>
    </>
  )
}
