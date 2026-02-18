'use client'

import DonutWithLegend from '../page-2/donut-with-legend'
import {
  AUFGABENVERTEILUNG,
  AUFGABENVERTEILUNG_SUBTITLE
} from '../data/page-3-data'

export default function AufgabenverteilungCard () {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
      <h3 className='font-bold text-gray-900 text-base mb-1'>
        AUFGABENVERTEILUNG
      </h3>
      <p className='text-sm text-gray-500 mb-4'>
        {AUFGABENVERTEILUNG_SUBTITLE}
      </p>
      <DonutWithLegend data={AUFGABENVERTEILUNG} />
    </div>
  )
}
