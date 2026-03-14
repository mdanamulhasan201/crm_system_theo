'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wrench, Plus } from 'lucide-react'
import LagerkorrekturModal from './LagerkorrekturModal'
import NeuerWareneingangSidebar from './NeuerWareneingangSidebar'

interface WarenwirtschaftHeaderProps {
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
  onOpenForCreate: () => void
  editInventoryId: string | null
  onInventorySuccess?: () => void
}

export default function WarenwirtschaftHeader({
  sidebarOpen,
  onSidebarOpenChange,
  onOpenForCreate,
  editInventoryId,
  onInventorySuccess,
}: WarenwirtschaftHeaderProps) {
  const [lagerkorrekturOpen, setLagerkorrekturOpen] = useState(false)

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Warenwirtschaft
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Einkauf, Wareneingang & Lagerbuchung
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="default"
          className="border-gray-300 cursor-pointer bg-white hover:bg-gray-50"
          onClick={() => setLagerkorrekturOpen(true)}
        >
          <Wrench className="size-4" />
          Lagerkorrektur
        </Button>
        <Button
          size="default"
          className="bg-[#62A17C] cursor-pointer hover:bg-[#4A8A5F] text-white"
          onClick={onOpenForCreate}
        >
          <Plus className="size-4" />
          Neuer Wareneingang
        </Button>
      </div>

      <LagerkorrekturModal
        open={lagerkorrekturOpen}
        onOpenChange={setLagerkorrekturOpen}
      />

      <NeuerWareneingangSidebar
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        onSuccess={onInventorySuccess}
        editInventoryId={editInventoryId}
      />
    </header>
  )
}
