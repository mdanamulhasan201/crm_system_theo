'use client';

import React from 'react';
import { ScanSearch, ScanLine, FolderOpen, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DOCUMENT_OPTIONS = [
  'Kostenvoranschlag (Codex)',
  'Rechnung (Firma)',
  'Datenschutzerklärung',
  'Gebrauchsanweisung',
  'Konformitätserklärung',
  'Mehrkosten-Vereinbarung',
] as const;

export interface FilterButtonProps {
  onVersorgung: () => void;
  onKundenordner: () => void;
  onDocumentClick: (documentType: string) => void;
  isDocumentPopoverOpen: boolean;
  onDocumentPopoverOpenChange: (open: boolean) => void;
}

function ActionCard({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<React.SVGAttributes<SVGElement> & { size?: number }>;
  onClick?: () => void;
}) {
  return (
    <div className="w-full min-w-0">
      <button
        type="button"
        onClick={onClick}
        className="w-full bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-gray-50 transition cursor-pointer"
      >
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-7 h-7 text-gray-500" strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
      </button>
    </div>
  );
}

export default function FilterButton({
  onVersorgung,
  onKundenordner,
  onDocumentClick,
  isDocumentPopoverOpen,
  onDocumentPopoverOpenChange,
}: FilterButtonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full my-10">
      <ActionCard
        label="Scans & Versorgung"
        icon={ScanSearch}
        onClick={onVersorgung}
      />
      <ActionCard
        label="Scan durchführen"
        icon={ScanLine}
        onClick={() => {}}
      />
      <ActionCard
        label="Kundenordner"
        icon={FolderOpen}
        onClick={onKundenordner}
      />
      <FilterButtonZettel
        onDocumentClick={onDocumentClick}
        isDocumentPopoverOpen={isDocumentPopoverOpen}
        onDocumentPopoverOpenChange={onDocumentPopoverOpenChange}
      />
    </div>
  );
}

function FilterButtonZettel({
  onDocumentClick,
  isDocumentPopoverOpen,
  onDocumentPopoverOpenChange,
}: {
  onDocumentClick: (documentType: string) => void;
  isDocumentPopoverOpen: boolean;
  onDocumentPopoverOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="w-full min-w-0">
      <Popover open={isDocumentPopoverOpen} onOpenChange={onDocumentPopoverOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full bg-emerald-50/80 border border-emerald-200/60  rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-emerald-100/80 transition cursor-pointer"
          >
            <div className="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FileText className="w-7 h-7 text-emerald-700" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-emerald-800 text-center">
              Zettel anschaffen
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 bg-white shadow-lg rounded-xl" align="start">
          <div className="flex flex-col py-1">
            {DOCUMENT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onDocumentClick(opt)}
                className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                {opt}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
