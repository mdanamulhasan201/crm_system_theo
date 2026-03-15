'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NeuerDokumenteModal from './NeuerDokumenteModal';

export default function DokumenteForderungenHeader() {
  const [isNeuerDokumenteOpen, setIsNeuerDokumenteOpen] = useState(false);

  return (
    <header className="flex flex-col gap-4 lg:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Dokumente & Forderungen
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Zentrale Übersicht aller Belege und offenen Posten
        </p>
      </div>
      <div>
        <Button
          size="default"
          className="bg-[#62A17C] cursor-pointer hover:bg-[#4A8A5F] text-white"
          onClick={() => setIsNeuerDokumenteOpen(true)}
        >
          <Plus className="size-4" />
          Neuer Dokumente
        </Button>
      </div>

      <NeuerDokumenteModal
        open={isNeuerDokumenteOpen}
        onOpenChange={setIsNeuerDokumenteOpen}
      />
    </header>
  );
}
