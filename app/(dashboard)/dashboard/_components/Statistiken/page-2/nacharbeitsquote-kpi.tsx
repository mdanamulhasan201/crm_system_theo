import { NACHARBEITSQUOTE_KPI } from '../data/page-2-data'

export default function NacharbeitsquoteKpi () {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs text-center'>
      <h3 className='font-semibold text-gray-800 text-xl mb-2 text-center'>
        Nacharbeitsquote
      </h3>
      <div className='text-4xl font-bold text-[#36A866]'>
        {NACHARBEITSQUOTE_KPI}
      </div>
    </div>
  )
}
