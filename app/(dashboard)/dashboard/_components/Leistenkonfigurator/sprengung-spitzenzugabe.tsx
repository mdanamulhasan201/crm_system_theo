'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';

export interface SprengungSpitzenzugabeData {
  fersensprengungLinks: string;
  fersensprengungRechts: string;
  spitzensprengungLinks: string;
  spitzensprengungRechts: string;
  spitzenzugabeLinks: string;
  spitzenzugabeRechts: string;
  dickeFerse: string;
  dickeBallen: string;
  dickeSpitze: string;
}

export interface SprengungSpitzenzugabeRef {
  getData: () => SprengungSpitzenzugabeData;
}

const SprengungSpitzenzugabe = forwardRef<SprengungSpitzenzugabeRef>((props, ref) => {
  const [formData, setFormData] = useState({
    fersensprengungLinks: '',
    fersensprengungRechts: '',
    spitzensprengungLinks: '',
    spitzensprengungRechts: '',
    spitzenzugabeLinks: '',
    spitzenzugabeRechts: '',
    dickeFerse: '',
    dickeBallen: '',
    dickeSpitze: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useImperativeHandle(ref, () => ({
    getData: () => formData,
  }));

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6B9B87] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Sprengung & Spitzenzugabe
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

      {/* Input rows */}
      <div className="space-y-4">
        {/* Row 1: Fersensprengung */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Fersensprengung
            </label>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={formData.fersensprengungLinks}
              onChange={(e) => handleInputChange('fersensprengungLinks', e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              mm
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={formData.fersensprengungRechts}
              onChange={(e) => handleInputChange('fersensprengungRechts', e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              mm
            </span>
          </div>
        </div>

        {/* Row 2: Spitzensprengung */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Spitzensprengung
            </label>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={formData.spitzensprengungLinks}
              onChange={(e) => handleInputChange('spitzensprengungLinks', e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              mm
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={formData.spitzensprengungRechts}
              onChange={(e) => handleInputChange('spitzensprengungRechts', e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              mm
            </span>
          </div>
        </div>

        {/* Row 3: Spitzenzugabe */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Spitzenzugabe
            </label>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={formData.spitzenzugabeLinks}
              onChange={(e) => handleInputChange('spitzenzugabeLinks', e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              mm
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={formData.spitzenzugabeRechts}
              onChange={(e) => handleInputChange('spitzenzugabeRechts', e.target.value)}
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              mm
            </span>
          </div>
        </div>
      </div>

      {/* Bettung – Dicke Einlagendecke */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Bettung wird brutto aufgebaut
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Bitte geben Sie die Dicke der Einlagendecke in Millimetern an:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dicke Ferse (mm)</label>
            <div className="relative">
              <Input
                type="number"
                value={formData.dickeFerse}
                onChange={(e) => handleInputChange('dickeFerse', e.target.value)}
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">mm</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dicke Ballen (mm)</label>
            <div className="relative">
              <Input
                type="number"
                value={formData.dickeBallen}
                onChange={(e) => handleInputChange('dickeBallen', e.target.value)}
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">mm</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dicke Spitze (mm)</label>
            <div className="relative">
              <Input
                type="number"
                value={formData.dickeSpitze}
                onChange={(e) => handleInputChange('dickeSpitze', e.target.value)}
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 pr-10"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">mm</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SprengungSpitzenzugabe.displayName = 'SprengungSpitzenzugabe';

export default SprengungSpitzenzugabe;

