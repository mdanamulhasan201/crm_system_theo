'use client';

import React from 'react';
import {
  ChevronRight,
  Cloud,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from './types';

type HeaderCustomDriveProps = {
  folderCount: number;
  fileCount: number;
  breadcrumbs: BreadcrumbItem[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isMutating: boolean;
  selectedCount: number;
  onRefresh: () => void;
  onOpenCreateFolder: () => void;
  onUploadClick: () => void;
  onDeleteSelected: () => void;
  onSearchChange: (value: string) => void;
  onBreadcrumbClick: (index: number) => void;
};

export default function HeaderCustomDrive({
  folderCount,
  fileCount,
  breadcrumbs,
  searchQuery,
  isLoading,
  isRefreshing,
  isMutating,
  selectedCount,
  onRefresh,
  onOpenCreateFolder,
  onUploadClick,
  onDeleteSelected,
  onSearchChange,
  onBreadcrumbClick,
}: HeaderCustomDriveProps) {
  const busy = isLoading || isRefreshing || isMutating;
  const lastCrumbIndex = breadcrumbs.length - 1;

  return (
    <Card className="gap-0 overflow-hidden border-slate-200/90 py-0 shadow-sm">
      {/* Title + counts + actions — one compact row */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200/70 bg-slate-50/60 px-3 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Cloud className="h-4 w-4 shrink-0 text-[#5f8fdd]" aria-hidden />
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900">
            Kunden-Dokumente
          </h1>
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="secondary" className="h-5 gap-0.5 px-1.5 py-0 text-[11px] font-normal tabular-nums">
              <FolderOpen className="h-3 w-3 opacity-70" aria-hidden />
              {folderCount}
            </Badge>
            <Badge variant="secondary" className="h-5 gap-0.5 px-1.5 py-0 text-[11px] font-normal tabular-nums">
              <HardDrive className="h-3 w-3 opacity-70" aria-hidden />
              {fileCount}
            </Badge>
            {selectedCount > 0 && (
              <Badge className="h-5 bg-[#5f8fdd] px-1.5 py-0 text-[11px] font-normal tabular-nums hover:bg-[#5f8fdd]/90">
                {selectedCount} sel.
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Aktualisieren"
            className="h-8 gap-1.5 px-2 text-xs text-slate-700 cursor-pointer"
            onClick={onRefresh}
            disabled={busy}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Aktualisieren</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Neuer Ordner"
            className="h-8 gap-1.5 px-2 text-xs text-slate-700 cursor-pointer"
            onClick={onOpenCreateFolder}
            disabled={isMutating}
          >
            <FolderPlus className="h-3.5 w-3.5 text-[#61A175]" />
            <span className="hidden md:inline">Ordner</span>
          </Button>
          <Button
            size="sm"
            title="Datei hochladen"
            className="h-8 gap-1.5 bg-[#61A175] px-2.5 text-xs hover:bg-[#4f8a61] cursor-pointer"
            onClick={onUploadClick}
            disabled={isMutating}
          >
            {isMutating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Hochladen</span>
          </Button>
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              title="Auswahl löschen"
              className="h-8 gap-1 px-2 text-xs cursor-pointer"
              onClick={onDeleteSelected}
              disabled={isMutating}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Löschen</span>
              <span className="tabular-nums lg:hidden">({selectedCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Pfad + Suche — eine Zeile, Pfad scrollt bei langen Namen */}
      <div className="flex items-center gap-2 px-3 py-2">
        <nav
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Ordnerpfad"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === lastCrumbIndex;
            return (
              <React.Fragment key={`${crumb.id ?? 'root'}-${index}`}>
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick(index)}
                  className={`max-w-[min(180px,45vw)] cursor-pointer shrink-0 truncate rounded-md px-2 py-1 text-xs transition ${
                    isLast
                      ? 'bg-[#61A175] font-semibold text-white shadow-sm ring-1 ring-[#61A175]/80 hover:bg-[#529668]'
                      : 'font-medium text-slate-600 hover:bg-[#61A175]/10 hover:text-[#3d6b4a]'
                  }`}
                >
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="relative w-[min(100%,200px)] shrink-0 sm:w-52">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Suchen…"
            className="h-8 border-slate-200 bg-white py-1 pl-7 pr-2 text-xs shadow-none"
            aria-label="Suche"
          />
        </div>
      </div>
    </Card>
  );
}
