'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from '@/components/ui/textarea';

export interface BemerkungenData {
  bemerkungen: string;
}

export interface BemerkungenRef {
  getData: () => BemerkungenData;
}

const Bemerkungen = forwardRef<BemerkungenRef>((props, ref) => {
  const [bemerkungen, setBemerkungen] = useState<string>('');

  useImperativeHandle(ref, () => ({
    getData: () => ({ bemerkungen }),
  }));

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#2563eb] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Bemerkungen
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 mb-4">
        Weitere Anmerkungen oder besondere Wünsche
      </p>

      {/* Textarea */}
      <Textarea
        value={bemerkungen}
        onChange={(e) => setBemerkungen(e.target.value)}
        placeholder="Besondere Hinweise, Anpassungen oder Wünsche hier eintragen..."
        className="min-h-[120px] rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 resize-y"
      />
    </section>
  );
});

Bemerkungen.displayName = 'Bemerkungen';

export default Bemerkungen;

