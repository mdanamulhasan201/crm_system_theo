import { PAGE2_KPIS } from '../data/page-2-data'

export default function Page2Kpis () {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {PAGE2_KPIS.map((kpi, index) => (
        <div
          key={index}
          className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'
        >
          <h3 className='font-semibold text-gray-700 text-sm mb-2'>
            {kpi.title}
          </h3>
          <div className='flex gap-1 items-center justify-between'>
            <div className='text-2xl font-bold text-gray-900'>{kpi.value}</div>
            {kpi.sub ? (
              <div className='text-sm text-gray-500 mt-1'>{kpi.sub}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
