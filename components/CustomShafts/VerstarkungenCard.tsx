'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIVE_GREEN = 'bg-[#679C7A] text-white shadow-sm';

const EXTRA_VERSTAERKUNGEN = ['Fersenverstärkung', 'Innen-Außenknöchel', 'Vorderfuß'] as const;

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
  /** Nur nötig, wenn Liste leer ist und Nutzer trotzdem „Erweitert“ gewählt hat. */
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
      setVerstarkungen((prev) => {
        const ohneStandard = prev.filter((x) => x !== 'Standard');
        return ohneStandard.length ? ohneStandard : [];
      });
    }
  };

  const toggleExtra = (option: string, checked: boolean) => {
    setVerstarkungen((prev) => {
      const base = prev.filter((x) => x !== 'Standard');
      if (checked) {
        return base.includes(option) ? base : [...base, option];
      }
      return base.filter((item) => item !== option);
    });
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#679C7A]/15 text-[#679C7A]"
            aria-hidden
          >
            <Layers className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">Verstärkungen</h3>
            <p className="mt-1 text-sm text-gray-500">Bereiche und Material</p>
          </div>
        </div>

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
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-gray-900 sm:text-sm">Zusätzliche Verstärkungen</span>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {EXTRA_VERSTAERKUNGEN.map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={verstarkungen.includes(option)}
                    onChange={(e) => toggleExtra(option, e.target.checked)}
                  />
                  <span className="text-sm text-gray-800">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-900 sm:text-sm">Besondere Anmerkung</span>
            <Textarea
              placeholder="z. B. Material, Stärke, Position…"
              className="min-h-[100px] w-full border-gray-300 text-sm"
              value={verstarkungenText}
              onChange={(e) => setVerstarkungenText(e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
