import { type Page5NavTab } from '../data/page-5-data'

type Props = { tab: Page5NavTab }

export default function Page5TabPlaceholder ({ tab }: Props) {
  return (
    <div className='mt-6 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 text-sm'>
      Inhalt für &quot;{tab}&quot; folgt.
    </div>
  )
}
