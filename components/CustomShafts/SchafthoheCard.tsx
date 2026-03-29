'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler } from 'lucide-react';
import SectionCardHeader from './SectionCardHeader';

function getCircumferenceFieldsForHeight(heightCm: number) {
  const h = heightCm;
  return {
    showUmfang15: h > 15,
    showUmfang16: h > 17,
    showUmfang18: h > 19,
    showKnoechelumfang: h > 13,
    requireCircumference: h > 13,
  };
}

/** Gleiche Höhe / Stil wie SelectTrigger & Inputs in Material-Karte (h-9, border-gray-300) */
const inputWithCmClass =
  'h-9 min-h-9 w-full rounded-md border border-gray-300 bg-white px-2.5 pr-9 text-sm shadow-sm';
const inputErrorClass = 'border-red-500 ring-2 ring-red-200 focus-visible:ring-red-400';

function CmInput({
  value,
  onChange,
  placeholder,
  id,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={`${inputWithCmClass} ${invalid ? inputErrorClass : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
        cm
      </span>
    </div>
  );
}

export type SchafthoheFieldKey =
  | 'schafthoheLinks'
  | 'schafthoheRechts'
  | 'knoechelumfangLinks'
  | 'umfangBei14Links'
  | 'umfangBei16Links'
  | 'umfangBei18Links'
  | 'knoechelumfangRechts'
  | 'umfangBei14Rechts'
  | 'umfangBei16Rechts'
  | 'umfangBei18Rechts';

export type SchafthoheCardProps = {
  schafthoheLinks: string;
  setSchafthoheLinks: (v: string) => void;
  schafthoheRechts: string;
  setSchafthoheRechts: (v: string) => void;
  knoechelumfangLinks: string;
  setKnoechelumfangLinks: (v: string) => void;
  umfangBei14Links: string;
  setUmfangBei14Links: (v: string) => void;
  umfangBei16Links: string;
  setUmfangBei16Links: (v: string) => void;
  umfangBei18Links: string;
  setUmfangBei18Links: (v: string) => void;
  knoechelumfangRechts: string;
  setKnoechelumfangRechts: (v: string) => void;
  umfangBei14Rechts: string;
  setUmfangBei14Rechts: (v: string) => void;
  umfangBei16Rechts: string;
  setUmfangBei16Rechts: (v: string) => void;
  umfangBei18Rechts: string;
  setUmfangBei18Rechts: (v: string) => void;
  /** Pflichtfeld-Highlights nach fehlgeschlagener Validierung */
  fieldErrors?: Partial<Record<SchafthoheFieldKey, boolean>>;
};

export default function SchafthoheCard({
  schafthoheLinks,
  setSchafthoheLinks,
  schafthoheRechts,
  setSchafthoheRechts,
  knoechelumfangLinks,
  setKnoechelumfangLinks,
  umfangBei14Links,
  setUmfangBei14Links,
  umfangBei16Links,
  setUmfangBei16Links,
  umfangBei18Links,
  setUmfangBei18Links,
  knoechelumfangRechts,
  setKnoechelumfangRechts,
  umfangBei14Rechts,
  setUmfangBei14Rechts,
  umfangBei16Rechts,
  setUmfangBei16Rechts,
  umfangBei18Rechts,
  setUmfangBei18Rechts,
  fieldErrors = {},
}: SchafthoheCardProps) {
  const leftH = parseFloat(schafthoheLinks);
  const rightH = parseFloat(schafthoheRechts);
  const leftFields = getCircumferenceFieldsForHeight(leftH);
  const rightFields = getCircumferenceFieldsForHeight(rightH);
  const showBeinmasse = leftFields.requireCircumference || rightFields.requireCircumference;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionCardHeader icon={Ruler} title="Schafthöhe" subtitle="Höhe und Beinmaße konfigurieren" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-900 sm:text-sm">Schaft Links</span>
          <CmInput
            id="field-schafthohe-links"
            placeholder="z. B. 14"
            value={schafthoheLinks}
            onChange={setSchafthoheLinks}
            invalid={!!fieldErrors.schafthoheLinks}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-900 sm:text-sm">Schaft Rechts</span>
          <CmInput
            id="field-schafthohe-rechts"
            placeholder="z. B. 14"
            value={schafthoheRechts}
            onChange={setSchafthoheRechts}
            invalid={!!fieldErrors.schafthoheRechts}
          />
        </div>
      </div>

      {showBeinmasse && (
        <>
          <div className="my-6 border-t border-gray-200" />
          <p className="mb-4 text-sm font-medium text-emerald-700">
            Beinmaße erforderlich (Schafthöhe &gt; 13 cm)
          </p>

          {leftFields.requireCircumference && (
            <div className="mb-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Links
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {leftFields.showKnoechelumfang && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">Knöchelumfang</Label>
                    <CmInput
                      id="field-knoechelumfang-links"
                      placeholder="z. B. 24"
                      value={knoechelumfangLinks}
                      onChange={setKnoechelumfangLinks}
                      invalid={!!fieldErrors.knoechelumfangLinks}
                    />
                  </div>
                )}
                {leftFields.showUmfang15 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">15 cm Höhe (ab Boden)</Label>
                    <CmInput
                      id="field-umfang-14-links"
                      placeholder="z. B. 26"
                      value={umfangBei14Links}
                      onChange={setUmfangBei14Links}
                      invalid={!!fieldErrors.umfangBei14Links}
                    />
                  </div>
                )}
                {leftFields.showUmfang16 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">16 cm Höhe (ab Boden)</Label>
                    <CmInput
                      id="field-umfang-16-links"
                      placeholder="z. B. 27"
                      value={umfangBei16Links}
                      onChange={setUmfangBei16Links}
                      invalid={!!fieldErrors.umfangBei16Links}
                    />
                  </div>
                )}
                {leftFields.showUmfang18 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">18 cm Höhe (ab Boden)</Label>
                    <CmInput
                      id="field-umfang-18-links"
                      placeholder="z. B. 28"
                      value={umfangBei18Links}
                      onChange={setUmfangBei18Links}
                      invalid={!!fieldErrors.umfangBei18Links}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Nur erforderlich, wenn kein Leisten vorliegt oder der vorhandene Leisten für höhere
                Schafthöhen nicht ausreichend ist.
              </p>
            </div>
          )}

          {rightFields.requireCircumference && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Rechts
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {rightFields.showKnoechelumfang && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">Knöchelumfang</Label>
                    <CmInput
                      id="field-knoechelumfang-rechts"
                      placeholder="z. B. 24"
                      value={knoechelumfangRechts}
                      onChange={setKnoechelumfangRechts}
                      invalid={!!fieldErrors.knoechelumfangRechts}
                    />
                  </div>
                )}
                {rightFields.showUmfang15 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">15 cm Höhe (ab Boden)</Label>
                    <CmInput
                      id="field-umfang-14-rechts"
                      placeholder="z. B. 26"
                      value={umfangBei14Rechts}
                      onChange={setUmfangBei14Rechts}
                      invalid={!!fieldErrors.umfangBei14Rechts}
                    />
                  </div>
                )}
                {rightFields.showUmfang16 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">16 cm Höhe (ab Boden)</Label>
                    <CmInput
                      id="field-umfang-16-rechts"
                      placeholder="z. B. 27"
                      value={umfangBei16Rechts}
                      onChange={setUmfangBei16Rechts}
                      invalid={!!fieldErrors.umfangBei16Rechts}
                    />
                  </div>
                )}
                {rightFields.showUmfang18 && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-900 sm:text-sm">18 cm Höhe (ab Boden)</Label>
                    <CmInput
                      id="field-umfang-18-rechts"
                      placeholder="z. B. 28"
                      value={umfangBei18Rechts}
                      onChange={setUmfangBei18Rechts}
                      invalid={!!fieldErrors.umfangBei18Rechts}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Nur erforderlich, wenn kein Leisten vorliegt oder der vorhandene Leisten für höhere
                Schafthöhen nicht ausreichend ist.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
