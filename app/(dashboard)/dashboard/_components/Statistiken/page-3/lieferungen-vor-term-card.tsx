import { LIEFERUNGEN_VOR_TERM } from '../data/page-3-data'

export default function LieferungenVorTermCard () {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs h-full flex flex-col justify-center'>
      <h3 className='font-bold text-gray-900 text-base mb-3'>
        Lieferungen vor Termin
      </h3>
      <div className='text-3xl font-bold text-green-600'>
        {LIEFERUNGEN_VOR_TERM.value}
      </div>
      <p className='text-sm text-gray-600 mt-1'>{LIEFERUNGEN_VOR_TERM.label}</p>
    </div>
  )
}
