'use client';

import React from 'react';
import { ChevronRight, FolderPlus, Loader2, RefreshCw, Search, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Drive Dokumente</h1>
          <p className="text-sm text-gray-500">
            Ordner: {folderCount} | Dateien: {fileCount}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing || isMutating}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={onOpenCreateFolder}
            disabled={isMutating}
          >
            <FolderPlus className="h-4 w-4" />
            Neuer Ordner
          </Button>

          <Button
            className="gap-2 bg-[#61A175] hover:bg-[#4f8a61]"
            onClick={onUploadClick}
            disabled={isMutating}
          >
            {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Datei hochladen
          </Button>

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              className="gap-2"
              onClick={onDeleteSelected}
              disabled={isMutating}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedCount})
            </Button>
          )}

        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Type
          </Button>
          <Button type="button" variant="outline" size="sm">
            Modified
          </Button>
          <Button type="button" variant="outline" size="sm">
            Source
          </Button>
        </div> */}

        <div className="flex items-center gap-1 rounded-lg border bg-gray-50 px-2 py-1">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.id ?? 'root'}-${index}`}>
              <button
                type="button"
                onClick={() => onBreadcrumbClick(index)}
                className="rounded cursor-pointer px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            </React.Fragment>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Suchen (Ordner/Dateien)"
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
}
