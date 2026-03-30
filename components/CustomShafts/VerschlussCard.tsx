'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronDown, Link2 } from 'lucide-react';
import SectionCardHeader from './SectionCardHeader';
import { cn } from '@/lib/utils';

/** Selected segment (Nein or Ja) — muted green (reference UI) */
const ACTIVE_GREEN_CLASS = 'bg-[#679C7A] text-white shadow-sm';
const PRICE_ACCENT_CLASS = 'text-[#679C7A]';

/** Nein / Ja with long labels; selected segment stays green (click does not clear to blank) */
function SegmentedEyeletsAddon({
  value,
  onChange,
  labelNein,
  labelJa,
}: {
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
  labelNein: React.ReactNode;
  labelJa: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-100 p-0.5">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'flex min-h-9 flex-1 items-center justify-center rounded-md px-1.5 py-2 text-center text-xs font-medium transition-colors sm:px-2 sm:text-sm',
          value === false ? ACTIVE_GREEN_CLASS : 'text-gray-700 hover:bg-white/60'
        )}
      >
        {labelNein}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'flex min-h-9 flex-1 items-center justify-center rounded-md px-1.5 py-2 text-center text-xs font-medium leading-snug transition-colors sm:px-2 sm:text-sm',
          value === true ? ACTIVE_GREEN_CLASS : 'text-gray-700 hover:bg-white/60'
        )}
      >
        {labelJa}
      </button>
    </div>
  );
}

const inputWithSuffixClass =
  'h-9 min-h-9 w-full rounded-md border border-gray-300 bg-white px-2.5 pr-11 text-sm shadow-sm';

function SuffixInput({
  value,
  onChange,
  placeholder,
  suffix,
  id,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix: string;
  id?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode={inputMode}
        placeholder={placeholder}
        className={inputWithSuffixClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
        {suffix}
      </span>
    </div>
  );
}

export type VerschlussCardProps = {
  closureType: string;
  /** Updates closure type; parent may clear Schnürsenkel/Ösen when switching to Klett */
  onClosureTypeChange: (type: string) => void;
  offenstandSchnuerungMm: string;
  setOffenstandSchnuerungMm: (v: string) => void;
  anzahlOesen: string;
  setAnzahlOesen: (v: string) => void;
  anzahlHaken: string;
  setAnzahlHaken: (v: string) => void;
  anzahlKlettstreifen: string;
  setAnzahlKlettstreifen: (v: string) => void;
  breiteKlettstreifenMm: string;
  setBreiteKlettstreifenMm: (v: string) => void;
  passendenSchnursenkel: boolean | undefined;
  onPassendenSchnursenkelChange: (v: boolean | undefined) => void;
  osenEinsetzen: boolean | undefined;
  onOsenEinsetzenChange: (v: boolean | undefined) => void;
};

export default function VerschlussCard({
  closureType,
  onClosureTypeChange,
  offenstandSchnuerungMm,
  setOffenstandSchnuerungMm,
  anzahlOesen,
  setAnzahlOesen,
  anzahlHaken,
  setAnzahlHaken,
  anzahlKlettstreifen,
  setAnzahlKlettstreifen,
  breiteKlettstreifenMm,
  setBreiteKlettstreifenMm,
  passendenSchnursenkel,
  onPassendenSchnursenkelChange,
  osenEinsetzen,
  onOsenEinsetzenChange,
}: VerschlussCardProps) {
  const [advancedEyeletsOpen, setAdvancedEyeletsOpen] = useState(false);
  const [advancedVelcroOpen, setAdvancedVelcroOpen] = useState(false);

  const showEyeletsDetails = closureType === 'Eyelets';
  const showVelcroDetails = closureType === 'Velcro';

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionCardHeader icon={Link2} title="Verschluss" subtitle="Verschlussart und Details" />

      <div className="flex flex-col gap-5">
        <div className="flex min-w-0 flex-col gap-1.5 mt-5">
          <span className="text-xs font-semibold text-gray-900 sm:text-sm">Verschlussart</span>
          <div className="flex w-full gap-1 rounded-lg border border-gray-200 bg-gray-100 p-0.5 sm:max-w-xl">
            <button
              type="button"
              onClick={() => onClosureTypeChange('Eyelets')}
              className={cn(
                'flex-1 rounded-md px-2 py-2 text-center text-sm font-medium transition-colors sm:px-3',
                closureType === 'Eyelets' ? ACTIVE_GREEN_CLASS : 'text-gray-700 hover:bg-white/60'
              )}
            >
              Ösen (Schnürung)
            </button>
            <button
              type="button"
              onClick={() => onClosureTypeChange('Velcro')}
              className={cn(
                'flex-1 rounded-md px-2 py-2 text-center text-sm font-medium transition-colors sm:px-3',
                closureType === 'Velcro' ? ACTIVE_GREEN_CLASS : 'text-gray-700 hover:bg-white/60'
              )}
            >
              Klettverschluss
            </button>
          </div>
        </div>

        {showEyeletsDetails && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
              <span className="shrink-0 text-xs font-semibold text-gray-900 sm:text-sm lg:max-w-[min(100%,280px)] lg:pt-0.5">
                Passende Schnürsenkel zum Schuh?
              </span>
              <SegmentedEyeletsAddon
                value={passendenSchnursenkel}
                onChange={onPassendenSchnursenkelChange}
                labelNein="Nein, ohne"
                labelJa={
                  <>
                    Ja, mit passenden Schnürsenkel{' '}
                    <span
                      className={cn(
                        'font-semibold',
                        passendenSchnursenkel === true ? 'text-white' : PRICE_ACCENT_CLASS
                      )}
                    >
                      +4,49 €
                    </span>
                  </>
                }
              />
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
              <span className="shrink-0 text-xs font-semibold text-gray-900 sm:text-sm lg:max-w-[min(100%,280px)] lg:pt-0.5">
                Schaft bereits mit eingesetzten Ösen?
              </span>
              <SegmentedEyeletsAddon
                value={osenEinsetzen}
                onChange={onOsenEinsetzenChange}
                labelNein="Nein, ohne Ösen"
                labelJa={
                  <>
                    Ja, Ösen einsetzen{' '}
                    <span
                      className={cn(
                        'font-semibold',
                        osenEinsetzen === true ? 'text-white' : PRICE_ACCENT_CLASS
                      )}
                    >
                      +8,99 €
                    </span>
                  </>
                }
              />
            </div>
          </div>
        )}

        {showEyeletsDetails && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAdvancedEyeletsOpen((o) => !o)}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200/80"
            >
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-gray-600 transition-transform', advancedEyeletsOpen && 'rotate-180')}
              />
              Erweiterte Optionen (Ösen / Haken / Löcher)
            </button>
            {advancedEyeletsOpen && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">Offenstand der Schnürung</span>
                  <SuffixInput
                    id="offenstand-schnuerung"
                    placeholder="Offenstand eingeben"
                    suffix="mm"
                    inputMode="decimal"
                    value={offenstandSchnuerungMm}
                    onChange={setOffenstandSchnuerungMm}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">Anzahl Ösen</span>
                  <SuffixInput
                    id="anzahl-oesen"
                    placeholder=""
                    suffix="Stk"
                    inputMode="numeric"
                    value={anzahlOesen}
                    onChange={setAnzahlOesen}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">Anzahl Haken</span>
                  <SuffixInput
                    id="anzahl-haken"
                    placeholder=""
                    suffix="Stk"
                    inputMode="numeric"
                    value={anzahlHaken}
                    onChange={setAnzahlHaken}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {showVelcroDetails && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAdvancedVelcroOpen((o) => !o)}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200/80"
            >
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-gray-600 transition-transform', advancedVelcroOpen && 'rotate-180')}
              />
              Erweiterte Optionen (Klettstreifen / Breite)
            </button>
            {advancedVelcroOpen && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">Offenstand der Schnürung</span>
                  <SuffixInput
                    id="offenstand-schnuerung"
                    placeholder="Offenstand eingeben"
                    suffix="mm"
                    inputMode="decimal"
                    value={offenstandSchnuerungMm}
                    onChange={setOffenstandSchnuerungMm}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">Anzahl Klettstreifen</span>
                  <SuffixInput
                    id="anzahl-klettstreifen"
                    placeholder=""
                    suffix="Stk"
                    inputMode="numeric"
                    value={anzahlKlettstreifen}
                    onChange={setAnzahlKlettstreifen}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">Breite Klettstreifen</span>
                  <SuffixInput
                    id="breite-klettstreifen"
                    placeholder=""
                    suffix="mm"
                    inputMode="decimal"
                    value={breiteKlettstreifenMm}
                    onChange={setBreiteKlettstreifenMm}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
