import {
    getUeberfaelligeAuftraegeData,
    type AuftragStatus
  } from '../data/dashboard-data'
  
  const statusStyles: Record<
    AuftragStatus,
    { bg: string; dot: string; label: string }
  > = {
    Kritisch: {
      bg: 'bg-red-50',
      dot: 'bg-red-500',
      label: 'Kritisch'
    },
    Warnung: {
      bg: 'bg-amber-50',
      dot: 'bg-amber-500',
      label: 'Warnung'
    }
  }
  
  function StatusPill ({ status }: { status: AuftragStatus }) {
    const s = statusStyles[status]
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden />
        {s.label}
      </span>
    )
  }
  
  export default function UeberfaelligeAuftraege () {
    const data = getUeberfaelligeAuftraegeData()
  
    return (
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-200'>
              <th className='text-left font-semibold text-gray-700 py-2 pr-4'>
                Auftrag
              </th>
              <th className='text-left font-semibold text-gray-700 py-2 px-2'>
                Typ
              </th>
              <th className='text-left font-semibold text-gray-700 py-2 px-2'>
                Soll-Datum
              </th>
              <th className='text-right font-semibold text-gray-700 py-2 px-2'>
                Tage über
              </th>
              <th className='text-left font-semibold text-gray-700 py-2 pl-4'>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className='border-b border-gray-100 last:border-0'>
                <td className='py-3 pr-4 text-gray-900 font-medium'>
                  {row.auftrag}
                </td>
                <td className='py-3 px-2 text-gray-700'>{row.typ}</td>
                <td className='py-3 px-2 text-gray-700'>{row.sollDatum}</td>
                <td className='py-3 px-2 text-right text-red-700'>
                  +{row.tageUeber}
                </td>
                <td className='py-3 pl-4'>
                  <StatusPill status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  