'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import SectionCardHeader from './SectionCardHeader';
import { STANDARD_POLSTERUNG_MM, type PolsterungMmFields } from './polsterungPayload';

const ACTIVE_GREEN = 'bg-[#679C7A] text-white shadow-sm';

const MM_SELECT_TRIGGER_CLASS =
  'h-9 min-h-9 w-full border-gray-300 bg-white px-2.5 py-0 text-sm shadow-sm';

/** Pro Feld nur der eine Standard-mm-Wert (keine Mehrfachliste). */
function MmSelect({
  id,
  value,
  onChange,
  standardMm,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  standardMm: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={MM_SELECT_TRIGGER_CLASS}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={standardMm} className="cursor-pointer">
          {standardMm} mm
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export type PolsterungCardProps = {
  polsterung: string[];
  setPolsterung: (items: string[]) => void;
  polsterungText: string;
  setPolsterungText: (text: string) => void;
  polsterungMm: PolsterungMmFields;
  setPolsterungMm: Dispatch<SetStateAction<PolsterungMmFields>>;
};

export default function PolsterungCard({
  polsterung,
  setPolsterung,
  polsterungText,
  setPolsterungText,
  polsterungMm,
  setPolsterungMm,
}: PolsterungCardProps) {
  const isErweitert = polsterung.includes('Erweitert');

  const mmForSelect = (raw: string, onlyAllowed: string) => {
    const t = raw.trim();
    return t === onlyAllowed ? t : onlyAllowed;
  };

  useEffect(() => {
    if (!isErweitert) return;
    setPolsterungMm((prev) => {
      const next: PolsterungMmFields = {
        abschluss: mmForSelect(prev.abschluss, STANDARD_POLSTERUNG_MM.abschluss),
        knoechel: mmForSelect(prev.knoechel, STANDARD_POLSTERUNG_MM.knoechel),
        lasche: mmForSelect(prev.lasche, STANDARD_POLSTERUNG_MM.lasche),
        ferse: mmForSelect(prev.ferse, STANDARD_POLSTERUNG_MM.ferse),
      };
      if (
        prev.abschluss === next.abschluss &&
        prev.knoechel === next.knoechel &&
        prev.lasche === next.lasche &&
        prev.ferse === next.ferse
      ) {
        return prev;
      }
      return next;
    });
  }, [isErweitert, setPolsterungMm]);

  const setMode = (mode: 'standard' | 'erweitert') => {
    if (mode === 'standard') {
      setPolsterung(['Standard']);
      setPolsterungMm({ abschluss: '', knoechel: '', lasche: '', ferse: '' });
    } else {
      setPolsterung(['Erweitert']);
      setPolsterungMm({ ...STANDARD_POLSTERUNG_MM });
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionCardHeader
          className="mb-0 min-w-0 lg:max-w-[min(100%,28rem)]"
          icon={Shield}
          title="Polsterung"
          subtitle="Standard oder individuelle Polsterdicken"
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
        <p className="text-sm text-gray-600">
          Standard-Polsterung wird verwendet. Keine weiteren Eingaben erforderlich.
        </p>
      )}

      {isErweitert && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-900 sm:text-sm">Abschlusspolster</span>
              <MmSelect
                id="polsterung-abschluss"
                value={mmForSelect(polsterungMm.abschluss, STANDARD_POLSTERUNG_MM.abschluss)}
                onChange={(v) => setPolsterungMm((m) => ({ ...m, abschluss: v }))}
                standardMm={STANDARD_POLSTERUNG_MM.abschluss}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-900 sm:text-sm">Knöchelpolster</span>
              <MmSelect
                id="polsterung-knoechel"
                value={mmForSelect(polsterungMm.knoechel, STANDARD_POLSTERUNG_MM.knoechel)}
                onChange={(v) => setPolsterungMm((m) => ({ ...m, knoechel: v }))}
                standardMm={STANDARD_POLSTERUNG_MM.knoechel}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-900 sm:text-sm">Lasche</span>
              <MmSelect
                id="polsterung-lasche"
                value={mmForSelect(polsterungMm.lasche, STANDARD_POLSTERUNG_MM.lasche)}
                onChange={(v) => setPolsterungMm((m) => ({ ...m, lasche: v }))}
                standardMm={STANDARD_POLSTERUNG_MM.lasche}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-900 sm:text-sm">Ferse</span>
              <MmSelect
                id="polsterung-ferse"
                value={mmForSelect(polsterungMm.ferse, STANDARD_POLSTERUNG_MM.ferse)}
                onChange={(v) => setPolsterungMm((m) => ({ ...m, ferse: v }))}
                standardMm={STANDARD_POLSTERUNG_MM.ferse}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-900 sm:text-sm">Spezielle Anmerkung</span>
            <Textarea
              placeholder="z. B. Polsterdicke in mm, asymmetrisch, extraweich…"
              className="min-h-[100px] w-full border-gray-300 text-sm"
              value={polsterungText}
              onChange={(e) => setPolsterungText(e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
