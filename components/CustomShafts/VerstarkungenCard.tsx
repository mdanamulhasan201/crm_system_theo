'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import SectionCardHeader from './SectionCardHeader';

const ACTIVE_GREEN = 'bg-[#679C7A] text-white shadow-sm';

export type VerstarkungenCardProps = {
  verstarkungen: string[];
  setVerstarkungen: Dispatch<SetStateAction<string[]>>;
  verstarkungenText: string;
  setVerstarkungenText: (text: string) => void;
};

export default function VerstarkungenCard({
  verstarkungen,
  setVerstarkungen,
  verstarkungenText,
  setVerstarkungenText,
}: VerstarkungenCardProps) {
  const [erweitertOhneAuswahl, setErweitertOhneAuswahl] = useState(false);

  const isErweitert =
    verstarkungen.length === 1 && verstarkungen[0] === 'Standard'
      ? false
      : verstarkungen.length > 0
        ? true
        : erweitertOhneAuswahl;

  const setMode = (mode: 'standard' | 'erweitert') => {
    if (mode === 'standard') {
      setErweitertOhneAuswahl(false);
      setVerstarkungen(['Standard']);
      setVerstarkungenText('');
    } else {
      setErweitertOhneAuswahl(true);
      setVerstarkungen([]);
    }
  };

  /** Nur noch Freitext: alte Checkbox-Werte in `verstarkungen` verwerfen. */
  useEffect(() => {
    if (!isErweitert) return;
    setVerstarkungen((prev) => (prev.length > 0 ? [] : prev));
  }, [isErweitert, setVerstarkungen]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionCardHeader
          className="mb-0 min-w-0 lg:max-w-[min(100%,28rem)]"
          icon={Layers}
          title="Verstärkungen"
          subtitle="Bereiche und Material"
        />

        <div className="flex w-full max-w-md shrink-0 gap-1 rounded-lg border border-gray-200 bg-gray-100 p-0.5 lg:w-auto lg:min-w-[280px]">
          <button
            type="button"
            onClick={() => setMode('standard')}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              !isErweitert ? ACTIVE_GREEN : 'text-gray-700 hover:bg-white/60'
            )}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setMode('erweitert')}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isErweitert ? ACTIVE_GREEN : 'text-gray-700 hover:bg-white/60'
            )}
          >
            Erweitert
          </button>
        </div>
      </div>

      {!isErweitert && (
        <p className="text-sm text-gray-600">Standard-Verstärkung wird angewendet.</p>
      )}

      {isErweitert && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-900 sm:text-sm">Angaben zu Verstärkungen</span>
          <Textarea
            placeholder="z. B. gewünschte Bereiche, Material, Stärke…"
            className="min-h-[120px] w-full border-gray-300 text-sm"
            value={verstarkungenText}
            onChange={(e) => setVerstarkungenText(e.target.value)}
          />
        </div>
      )}
    </section>
  );
}
