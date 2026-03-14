'use client'

import React, { useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import WarenwirtschaftHeader from '../_components/Warenwirtschaft/WarenwirtschaftHeader'
import WarenwirtschaftCard from '../_components/Warenwirtschaft/WarenwirtschaftCard'
import BestellungenTable from '../_components/Warenwirtschaft/BestellungenTable'
import RechnungenTable from '../_components/Warenwirtschaft/RechnungenTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DokumenteForderungen from '../_components/DokumenteForderungen/DokumenteForderungen'

const VALID_TABS = ['warenwirtschaft', 'dokumente-forderungen'] as const
type TabValue = (typeof VALID_TABS)[number]

function getTabFromSearchParams(searchParams: URLSearchParams | null): TabValue {
  const tab = searchParams?.get('tab') ?? 'warenwirtschaft'
  return VALID_TABS.includes(tab as TabValue) ? (tab as TabValue) : 'warenwirtschaft'
}

export default function Warenwirtschaft() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = getTabFromSearchParams(searchParams)
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editInventoryId, setEditInventoryId] = useState<string | null>(null)

  const handleTabChange = (value: string) => {
    const next = VALID_TABS.includes(value as TabValue) ? value : 'warenwirtschaft'
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('tab', next)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="bg-muted/60 inline-flex h-10 w-fit items-center gap-0.5 rounded-lg p-1 border border-border/50 shadow-sm">
        <TabsTrigger
          value="warenwirtschaft"
          className="min-w-[180px] cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-[#62A17C] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-0"
        >
          Warenwirtschaft
        </TabsTrigger>
        <TabsTrigger
          value="dokumente-forderungen"
          className="min-w-[180px] cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-[#62A17C] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-0"
        >
          Dokumente & Forderungen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="warenwirtschaft" className="mt-6 focus-visible:outline-none">
        <div className="space-y-6">
          <WarenwirtschaftHeader
            sidebarOpen={sidebarOpen}
            onSidebarOpenChange={(open) => {
              setSidebarOpen(open)
              if (!open) setEditInventoryId(null)
            }}
            onOpenForCreate={() => {
              setEditInventoryId(null)
              setSidebarOpen(true)
            }}
            editInventoryId={editInventoryId}
            onInventorySuccess={() => setInventoryRefreshKey((k) => k + 1)}
          />
          <WarenwirtschaftCard />
          <BestellungenTable
            refreshTrigger={inventoryRefreshKey}
            onEditInventory={(id) => {
              setEditInventoryId(id)
              setSidebarOpen(true)
            }}
            onDeleted={() => setInventoryRefreshKey((k) => k + 1)}
          />
          <RechnungenTable
            refreshTrigger={inventoryRefreshKey}
            onEditInventory={(id) => {
              setEditInventoryId(id)
              setSidebarOpen(true)
            }}
            onDeleted={() => setInventoryRefreshKey((k) => k + 1)}
          />
        </div>
      </TabsContent>

      <TabsContent value="dokumente-forderungen" className="mt-6 focus-visible:outline-none">
        <DokumenteForderungen />
      </TabsContent>
    </Tabs>
  )
}
