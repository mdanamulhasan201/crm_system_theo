'use client';

import type { MouseEvent } from 'react';
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DriveFolder } from '@/stores/google-custom-drive/googleCustomDrive.store';
import type { ActionTarget } from './types';
import { DragContainer, FolderDropContainer, dragItemId } from './CustomDriveDnd';

type FolderGridCustomDriveProps = {
  folders: DriveFolder[];
  formatDate: (iso?: string) => string;
  isSelected: (folderId: string) => boolean;
  onSelect: (target: ActionTarget, event: MouseEvent) => void;
  onOpenFolder: (folderId: string) => void;
  onRename: (target: ActionTarget) => void;
  onDelete: (target: ActionTarget) => void;
};

export default function FolderGridCustomDrive({
  folders,
  formatDate,
  isSelected,
  onSelect,
  onOpenFolder,
  onRename,
  onDelete,
}: FolderGridCustomDriveProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Folder className="h-5 w-5 text-[#61A175]" />
        <h2 className="text-lg font-semibold text-gray-900">Ordner</h2>
      </div>

      {folders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
          Keine Ordner gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {folders.map((folder) => (
            <FolderDropContainer key={folder.id} id={folder.id}>
              <DragContainer id={dragItemId('folder', folder.id)}>
                <div
                  onClick={(e) =>
                    onSelect(
                      {
                        id: folder.id,
                        name: folder.name,
                        type: 'folder',
                      },
                      e
                    )
                  }
                  onDoubleClick={() => onOpenFolder(folder.id)}
                  className={`group cursor-pointer rounded-xl border p-3 text-left transition hover:border-[#61A175] hover:shadow-sm ${
                    isSelected(folder.id) ? 'border-[#5f8fdd] bg-[#eaf1ff]' : 'bg-[#f8f9fb]'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Folder className="h-5 w-5 shrink-0 text-[#5f8fdd]" />
                      <p className="line-clamp-1 font-medium text-gray-900">{folder.name}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                          aria-label="Mehr Optionen"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            onRename({ id: folder.id, name: folder.name, type: 'folder' })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Umbenennen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            onDelete({ id: folder.id, name: folder.name, type: 'folder' })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs text-gray-500">
                    Unterordner: {folder._count?.children ?? 0} | Dateien: {folder._count?.files ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(folder.createdAt)}</p>
                </div>
              </DragContainer>
            </FolderDropContainer>
          ))}
        </div>
      )}
    </section>
  );
}

