import { PAGE5_KPIS } from '../data/page-5-data'

export default function Page5Kpis () {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4'>
      {PAGE5_KPIS.map((kpi, index) => (
        <div
          key={index}
          className='bg-white border border-gray-200 rounded-lg p-4 shadow-xs'
        >
          <h3 className='font-semibold text-gray-700 text-sm mb-1'>
            {kpi.title}
          </h3>
          <div className='text-xl font-bold text-gray-900'>{kpi.value}</div>
          {kpi.trend != null &&
            kpi.trendLabel != null &&
            kpi.isPositive != null && (
              <div
                className={`text-xs font-medium mt-1 ${
                  kpi.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {kpi.isPositive ? '↑' : '↓'} {kpi.trend} {kpi.trendLabel}
              </div>
            )}
        </div>
      ))}
    </div>
  )
}
