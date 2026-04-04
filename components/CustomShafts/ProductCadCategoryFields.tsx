'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionCardHeader from './SectionCardHeader';

const CATEGORY_OPTIONS = [
  { value: 'Halbschuhe', label: 'Halbschuhe', price: 209.99 },
  { value: 'Stiefel', label: 'Stiefel', price: 314.99 },
  { value: 'Knöchelhoch', label: 'Knöchelhoch', price: 219.99 },
  { value: 'Sandalen', label: 'Sandalen', price: 189.99 },
  { value: 'Bergschuhe', label: 'Bergschuhe', price: 234.99 },
  { value: 'Businessschuhe', label: 'Businessschuhe', price: 224.99 },
] as const;

/** Same compact height for CAD + Kategorie (card + stacked) */
const FIELD_CONTROL_CLASS =
  'h-9 min-h-9 w-full border-gray-300 bg-white px-2.5 py-0 text-sm shadow-sm';

export interface ProductCadCategoryFieldsProps {
  cadModeling: '1x' | '2x';
  setCadModeling: (value: '1x' | '2x') => void;
  customCategory: string;
  setCustomCategory: (value: string) => void;
  setCustomCategoryPrice: (price: number | null) => void;
  category?: string;
  allowCategoryEdit?: boolean;
  /** `card` = two columns in hero (Select + Kategorie); `stacked` = original radios + rows */
  layout?: 'card' | 'stacked';
  /** When true, omit CAD surcharge text (e.g. „+6,99 €“) — e.g. Maßschuhauftrag step 5 intern modal */
  hideCadPriceSuffix?: boolean;
}

export default function ProductCadCategoryFields({
  cadModeling,
  setCadModeling,
  customCategory,
  setCustomCategory,
  setCustomCategoryPrice,
  category,
  allowCategoryEdit = false,
  layout = 'stacked',
  hideCadPriceSuffix = false,
}: ProductCadCategoryFieldsProps) {
  const isCategoryEditable = allowCategoryEdit;

  const handleCategoryChange = (value: string) => {
    setCustomCategory(value);
    const found = CATEGORY_OPTIONS.find((opt) => opt.value === value);
    if (found) {
      setCustomCategoryPrice(found.price);
    } else {
      setCustomCategoryPrice(null);
    }
  };

  if (layout === 'card') {
    return (
      <div className="flex flex-col gap-5">
        <SectionCardHeader
          title=""
          subtitle=""
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex min-h-8 items-center gap-2">
            <Label className="text-xs font-semibold text-gray-900 sm:text-sm">CAD-Modellierung</Label>
            <div className="relative group">
              <div className="flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
                <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-80 rounded bg-gray-800 p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                Bei deutlich unterschiedlichen Füßen bzw. Leisten empfehlen wir zwei separate CAD-Modellierungen. So kann jede Seite
                individuell angepasst werden und die Passform wird präziser.
              </div>
            </div>
          </div>
          <Select value={cadModeling} onValueChange={(v) => setCadModeling(v as '1x' | '2x')}>
            <SelectTrigger className={FIELD_CONTROL_CLASS}>
              <SelectValue placeholder="CAD-Modellierung wählen…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1x" className="cursor-pointer">
                1× CAD-Modellierung (Standard)
              </SelectItem>
              <SelectItem value="2x" className="cursor-pointer">
                {hideCadPriceSuffix
                  ? '2× CAD-Modellierung (separat)'
                  : '2× CAD-Modellierung (separat) (+6,99 €)'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex min-h-8 items-center text-xs font-semibold text-gray-900 sm:text-sm">Kategorie</Label>
          {isCategoryEditable ? (
            <Select value={customCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className={FIELD_CONTROL_CLASS}>
                <SelectValue placeholder="Kategorie wählen…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} className="cursor-pointer" value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="text"
              readOnly
              value={category || ''}
              className={`${FIELD_CONTROL_CLASS} cursor-not-allowed bg-gray-50`}
            />
          )}
        </div>
        </div>
      </div>
    );
  }

  /* stacked — same as previous ProductConfiguration block */
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2 md:w-1/3">
          <Label className="text-base font-medium">CAD-Modellierung</Label>
          <div className="group relative">
            <div className="flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
              <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-80 rounded bg-gray-800 p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Bei deutlich unterschiedlichen Füßen bzw. Leisten empfehlen wir zwei separate CAD-Modellierungen. So kann jede Seite
              individuell angepasst werden und die Passform wird präziser.
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="cadModeling"
              value="1x"
              checked={cadModeling === '1x'}
              onChange={() => setCadModeling('1x')}
              className="h-4 w-4 text-green-500 focus:ring-green-500"
            />
            <span className="text-base text-gray-700">1× CAD-Modellierung (Standard)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
            <input
              type="radio"
              name="cadModeling"
              value="2x"
              checked={cadModeling === '2x'}
              onChange={() => setCadModeling('2x')}
              className="h-4 w-4 text-green-500 focus:ring-green-500"
            />
            <span className="text-base text-gray-700">
              2× CAD-Modellierung (separat)
              {!hideCadPriceSuffix ? (
                <span className="font-semibold text-green-600"> +6,99 €</span>
              ) : null}
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Label className="text-base font-medium md:w-1/3">Kategorie:</Label>
        {isCategoryEditable ? (
          <Select value={customCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className={`${FIELD_CONTROL_CLASS} md:w-1/2`}>
              <SelectValue placeholder="Kategorie wählen..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} className="cursor-pointer" value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            readOnly
            value={category || ''}
            className={`${FIELD_CONTROL_CLASS} cursor-not-allowed bg-gray-50 md:w-1/2`}
          />
        )}
      </div>
    </>
  );
}
