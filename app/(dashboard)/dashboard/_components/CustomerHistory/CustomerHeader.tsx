'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Edit, Loader2 } from 'lucide-react';

function formatGeburtsdatum(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

export interface CustomerHeaderProps {
  customerData: {
    vorname?: string | null;
    nachname?: string | null;
    geburtsdatum?: string | null;
    customerNumber?: number | string | null;
    id?: string;
  };
  isEditing?: boolean;
  isDeleting?: boolean;
  isUpdating?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export default function CustomerHeader({
  customerData,
  isEditing = false,
  isDeleting = false,
  isUpdating = false,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: CustomerHeaderProps) {
  const fullName = [customerData.vorname, customerData.nachname].filter(Boolean).join(' ') || '—';
  const customerId = customerData.customerNumber != null ? String(customerData.customerNumber) : '';
  const gebFormatted = formatGeburtsdatum(customerData.geburtsdatum);
  const hasDetails = customerId || gebFormatted;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
            {fullName}
          </h1>
          {hasDetails && (
            <p className="mt-1 text-sm text-gray-400 flex flex-wrap items-center gap-1.5">
              {customerId && <span>ID: {customerId}</span>}
              {customerId && gebFormatted && (
                <span className="text-gray-400" aria-hidden>•</span>
              )}
              {gebFormatted && <span>Geb. {gebFormatted}</span>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-lg bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Löschen...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4" />
                  Löschen
                </>
              )}
            </Button>
          )}

          {!isEditing ? (
            onEdit && (
              <Button
                type="button"
                onClick={onEdit}
                className="rounded-lg bg-[#61A178] hover:bg-[#528c68] text-white cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Bearbeiten
              </Button>
            )
          ) : (
            <>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isUpdating}
                  className="rounded-lg bg-gray-100 border-gray-200 text-gray-700 cursor-pointer"
                >
                  Abbrechen
                </Button>
              )}
              {onSave && (
                <Button
                  type="button"
                  onClick={onSave}
                  disabled={isUpdating}
                  className="rounded-lg bg-[#61A178] hover:bg-[#528c68] text-white cursor-pointer"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpdating ? 'Speichern...' : 'Speichern'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
