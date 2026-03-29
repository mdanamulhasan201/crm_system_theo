'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import SectionCardHeader from './SectionCardHeader';
import type { ZipperPosition } from './ZipperPlacementModal';

const ACTIVE_GREEN = 'bg-[#679C7A] text-white shadow-sm';

export type ZusaetzeOptionenCardProps = {
  value: boolean | undefined;
  effectiveZipperPosition: ZipperPosition | null;
  onZipperSegmentChange: (next: boolean | undefined) => void;
  effektZipperExtra: boolean;
  zipperPlacementImage: string | null;
  shoeImage: string | null;
  onEditZipperPosition: () => void;
};

function ZipperNeinJaPills({
  value,
  onChange,
  jaPriceLabel,
}: {
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
  jaPriceLabel: string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 rounded-xl border border-gray-200 bg-gray-100 p-1 sm:flex-row sm:gap-1">
      <button
        type="button"
        onClick={() => onChange(value === false ? undefined : false)}
        className={cn(
          'flex-1 rounded-full px-3 py-2.5 text-left text-xs font-medium transition-colors sm:text-center sm:text-sm',
          value === false ? ACTIVE_GREEN : 'text-gray-700 hover:bg-white/70'
        )}
      >
        Nein, ohne zusätzlichen Reißverschluss
      </button>
      <button
        type="button"
        onClick={() => onChange(value === true ? undefined : true)}
        className={cn(
          'flex-1 rounded-full px-3 py-2.5 text-left text-xs font-medium transition-colors sm:text-center sm:text-sm',
          value === true ? ACTIVE_GREEN : 'text-gray-700 hover:bg-white/70'
        )}
      >
        Ja, zusätzlichen Reißverschluss {jaPriceLabel}
      </button>
    </div>
  );
}

export default function ZusaetzeOptionenCard({
  value,
  effectiveZipperPosition,
  onZipperSegmentChange,
  effektZipperExtra,
  zipperPlacementImage,
  shoeImage,
  onEditZipperPosition,
}: ZusaetzeOptionenCardProps) {
  const jaPriceLabel =
    effectiveZipperPosition === 'both' ? '+19,99 €' : '+9,99 €';

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionCardHeader
        icon={PackageCheck}
        title="Zusätze & Optionen"
        subtitle="Optionale Zusatzleistungen"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:max-w-md">
          <span className="text-sm font-medium text-gray-900">Zusätzlicher Reißverschluss?</span>
          <p className="text-xs text-gray-500">
            {effectiveZipperPosition === 'both' ? (
              <span className="font-medium text-[#679C7A]">+19,99 €</span>
            ) : (
              <span className="font-medium text-[#679C7A]">+9,99 €</span>
            )}{' '}
            bei Ja (nach Position)
          </p>
        </div>
        <div className="min-w-0 flex-1 lg:pt-0">
          <ZipperNeinJaPills
            value={value}
            onChange={onZipperSegmentChange}
            jaPriceLabel={jaPriceLabel}
          />
        </div>
      </div>

      {effektZipperExtra === true && (zipperPlacementImage || effectiveZipperPosition) && (
        <div className="mt-5 flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 md:flex-row md:items-start">
          <Label className="shrink-0 font-medium text-base text-gray-900 md:w-1/3 md:pt-2">
            Reißverschluss-Position:
          </Label>
          <div className="min-w-0 flex-1 space-y-3">
            {effectiveZipperPosition && (
              <p className="text-sm text-gray-700">
                {effectiveZipperPosition === 'inside' && 'Innen (+9,99 €)'}
                {effectiveZipperPosition === 'outside' && 'Außen (+9,99 €)'}
                {effectiveZipperPosition === 'both' && 'Beide Seiten (+19,99 €)'}
              </p>
            )}
            <div className="relative inline-block max-w-full">
              {zipperPlacementImage && shoeImage ? (
                <div className="relative">
                  <img
                    src={shoeImage}
                    alt="Schuh Basis"
                    className="h-auto max-h-[300px] max-w-full rounded border border-gray-300"
                  />
                  <img
                    src={zipperPlacementImage}
                    alt="Reißverschluss-Markierung"
                    className="absolute left-0 top-0 h-full w-full object-contain"
                  />
                </div>
              ) : zipperPlacementImage ? (
                <img
                  src={zipperPlacementImage}
                  alt="Reißverschluss-Markierung"
                  className="h-auto max-h-[300px] max-w-full rounded border border-gray-300"
                />
              ) : null}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-1" onClick={onEditZipperPosition}>
              Position bearbeiten
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
