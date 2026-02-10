'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export interface LeistentypData {
  knoechelhoherLeistenLinks: boolean;
  knoechelhoherLeistenRechts: boolean;
  halbschuhleistenSchmalerLinks: boolean;
  halbschuhleistenSchmalerRechts: boolean;
  halbschuhleistenBreiterLinks: boolean;
  halbschuhleistenBreiterRechts: boolean;
}

export interface LeistentypRef {
  getData: () => LeistentypData;
}

interface LeistentypProps {
  onChange?: () => void;
}

const Leistentyp = forwardRef<LeistentypRef, LeistentypProps>(({ onChange }, ref) => {
  const [selectedOptions, setSelectedOptions] = useState<LeistentypData>({
    knoechelhoherLeistenLinks: false,
    knoechelhoherLeistenRechts: false,
    halbschuhleistenSchmalerLinks: false,
    halbschuhleistenSchmalerRechts: false,
    halbschuhleistenBreiterLinks: false,
    halbschuhleistenBreiterRechts: false,
  });

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [field]: checked,
    }));
    // Call onChange callback to notify parent of changes
    if (onChange) {
      setTimeout(() => onChange(), 0);
    }
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
        Leistentyp
      </h2>

      {/* Column headers */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <label className="text-sm font-medium text-gray-500 uppercase">
            LINKS
          </label>
        </div>
        <div className="text-center">
          <label className="text-sm font-medium text-gray-500 uppercase">
            {/* Description column - empty header */}
          </label>
        </div>
        <div className="text-center">
          <label className="text-sm font-medium text-gray-500 uppercase">
            RECHTS
          </label>
        </div>
      </div>

      {/* Rows with checkboxes */}
      <div className="space-y-0">
        {/* Row 1: Knöchelhoher Leisten */}
        <div className="grid grid-cols-3 gap-4 items-center py-4 border-b border-gray-200">
          <div className="flex justify-center">
            <Checkbox
              checked={selectedOptions.knoechelhoherLeistenLinks}
              onChange={(e) => handleCheckboxChange('knoechelhoherLeistenLinks', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Knöchelhoher Leisten
            </span>
            <span className="text-sm font-medium text-[#61A178]">
              (+19,99€)
            </span>
          </div>
          <div className="flex justify-center">
            <Checkbox
              checked={selectedOptions.knoechelhoherLeistenRechts}
              onChange={(e) => handleCheckboxChange('knoechelhoherLeistenRechts', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>

        {/* Row 2: Halbschuhleisten schmaler Kapp */}
        <div className="grid grid-cols-3 gap-4 items-center py-4 border-b border-gray-200">
          <div className="flex justify-center">
            <Checkbox
              checked={selectedOptions.halbschuhleistenSchmalerLinks}
              onChange={(e) => handleCheckboxChange('halbschuhleistenSchmalerLinks', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
              Halbschuhleisten schmaler Kapp
            </span>
          </div>
          <div className="flex justify-center">
            <Checkbox
              checked={selectedOptions.halbschuhleistenSchmalerRechts}
              onChange={(e) => handleCheckboxChange('halbschuhleistenSchmalerRechts', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>

        {/* Row 3: Halbschuhleisten breiter Kapp */}
        <div className="grid grid-cols-3 gap-4 items-center py-4">
          <div className="flex justify-center">
            <Checkbox
              checked={selectedOptions.halbschuhleistenBreiterLinks}
              onChange={(e) => handleCheckboxChange('halbschuhleistenBreiterLinks', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
              Halbschuhleisten breiter Kapp
            </span>
          </div>
          <div className="flex justify-center">
            <Checkbox
              checked={selectedOptions.halbschuhleistenBreiterRechts}
              onChange={(e) => handleCheckboxChange('halbschuhleistenBreiterRechts', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

Leistentyp.displayName = 'Leistentyp';

export default Leistentyp;

