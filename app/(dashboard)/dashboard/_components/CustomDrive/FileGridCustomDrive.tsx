'use client';

import type { MouseEvent, ReactNode } from 'react';
import { Download, Eye, FileText, HardDrive, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DriveFile } from '@/stores/google-custom-drive/googleCustomDrive.store';
import type { ActionTarget } from './types';
import { DragContainer, dragItemId } from './CustomDriveDnd';

type FileGridCustomDriveProps = {
  files: DriveFile[];
  formatDate: (iso?: string) => string;
  formatBytes: (size?: number) => string;
  onView: (url: string) => void;
  onDownload: (url: string, name: string) => void;
  isSelected: (fileId: string) => boolean;
  onSelect: (target: ActionTarget, event: MouseEvent) => void;
  onRename: (target: ActionTarget) => void;
  onDelete: (target: ActionTarget) => void;
  /** Infinite scroll sentinel / loaders below the grid */
  footer?: ReactNode;
};

export default function FileGridCustomDrive({
  files,
  formatDate,
  formatBytes,
  onView,
  onDownload,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  footer,
}: FileGridCustomDriveProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Dateien</h2>
      </div>

      {files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
          Keine Dateien gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {files.map((file) => (
            <DragContainer key={file.id} id={dragItemId('file', file.id)}>
                <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(
                    {
                      id: file.id,
                      name: file.name,
                      type: 'file',
                    },
                    e
                  );
                }}
                onDoubleClick={() => onView(file.url)}
                className={`group cursor-pointer rounded-xl border p-3 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm ${
                  isSelected(file.id)
                    ? 'border-[#5f8fdd] bg-[#eaf1ff] hover:border-[#5f8fdd] hover:bg-[#eaf1ff]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded p-1 cursor-pointer text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Mehr Optionen"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(file.url)}>
                        <Eye className="h-4 w-4" />
                        Ansehen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(file.url, file.name)}>
                        <Download className="h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onRename({
                            id: file.id,
                            name: file.name,
                            type: 'file',
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Umbenennen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          onDelete({
                            id: file.id,
                            name: file.name,
                            type: 'file',
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div
                  className="pointer-events-none mb-3 flex h-28 w-full items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-slate-200/70"
                  aria-hidden
                >
                  <FileText className="h-9 w-9 text-red-500 transition-opacity group-hover:opacity-90" />
                </div>

                <div>
                  <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatBytes(file.size)} • {formatDate(file.createdAt)}
                  </p>
                </div>
              </div>
            </DragContainer>
          ))}
        </div>
      )}
      {footer}
    </section>
  );
}

