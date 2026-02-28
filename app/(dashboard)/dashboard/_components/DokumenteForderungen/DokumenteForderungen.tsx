'use client'

import React, { useState } from 'react'
import DokumenteForderungenCard from './DokumenteForderungenCard'
import DokumenteForderungenHeader from './DokumenteForderungenHeader'
import FilterTabButton, { type DokumentFilterTab } from './FilterTabButton'
import DokumenteTable from './DokumenteTable'

export default function DokumenteForderungen() {
  const [activeTab, setActiveTab] = useState<DokumentFilterTab>('Alle')

  return (
    <div className="space-y-6">
      <DokumenteForderungenHeader />
      <DokumenteForderungenCard />
      <FilterTabButton value={activeTab} onTabChange={setActiveTab} />
      <DokumenteTable activeTab={activeTab} />
    </div>
  )
}
