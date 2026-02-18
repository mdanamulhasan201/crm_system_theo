import type { Page4NavTab } from '../data/page-4-data'

type Props = { tab: Page4NavTab }

export default function Page4TabPlaceholder ({ tab }: Props) {
  return (
    <section
      className='mt-6 bg-white border border-gray-200 rounded-lg p-12 text-center'
      aria-label={`${tab} – Inhalt folgt`}
    >
      <p className='text-gray-500'>
        Inhalt für <strong className='text-gray-700'>{tab}</strong> wird in
        Kürze ergänzt.
      </p>
    </section>
  )
}
