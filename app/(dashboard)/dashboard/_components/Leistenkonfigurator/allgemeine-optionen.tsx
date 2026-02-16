'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';

export interface AllgemeineOptionenData {
  gleicheLaenge: string;
  spitzenform: string;
  leistenteilung: string;
}

export interface AllgemeineOptionenRef {
  getData: () => AllgemeineOptionenData;
}

const AllgemeineOptionen = forwardRef<AllgemeineOptionenRef>((props, ref) => {
  const [selectedOptions, setSelectedOptions] = useState<AllgemeineOptionenData>({
    gleicheLaenge: '',
    spitzenform: '',
    leistenteilung: '',
  });

  const handleRadioChange = (field: string, value: string) => {
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
        Allgemeine Optionen
      </h2>

      {/* Option sections */}
      <div className="space-y-6">
        {/* Section 1: Gleiche Länge */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">
            Gleiche Länge
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gleicheLaenge"
                value="ja"
                checked={selectedOptions.gleicheLaenge === 'ja'}
                onChange={(e) => handleRadioChange('gleicheLaenge', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gleicheLaenge"
                value="nein"
                checked={selectedOptions.gleicheLaenge === 'nein'}
                onChange={(e) => handleRadioChange('gleicheLaenge', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Nein</span>
            </label>
          </div>
        </div>

        {/* Section 2: Spitzenform */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">
            Spitzenform
          </label>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spitzenform"
                value="rund"
                checked={selectedOptions.spitzenform === 'rund'}
                onChange={(e) => handleRadioChange('spitzenform', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Rund</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spitzenform"
                value="natur"
                checked={selectedOptions.spitzenform === 'natur'}
                onChange={(e) => handleRadioChange('spitzenform', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Natur</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spitzenform"
                value="spitz"
                checked={selectedOptions.spitzenform === 'spitz'}
                onChange={(e) => handleRadioChange('spitzenform', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Spitz</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spitzenform"
                value="carree"
                checked={selectedOptions.spitzenform === 'carree'}
                onChange={(e) => handleRadioChange('spitzenform', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Carrée</span>
            </label>
          </div>
        </div>

        {/* Section 3: Leistenteilung */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">
            Leistenteilung
          </label>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="leistenteilung"
                value="2-teilig"
                checked={selectedOptions.leistenteilung === '2-teilig'}
                onChange={(e) => handleRadioChange('leistenteilung', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">2-teilig</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="leistenteilung"
                value="3-teilig"
                checked={selectedOptions.leistenteilung === '3-teilig'}
                onChange={(e) => handleRadioChange('leistenteilung', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">3-teilig</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="leistenteilung"
                value="stufenschnitt"
                checked={selectedOptions.leistenteilung === 'stufenschnitt'}
                onChange={(e) => handleRadioChange('leistenteilung', e.target.value)}
                className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Stufenschnitt</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
});

AllgemeineOptionen.displayName = 'AllgemeineOptionen';

export default AllgemeineOptionen;

