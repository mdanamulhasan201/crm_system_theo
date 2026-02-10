'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Kopfdaten, { KopfdatenRef } from '../_components/Leistenkonfigurator/kopfdaten';
import SprengungSpitzenzugabe, { SprengungSpitzenzugabeRef } from '../_components/Leistenkonfigurator/sprengung-spitzenzugabe';
import Leistentyp, { LeistentypRef } from '../_components/Leistenkonfigurator/leistentyp';
import AllgemeineOptionen, { AllgemeineOptionenRef } from '../_components/Leistenkonfigurator/allgemeine-optionen';
import KorrekturenModellierung, { KorrekturenModellierungRef } from '../_components/Leistenkonfigurator/korrekturen-modellierung';
import Bemerkungen, { BemerkungenRef } from '../_components/Leistenkonfigurator/bemerkungen';

export default function LeistenKonfiguratorPage() {
  const kopfdatenRef = useRef<KopfdatenRef>(null);
  const sprengungRef = useRef<SprengungSpitzenzugabeRef>(null);
  const leistentypRef = useRef<LeistentypRef>(null);
  const allgemeineOptionenRef = useRef<AllgemeineOptionenRef>(null);
  const korrekturenRef = useRef<KorrekturenModellierungRef>(null);
  const bemerkungenRef = useRef<BemerkungenRef>(null);
  const [totalPrice, setTotalPrice] = useState(169.99);

  // Recalculate price when leistentyp changes
  const handleLeistentypChange = () => {
    const basePrice = 169.99;
    const knoechelhoherLeistenPrice = 19.99;
    
    const leistentypData = leistentypRef.current?.getData();
    const hasKnoechelhoherLeisten = leistentypData?.knoechelhoherLeistenLinks || leistentypData?.knoechelhoherLeistenRechts;
    
    const calculatedPrice = basePrice + (hasKnoechelhoherLeisten ? knoechelhoherLeistenPrice : 0);
    setTotalPrice(calculatedPrice);
  };

  const handleContinue = () => {
    const allData = {
      kopfdaten: kopfdatenRef.current?.getData() || null,
      sprengungSpitzenzugabe: sprengungRef.current?.getData() || null,
      leistentyp: leistentypRef.current?.getData() || null,
      allgemeineOptionen: allgemeineOptionenRef.current?.getData() || null,
      korrekturenModellierung: korrekturenRef.current?.getData() || null,
      bemerkungen: bemerkungenRef.current?.getData() || null,
      price: `${totalPrice.toFixed(2).replace('.', ',')}€`,
    };

    console.log('=== Leistenkonfigurator Data ===');
    console.log(JSON.stringify(allData, null, 2));
    console.log('==============================');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8 ">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Leistenkonfigurator
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Datenblatt zur individuellen Leistenerstellung
        </p>
      </header>

      {/* Main content sections */}
      <main className="space-y-6 md:space-y-8">
        <Kopfdaten ref={kopfdatenRef} />
        <SprengungSpitzenzugabe ref={sprengungRef} />
        <Leistentyp ref={leistentypRef} onChange={handleLeistentypChange} />
        <AllgemeineOptionen ref={allgemeineOptionenRef} />
        <KorrekturenModellierung ref={korrekturenRef} />
        <Bemerkungen ref={bemerkungenRef} />
      </main>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8 pb-8">
        <Button
          variant="outline"
          onClick={() => {
            // Handle cancel - could navigate back or reset form
            console.log('Abbrechen clicked');
          }}
          className="px-6 py-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleContinue}
          className="px-6 py-2 bg-[#61A178] hover:bg-[#61A178]/80 text-white"
        >
          Weiter {totalPrice.toFixed(2).replace('.', ',')}€
        </Button>
      </div>
    </div>
  );
}
