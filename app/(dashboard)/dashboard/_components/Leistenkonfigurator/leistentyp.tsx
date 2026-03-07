'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

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

type LeistentypOption = 'knoechelhoher' | 'halbschuhleistenSchmaler' | 'halbschuhleistenBreiter';

const Leistentyp = forwardRef<LeistentypRef, LeistentypProps>(({ onChange }, ref) => {
  const [selectedOptions, setSelectedOptions] = useState<LeistentypData>({
    knoechelhoherLeistenLinks: false,
    knoechelhoherLeistenRechts: false,
    halbschuhleistenSchmalerLinks: false,
    halbschuhleistenSchmalerRechts: false,
    halbschuhleistenBreiterLinks: false,
    halbschuhleistenBreiterRechts: false,
  });

  const selectLeft = (option: LeistentypOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      knoechelhoherLeistenLinks: option === 'knoechelhoher',
      halbschuhleistenSchmalerLinks: option === 'halbschuhleistenSchmaler',
      halbschuhleistenBreiterLinks: option === 'halbschuhleistenBreiter',
    }));
    setTimeout(() => onChange?.(), 0);
  };

  const selectRight = (option: LeistentypOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      knoechelhoherLeistenRechts: option === 'knoechelhoher',
      halbschuhleistenSchmalerRechts: option === 'halbschuhleistenSchmaler',
      halbschuhleistenBreiterRechts: option === 'halbschuhleistenBreiter',
    }));
    setTimeout(() => onChange?.(), 0);
  };

  useImperativeHandle(ref, () => ({
    getData: () => selectedOptions,
  }));

  const buttonBase = 'flex-1 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer text-center';
  const buttonActive = 'bg-[#6B9B87]/10 text-[#6B9B87] border-[#6B9B87]';
  const buttonInactive = 'bg-white text-gray-700 border-gray-200 hover:border-gray-300';

  const leftOptions: { value: LeistentypOption; label: string; price?: string }[] = [
    { value: 'knoechelhoher', label: 'Knöchelhoher Leisten', price: '+19,99€' },
    { value: 'halbschuhleistenSchmaler', label: 'Halbschuhleisten schmaler Kapp' },
    { value: 'halbschuhleistenBreiter', label: 'Halbschuhleisten breiter Kapp' },
  ];

  const getLeftSelected = (): LeistentypOption | null => {
    if (selectedOptions.knoechelhoherLeistenLinks) return 'knoechelhoher';
    if (selectedOptions.halbschuhleistenSchmalerLinks) return 'halbschuhleistenSchmaler';
    if (selectedOptions.halbschuhleistenBreiterLinks) return 'halbschuhleistenBreiter';
    return null;
  };

  const getRightSelected = (): LeistentypOption | null => {
    if (selectedOptions.knoechelhoherLeistenRechts) return 'knoechelhoher';
    if (selectedOptions.halbschuhleistenSchmalerRechts) return 'halbschuhleistenSchmaler';
    if (selectedOptions.halbschuhleistenBreiterRechts) return 'halbschuhleistenBreiter';
    return null;
  };

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6B9B87] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Leistentyp
      </h2>

      {/* Leistentyp Links – only one option */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Leistentyp Links</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {leftOptions.map(({ value, label, price }) => (
            <button
              key={value}
              type="button"
              onClick={() => selectLeft(value)}
              className={cn(
                buttonBase,
                getLeftSelected() === value ? buttonActive : buttonInactive
              )}
            >
              <span className="block">{label}</span>
              {price && <span className="block text-xs mt-0.5 text-[#6B9B87]">{price}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Leistentyp Rechts – only one option */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Leistentyp Rechts</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {leftOptions.map(({ value, label, price }) => (
            <button
              key={value}
              type="button"
              onClick={() => selectRight(value)}
              className={cn(
                buttonBase,
                getRightSelected() === value ? buttonActive : buttonInactive
              )}
            >
              <span className="block">{label}</span>
              {price && <span className="block text-xs mt-0.5 text-[#6B9B87]">{price}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});

Leistentyp.displayName = 'Leistentyp';

export default Leistentyp;
