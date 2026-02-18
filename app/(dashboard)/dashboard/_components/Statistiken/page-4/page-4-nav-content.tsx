'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { type Page4NavTab } from '../data/page-4-data'
import Page4Nav from './page-4-nav'
import Page4UebersichtContent from './page-4-uebersicht-content'
import Page4EinkaeufeContent from './page-4-einkaeufe-content'
import Page4LieferantenContent from './page-4-lieferanten-content'
import Page4DeadStockContent from './page-4-dead-stock-content'
import Page4OverstockContent from './page-4-overstock-content'
import Page4VerbrauchContent from './page-4-verbrauch-content'
import Page4TabPlaceholder from './page-4-tab-placeholder'

/** Map nav tab id → content component. Add new tab content here. */
const TAB_CONTENT: Partial<Record<Page4NavTab, ReactNode>> = {
  Übersicht: <Page4UebersichtContent />,
  Einkäufe: <Page4EinkaeufeContent />,
  Lieferanten: <Page4LieferantenContent />,
  'Dead Stock': <Page4DeadStockContent />,
  Overstock: <Page4OverstockContent />,
  Verbrauch: <Page4VerbrauchContent />
  // Artikel, Turnover, Schwund → add when content is ready
}

export default function Page4NavContent () {
  const [activeTab, setActiveTab] = useState<Page4NavTab>('Übersicht')
  const content = TAB_CONTENT[activeTab] ?? (
    <Page4TabPlaceholder tab={activeTab} />
  )

  return (
    <>
      <Page4Nav active={activeTab} onSelect={setActiveTab} />
      {content}
    </>
  )
}
