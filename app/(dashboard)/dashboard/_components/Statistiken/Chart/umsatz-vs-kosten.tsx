'use client'

import { useMemo } from 'react'


    import {
    getUmsatzVsKostenData,
    type PeriodDays
    } from '../data/dashboard-data'
import { useDashboard } from '../dashboard-context'
import { CanvasJSChart } from 'canvasjs-react-charts'

/* Match reference: medium-dark line + light semi-transparent area */
const BLUE_LINE = '#1f77b4'
const BLUE_FILL = 'rgba(224, 242, 247, 0.5)' // #e0f2f7
const ORANGE_LINE = '#ff7f0e'
const ORANGE_FILL = 'rgba(255, 235, 215, 0.5)' // #ffebd7
const LABEL_COLOR = '#444444'
const GRID_COLOR = '#e0e0e0'

/** Uniform light fill for area; line color set separately */
function areaDataPoints (dates: Date[], values: number[], fillColor: string) {
  return dates.map((d, i) => ({
    x: d,
    y: values[i],
    color: fillColor
  }))
}

export default function UmsatzVsKostenChart () {
  const { periodDays } = useDashboard()
  const options = useMemo(() => {
    const { dates, umsatz, kosten } = getUmsatzVsKostenData(
      periodDays as PeriodDays
    )
    return {
      animationEnabled: true,
      backgroundColor: '#ffffff',
      axisX: {
        valueFormatString: periodDays === 7 ? 'DD.MM' : 'MMM',
        labelAngle: periodDays === 7 ? -45 : 0,
        interval: periodDays === 90 ? 5 : 1,
        gridThickness: 0.5,
        gridColor: GRID_COLOR,
        gridDashType: 'dot',
        labelFontColor: LABEL_COLOR,
        labelFontSize: 12,
        labelFormatter: (e: { value?: Date; label?: Date }) => {
          const d = (e.label ?? e.value) as Date | undefined
          if (!d) return ''
          return periodDays === 7
            ? d.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit'
              })
            : d.toLocaleDateString('de-DE', { month: 'short' })
        }
      },
      axisY: {
        title: '',
        suffix: 'k',
        gridThickness: 0.5,
        gridColor: GRID_COLOR,
        gridDashType: 'dot',
        labelFontColor: LABEL_COLOR,
        labelFontSize: 12,
        minimum: 0
      },
      legend: {
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        fontColor: LABEL_COLOR,
        fontSize: 12
      },
      toolTip: {
        shared: true,
        contentFormatter: (e: {
          entries: Array<{
            dataPoint: { x: Date; y: number }
            dataSeries: { name: string }
          }>
        }) => {
          const d = e.entries?.[0]?.dataPoint?.x
          const dateStr = d
            ? d.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : ''
          let s = dateStr + '<br/>'
          e.entries?.forEach(entry => {
            s += `${entry.dataSeries.name}: ${entry.dataPoint.y}k<br/>`
          })
          return s
        }
      },
      data: [
        {
          type: 'splineArea',
          name: 'Umsatz',
          color: BLUE_FILL,
          lineColor: BLUE_LINE,
          fillOpacity: 1,
          markerSize: 0,
          showInLegend: true,
          dataPoints: areaDataPoints(dates, umsatz, BLUE_FILL)
        },
        {
          type: 'splineArea',
          name: 'Kosten',
          color: ORANGE_FILL,
          lineColor: ORANGE_LINE,
          fillOpacity: 1,
          markerSize: 0,
          showInLegend: true,
          dataPoints: areaDataPoints(dates, kosten, ORANGE_FILL)
        }
      ]
    }
  }, [periodDays])

  return (
    <CanvasJSChart
      options={options}
      containerProps={{ style: { height: '280px', width: '100%' } }}
    />
  )
}
