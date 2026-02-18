import { ABWESENHEITSQUOTE_KPI } from '../data/page-3-data'

export default function AbwesenheitsquoteKpiCard () {
  const { main, mainSub, secondary, secondarySub } = ABWESENHEITSQUOTE_KPI

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
      <h3 className='font-bold text-gray-900 text-base mb-4'>
        Abwesenheitsquote
      </h3>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <div className='text-2xl font-bold text-gray-900'>{main}</div>
          <ul className='mt-2 space-y-1 text-sm text-gray-500'>
            {mainSub.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className='text-2xl font-bold text-gray-900'>{secondary}</div>
          <ul className='mt-2 space-y-1 text-sm text-gray-500'>
            {secondarySub.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
