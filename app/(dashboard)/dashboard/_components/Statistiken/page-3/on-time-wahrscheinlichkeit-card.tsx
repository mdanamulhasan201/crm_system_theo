import { ON_TIME_WAHRSCHEINLICHKEIT } from '../data/page-3-data'

export default function OnTimeWahrscheinlichkeitCard () {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs h-full flex flex-col justify-center'>
      <h3 className='font-bold text-gray-900 text-base mb-3'>
        On-time Wahrscheinlichkeit
      </h3>
      <div className='text-3xl font-bold text-green-600'>
        {ON_TIME_WAHRSCHEINLICHKEIT.value}
      </div>
      <p className='text-sm text-gray-600 mt-1'>
        {ON_TIME_WAHRSCHEINLICHKEIT.label}
      </p>
    </div>
  )
}
