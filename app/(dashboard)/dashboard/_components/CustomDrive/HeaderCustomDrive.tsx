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
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="gap-0 overflow-hidden border-slate-200/90 py-0 shadow-md">
      <div className="border-b border-slate-200/80 bg-linear-to-br from-slate-50 via-white to-[#61A175]/6 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
                <Cloud className="h-5 w-5 text-[#5f8fdd]" aria-hidden />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Kunden-Dokumente
                </h1>
                <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                  Dateien und Ordner verwalten · Drive-Ansicht
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-13">
              <Badge variant="secondary" className="gap-1 font-normal tabular-nums">
                <FolderOpen className="h-3 w-3 opacity-70" aria-hidden />
                {folderCount} Ordner
              </Badge>
              <Badge variant="secondary" className="gap-1 font-normal tabular-nums">
                <HardDrive className="h-3 w-3 opacity-70" aria-hidden />
                {fileCount} Dateien
              </Badge>
              {selectedCount > 0 && (
                <Badge className="bg-[#5f8fdd] font-normal tabular-nums hover:bg-[#5f8fdd]/90">
                  {selectedCount} ausgewählt
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-700"
              onClick={onRefresh}
              disabled={busy}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-700"
              onClick={onOpenCreateFolder}
              disabled={isMutating}
            >
              <FolderPlus className="h-4 w-4 text-[#61A175]" />
              Neuer Ordner
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-[#61A175] shadow-sm hover:bg-[#4f8a61]"
              onClick={onUploadClick}
              disabled={isMutating}
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Datei hochladen
            </Button>
            {selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 shadow-sm"
                onClick={onDeleteSelected}
                disabled={isMutating}
              >
                <Trash2 className="h-4 w-4" />
                Auswahl löschen ({selectedCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="flex flex-col gap-4 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50/80 px-2 py-2">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === lastCrumbIndex;
            return (
              <React.Fragment key={`${crumb.id ?? 'root'}-${index}`}>
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick(index)}
                  className={`max-w-[200px] truncate rounded-lg px-2.5 py-1.5 text-sm transition ${
                    isLast
                      ? 'bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                      : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="relative w-full lg:max-w-md lg:ml-auto">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ordner und Dateien durchsuchen…"
            className="h-10 border-slate-200 bg-white pl-9 shadow-sm"
            aria-label="Suche"
          />
        </div>
      </CardContent>
    </Card>
  );
}
