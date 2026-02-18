'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { type Page5NavTab } from '../data/page-5-data'
import Page5Nav from './page-5-nav'
import Page5VollpreisRabattContent from './page-5-vollpreis-rabatt-content'
import Page5RabattDetailContent from './page-5-rabatt-detail-content'
import Page5ZahlungsartenContent from './page-5-zahlungsarten-content'
import Page5TabPlaceholder from './page-5-tab-placeholder'

const TAB_CONTENT: Partial<Record<Page5NavTab, ReactNode>> = {
  'Vollpreis vs. Rabatt': <Page5VollpreisRabattContent />,
  'Rabatt-Detail': <Page5RabattDetailContent />,
  Zahlungsarten: <Page5ZahlungsartenContent />
  // Margenanalyse → add when content is ready
}

export default function Page5NavContent () {
  const [activeTab, setActiveTab] = useState<Page5NavTab>(
    'Vollpreis vs. Rabatt'
  )
  const content = TAB_CONTENT[activeTab] ?? (
    <Page5TabPlaceholder tab={activeTab} />
  )

  return (
    <>
      <Page5Nav active={activeTab} onSelect={setActiveTab} />
      {content}
    </>
  )
}
