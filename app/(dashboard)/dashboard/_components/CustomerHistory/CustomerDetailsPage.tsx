'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import WohnortInput from '@/app/(dashboard)/dashboard/_components/Customers/WohnortInput';

function formatDateForDisplay(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-3 shadow-sm',
        className
      )}
    >
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  placeholder,
  asSelect,
  selectValue,
  selectOptions,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  asSelect?: boolean;
  selectValue?: string;
  selectOptions?: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium text-gray-500">{label}</Label>
      {isEditing ? (
        asSelect && selectOptions ? (
          <Select value={selectValue || ''} onValueChange={(v) => onChange?.(v)}>
            <SelectTrigger className="h-8 text-xs rounded-lg border-gray-200 bg-white text-gray-900">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs rounded-lg border-gray-200 bg-white text-gray-900 font-medium"
          />
        )
      ) : (
        <p className="text-sm font-semibold text-gray-900 min-h-7 flex items-center">
          {value || '—'}
        </p>
      )}
    </div>
  );
}

export interface CustomerDetailsPageProps {
  /** Current customer data from API */
  data: {
    gender?: string | null;
    vorname?: string | null;
    nachname?: string | null;
    geburtsdatum?: string | null;
    email?: string | null;
    telefon?: string | null;
    telefonnummer?: string | null;
    wohnort?: string | null;
    straße?: string | null;
    land?: string | null;
    billingType?: string | null;
    customerNumber?: number | string | null;
    firmenname?: string | null;
    firmenStrasse?: string | null;
    firmenPLZ?: string | null;
    firmenOrt?: string | null;
    firmenLand?: string | null;
    firmenUID?: string | null;
    prescription?: {
      prescription_number?: string | null;
      insurance_provider?: string | null;
      insurance_number?: string | null;
    } | null;
  };
  /** Form state when editing */
  editFormData: {
    gender?: string;
    geburtsdatum?: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    telefonnummer?: string;
    wohnort?: string;
    straße?: string;
    land?: string;
    billingType?: string;
    firmenname?: string;
    firmenStrasse?: string;
    firmenPLZ?: string;
    firmenOrt?: string;
    firmenLand?: string;
    firmenUID?: string;
  };
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
  formatDateForInput: (dateString: string | undefined) => string;
  normalizeGender: (value: string | undefined) => string;
}

export default function CustomerDetailsPage({
  data,
  editFormData,
  isEditing,
  onInputChange,
  formatDateForInput,
  normalizeGender,
}: CustomerDetailsPageProps) {
  const customerId = data.customerNumber != null ? String(data.customerNumber) : '—';
  const addressDisplay = data.wohnort || data.straße || '';
  const addressEdit = editFormData.wohnort || editFormData.straße || '';
  const phoneDisplay = data.telefonnummer || data.telefon || '';
  const phoneEdit = editFormData.telefonnummer || editFormData.telefon || '';
  const billingDisplay =
    data.billingType === 'privat'
      ? 'Privat'
      : data.billingType === 'krankenkasse'
        ? 'Krankenkasse'
        : data.billingType || '—';
  const currentGender = isEditing ? editFormData.gender : normalizeGender(data.gender ?? undefined);
  const genderValue = currentGender || 'keine';
  const genderOptions = [
    { value: 'MALE', label: 'Herr' },
    { value: 'frau', label: 'Frau' },
    { value: 'keine', label: 'Keine Angabe' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Gender selection – shadcn tabs as segmented control */}
      <Tabs
        value={genderValue}
        onValueChange={(v) => isEditing && onInputChange('gender', v)}
        className="w-fit"
      >
        <TabsList
          className={cn(
            'h-9 rounded-lg bg-gray-100 p-[3px] ',
            !isEditing && 'pointer-events-none opacity-90'
          )}
        >
          {genderOptions.map((opt) => (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className="px-4 py-1.5 cursor-pointer  text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. PERSÖNLICHE DATEN (incl. Kunden-ID) */}
        <Card title="Persönliche Daten">
          <Field
            label="Vorname"
            value={isEditing ? (editFormData.vorname ?? data.vorname ?? '') : (data.vorname || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('vorname', v)}
            placeholder="Vorname"
          />
          <Field
            label="Nachname"
            value={isEditing ? (editFormData.nachname ?? data.nachname ?? '') : (data.nachname || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('nachname', v)}
            placeholder="Nachname"
          />
          <Field
            label="Geburtsdatum"
            value={
              isEditing
                ? formatDateForInput(editFormData.geburtsdatum)
                : formatDateForDisplay(data.geburtsdatum)
            }
            isEditing={isEditing}
            onChange={(v) => onInputChange('geburtsdatum', v)}
            type="date"
          />
          <Field
            label="Kunden-ID"
            value={customerId}
            isEditing={false}
          />
        </Card>

        {/* 2. KONTAKTDATEN */}
        <Card title="Kontaktdaten">
          <Field
            label="E-Mail"
            value={isEditing ? (editFormData.email ?? data.email ?? '') : (data.email || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('email', v)}
            type="email"
            placeholder="E-Mail"
          />
          <Field
            label="Telefon"
            value={isEditing ? phoneEdit : phoneDisplay}
            isEditing={isEditing}
            onChange={(v) => {
              onInputChange('telefonnummer', v);
              onInputChange('telefon', v);
            }}
            placeholder="Telefon"
          />
          {/* Adresse: when editing use same location API / select as create (WohnortInput) */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-gray-500">Adresse</Label>
            {isEditing ? (
              <WohnortInput
                value={addressEdit}
                onChange={(v) => {
                  onInputChange('wohnort', v);
                  onInputChange('straße', v);
                }}
                hideLabel
                placeholder="Stadt, PLZ, Adresse (z.B. Musterstraße 123, Berlin, DE)"
              />
            ) : (
              <p className="text-sm font-semibold text-gray-900 min-h-7 flex items-center">
                {addressDisplay || '—'}
              </p>
            )}
          </div>
        </Card>

        {/* 3. VERSICHERUNG */}
        <Card title="Versicherung">
          <Field
            label="Versichertennummer"
            value={data.prescription?.insurance_number || ''}
            isEditing={false}
          />
          <Field
            label="Kostenträger"
            value={data.prescription?.insurance_provider || billingDisplay}
            isEditing={false}
          />
        </Card>

        {/* 4. Firmendaten (für Rechnungen) - former Erweitert content */}
        <Card title="Firmendaten (für Rechnungen)">
          <Field
            label="Firmenname"
            value={isEditing ? (editFormData.firmenname ?? '') : (data.firmenname || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('firmenname', v)}
            placeholder="Firmenname"
          />
          <Field
            label="Straße + Hausnummer"
            value={isEditing ? (editFormData.firmenStrasse ?? '') : (data.firmenStrasse || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('firmenStrasse', v)}
            placeholder="Straße und Hausnummer"
          />
          <Field
            label="PLZ"
            value={isEditing ? (editFormData.firmenPLZ ?? '') : (data.firmenPLZ || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('firmenPLZ', v)}
            placeholder="PLZ"
          />
          <Field
            label="Ort"
            value={isEditing ? (editFormData.firmenOrt ?? '') : (data.firmenOrt || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('firmenOrt', v)}
            placeholder="Ort"
          />
          <Field
            label="Land"
            value={isEditing ? (editFormData.firmenLand ?? '') : (data.firmenLand || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('firmenLand', v)}
            placeholder="Land"
          />
          <Field
            label="UID / Steuernummer"
            value={isEditing ? (editFormData.firmenUID ?? '') : (data.firmenUID || '')}
            isEditing={isEditing}
            onChange={(v) => onInputChange('firmenUID', v)}
            placeholder="UID / Steuernummer"
          />
        </Card>
      </div>
    </div>
  );
}
