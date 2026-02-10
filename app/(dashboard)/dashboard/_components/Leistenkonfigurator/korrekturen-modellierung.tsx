'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';

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

  const handleRadioChange = (field: keyof KorrekturenModellierungData, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useImperativeHandle(ref, () => ({
    getData: () => selectedOptions,
  }));

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#2563eb] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Korrekturen & Modellierung
      </h2>

      {/* Column headers */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div></div>
        <div className="text-center">
          <label className="text-sm font-medium text-gray-500 uppercase">
            LINKS
          </label>
        </div>
        <div className="text-center">
          <label className="text-sm font-medium text-gray-500 uppercase">
            RECHTS
          </label>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-0">
        {/* Option 1: Beinkorrektur */}
        <div className="grid grid-cols-3 gap-4 items-center py-4 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-700">
              Beinkorrektur in Lotstellung (dorsal & lateral) bei angegebener Fersensprengung
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="beinkorrekturLinks"
                value="ja"
                checked={selectedOptions.beinkorrekturLinks === 'ja'}
                onChange={(e) => handleRadioChange('beinkorrekturLinks', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="beinkorrekturLinks"
                value="nein"
                checked={selectedOptions.beinkorrekturLinks === 'nein'}
                onChange={(e) => handleRadioChange('beinkorrekturLinks', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Nein</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="beinkorrekturRechts"
                value="ja"
                checked={selectedOptions.beinkorrekturRechts === 'ja'}
                onChange={(e) => handleRadioChange('beinkorrekturRechts', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="beinkorrekturRechts"
                value="nein"
                checked={selectedOptions.beinkorrekturRechts === 'nein'}
                onChange={(e) => handleRadioChange('beinkorrekturRechts', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Nein</span>
            </label>
          </div>
        </div>

        {/* Option 2: Anschlagkante */}
        <div className="grid grid-cols-3 gap-4 items-center py-4">
          <div>
            <p className="text-sm text-gray-700">
              Anschlagkante auf Ferse modellieren
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="anschlagkanteLinks"
                value="ja"
                checked={selectedOptions.anschlagkanteLinks === 'ja'}
                onChange={(e) => handleRadioChange('anschlagkanteLinks', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="anschlagkanteLinks"
                value="nein"
                checked={selectedOptions.anschlagkanteLinks === 'nein'}
                onChange={(e) => handleRadioChange('anschlagkanteLinks', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Nein</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="anschlagkanteRechts"
                value="ja"
                checked={selectedOptions.anschlagkanteRechts === 'ja'}
                onChange={(e) => handleRadioChange('anschlagkanteRechts', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="anschlagkanteRechts"
                value="nein"
                checked={selectedOptions.anschlagkanteRechts === 'nein'}
                onChange={(e) => handleRadioChange('anschlagkanteRechts', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Nein</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
});

KorrekturenModellierung.displayName = 'KorrekturenModellierung';

export default KorrekturenModellierung;

