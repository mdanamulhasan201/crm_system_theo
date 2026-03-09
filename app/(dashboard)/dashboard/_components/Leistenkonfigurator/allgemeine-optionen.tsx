'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface AllgemeineOptionenData {
  gleicheLaenge: string;
  spitzenform: string;
  leistenteilung: string;
  modelNr?: string;
}

export interface AllgemeineOptionenRef {
  getData: () => AllgemeineOptionenData;
}

const AllgemeineOptionen = forwardRef<AllgemeineOptionenRef>((props, ref) => {
  const [selectedOptions, setSelectedOptions] = useState<AllgemeineOptionenData>({
    gleicheLaenge: '',
    spitzenform: '',
    leistenteilung: '',
    modelNr: '',
  });

  const handleRadioChange = (field: 'gleicheLaenge' | 'spitzenform' | 'leistenteilung', value: string) => {
    setSelectedOptions(prev => ({ ...prev, [field]: value }));
  };

  useImperativeHandle(ref, () => ({
    getData: () => selectedOptions,
  }));

  /* Tab-style: container and buttons content-width (bg only behind tabs) */
  const tabContainer = 'rounded-lg bg-gray-200 p-1 inline-flex flex-wrap gap-0 w-fit';
  const tabBtn = 'py-2.5 px-4 rounded-md text-sm font-medium transition-all cursor-pointer shrink-0';
  const tabBtnActive = 'bg-[#61A178] text-white shadow-sm';
  const tabBtnInactive = 'text-gray-600 hover:text-[#61A178] bg-transparent';

  const toeShapeOptions = [
    { value: 'rund', label: 'Rund' },
    { value: 'natur', label: 'Natur' },
    { value: 'spitz', label: 'Spitz' },
    { value: 'carree', label: 'Carrée' },
  ];

  const lastDivisionOptions = [
    { value: '2-teilig', label: '2-teilig' },
    { value: '3-teilig', label: '3-teilig' },
    { value: 'stufenschnitt', label: 'Stufenschnitt' },
    { value: 'falte-knickschnitt', label: 'Falte/Knickschnitt' },
  ];

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6B9B87] rounded-r-full" />

      {/* Header – same as image */}
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Formkonfiguration
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Spitzenform und Leistenteilung Einstellungen
      </p>

      {/* Gleiche Länge – tab style */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-2">Gleiche Länge</label>
        <div className={tabContainer}>
          <button
            type="button"
            onClick={() => handleRadioChange('gleicheLaenge', 'ja')}
            className={cn(tabBtn, selectedOptions.gleicheLaenge === 'ja' ? tabBtnActive : tabBtnInactive)}
          >
            Ja
          </button>
          <button
            type="button"
            onClick={() => handleRadioChange('gleicheLaenge', 'nein')}
            className={cn(tabBtn, selectedOptions.gleicheLaenge === 'nein' ? tabBtnActive : tabBtnInactive)}
          >
            Nein
          </button>
        </div>
      </div>

      {/* Spitzenform – tab style */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-2">Spitzenform</label>
        <div className={cn(tabContainer, 'mb-3')}>
          {toeShapeOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRadioChange('spitzenform', value)}
              className={cn(tabBtn, selectedOptions.spitzenform === value ? tabBtnActive : tabBtnInactive)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">oder Modell-Nr.</label>
          <Input
            type="text"
            value={selectedOptions.modelNr ?? ''}
            onChange={(e) => setSelectedOptions(prev => ({ ...prev, modelNr: e.target.value }))}
            placeholder="z.B. M-204"
            className="h-10 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-[#61A178] focus-visible:border-[#61A178] w-40 flex-1 min-w-[140px]"
          />
        </div>
      </div>

      {/* Leistenteilung – tab style */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Leistenteilung</label>
        <div className={tabContainer}>
          {lastDivisionOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRadioChange('leistenteilung', value)}
              className={cn(tabBtn, selectedOptions.leistenteilung === value ? tabBtnActive : tabBtnInactive)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});

AllgemeineOptionen.displayName = 'AllgemeineOptionen';

export default AllgemeineOptionen;
