'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export interface KorrekturenModellierungData {
  beinkorrekturLinks: string;
  beinkorrekturRechts: string;
  anschlagkanteLinks: string;
  anschlagkanteRechts: string;
}

export interface KorrekturenModellierungRef {
  getData: () => KorrekturenModellierungData;
}

const KorrekturenModellierung = forwardRef<KorrekturenModellierungRef>((props, ref) => {
  const [selectedOptions, setSelectedOptions] = useState<KorrekturenModellierungData>({
    beinkorrekturLinks: 'nein',
    beinkorrekturRechts: 'nein',
    anschlagkanteLinks: 'nein',
    anschlagkanteRechts: 'nein',
  });

  const handleCheckboxChange = (field: keyof KorrekturenModellierungData, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [field]: checked ? 'ja' : 'nein',
    }));
  };

  useImperativeHandle(ref, () => ({
    getData: () => selectedOptions,
  }));

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6B9B87] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Korrekturen & Modellierung
      </h2>

      {/* Column headers */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div></div>
        <div className="text-center">
          <label className="text-base font-medium text-gray-500 uppercase">
            LINKS
          </label>
        </div>
        <div className="text-center">
          <label className="text-base font-medium text-gray-500 uppercase">
            RECHTS
          </label>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-0">
        {/* Option 1: Beinkorrektur */}
        <div className="grid grid-cols-3 gap-4 items-center py-4 border-b border-gray-200">
          <div>
            <p className="text-base text-gray-700">
              Beinkorrektur in Lotstellung (dorsal & lateral) bei angegebener Fersensprengung
            </p>
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedOptions.beinkorrekturLinks === 'ja'}
                onChange={(e) => handleCheckboxChange('beinkorrekturLinks', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 checked:bg-[#6B9B87] checked:border-[#6B9B87]"
              />
              <span className="text-base text-gray-700">Ja</span>
            </label>
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedOptions.beinkorrekturRechts === 'ja'}
                onChange={(e) => handleCheckboxChange('beinkorrekturRechts', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 checked:bg-[#6B9B87] checked:border-[#6B9B87]"
              />
              <span className="text-base text-gray-700">Ja</span>
            </label>
          </div>
        </div>

        {/* Option 2: Anschlagkante */}
        <div className="grid grid-cols-3 gap-4 items-center py-4">
          <div>
            <p className="text-base text-gray-700">
              Anschlagkante auf Ferse modellieren
            </p>
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedOptions.anschlagkanteLinks === 'ja'}
                onChange={(e) => handleCheckboxChange('anschlagkanteLinks', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 checked:bg-[#6B9B87] checked:border-[#6B9B87]"
              />
              <span className="text-base text-gray-700">Ja</span>
            </label>
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedOptions.anschlagkanteRechts === 'ja'}
                onChange={(e) => handleCheckboxChange('anschlagkanteRechts', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 checked:bg-[#6B9B87] checked:border-[#6B9B87]"
              />
              <span className="text-base text-gray-700">Ja</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
});

KorrekturenModellierung.displayName = 'KorrekturenModellierung';

export default KorrekturenModellierung;

