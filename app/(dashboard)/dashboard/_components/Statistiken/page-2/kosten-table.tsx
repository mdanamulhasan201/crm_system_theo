import { KOSTEN_TABLE_ROWS } from '../data/page-2-data'

const COLS = [
  'Ordnung',
  'Ö Zeit',
  'Zeitkosten',
  'Material',
  'Fixkosten',
  'Gesamtkosten',
  'Verkaufspreis',
  'DB'
] as const

const ROW_KEYS = [
  'ordnung',
  'oZeit',
  'zeitkosten',
  'material',
  'fixkosten',
  'gesamtkosten',
  'verkaufspreis',
  'db'
] as const

export default function KostenTable () {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-gray-200'>
            {COLS.map(col => (
              <th
                key={col}
                className='text-left py-2 px-2 font-semibold text-gray-700 whitespace-nowrap'
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KOSTEN_TABLE_ROWS.map((row, rIdx) => (
            <tr key={rIdx} className='border-b border-gray-100'>
              {ROW_KEYS.map(key => (
                <td
                  key={key}
                  className={`py-5 px-2 ${
                    key === 'db'
                      ? 'font-semibold text-green-600'
                      : 'text-gray-700'
                  }`}
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
