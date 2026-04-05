'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  type UniqueIdentifier,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  ChevronRight,
  Download,
  Eye,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Loader2,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import TopNavigation from '../../../_components/Kundenordner/TopNavigation';
import { useGoogleCustomDriveStore } from '@/stores';
import type { DriveEntityType, RenameFileAndFolderPayload } from '@/apis/googleCustomDriveApis';
import { downloadUrlAsFile, openFilePreview } from '@/lib/fileDownload';

type BreadcrumbItem = {
  id: string | null;
  name: string;
};

const ROOT_BREADCRUMB: BreadcrumbItem = { id: null, name: 'My Drive' };

type ActionTarget = {
  id: string;
  name: string;
  type: DriveEntityType;
};

const dragItemId = (type: DriveEntityType, id: string) => `${type}:${id}`;

const parseDragItemId = (value: UniqueIdentifier) => {
  const [type, id] = String(value).split(':');
  if (!id || (type !== 'folder' && type !== 'file')) return null;
  return { type: type as DriveEntityType, id };
};

const parseDropTargetId = (value: UniqueIdentifier | null | undefined) => {
  if (!value) return null;
  const raw = String(value);
  if (!raw.startsWith('folder-drop:')) return null;
  return raw.replace('folder-drop:', '');
};

function DragContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
          : undefined,
        opacity: isDragging ? 0.6 : 1,
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function FolderDropContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `folder-drop:${id}` });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-[#5f8fdd] ring-offset-1 rounded-xl' : undefined}
    >
      {children}
    </div>
  );
}

const formatBytes = (size?: number) => {
  if (!size || Number.isNaN(size)) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('de-DE');
};

export default function KundenordnerDokumentePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const customerId = String(params.id);
  const folderFromQuery = searchParams.get('folder');

  const {
    folders,
    files,
    pagination,
    isLoading,
    isMutating,
    error,
    fetchAll,
    fetchPath,
    createFolderAction,
    uploadFileAction,
    deleteItemAction,
    moveItemsAction,
    renameItemAction,
    clearError,
  } = useGoogleCustomDriveStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(folderFromQuery);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([ROOT_BREADCRUMB]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<ActionTarget | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ActionTarget | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateFolderInUrl = useCallback(
    (folderId: string | null) => {
      const paramsObj = new URLSearchParams(searchParams.toString());
      if (folderId) {
        paramsObj.set('folder', folderId);
      } else {
        paramsObj.delete('folder');
      }
      const query = paramsObj.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const refreshBreadcrumbs = useCallback(
    async (folderId: string | null) => {
      if (!folderId) {
        setBreadcrumbs([ROOT_BREADCRUMB]);
        return;
      }

      try {
        const response = await fetchPath(folderId);
        const pathData = (response as { data?: Array<{ id: string; name: string }> })?.data;
        if (Array.isArray(pathData) && pathData.length > 0) {
          setBreadcrumbs([
            ROOT_BREADCRUMB,
            ...pathData.map((item) => ({ id: item.id, name: item.name })),
          ]);
          return;
        }
      } catch {
        // Fall back to minimal breadcrumb when path API fails
      }

      setBreadcrumbs([ROOT_BREADCRUMB, { id: folderId, name: 'Ordner' }]);
    },
    [fetchPath]
  );

  const loadData = useCallback(async () => {
    await fetchAll({
      customerId,
      limit: 100,
      folder: currentFolderId,
    });
  }, [customerId, currentFolderId, fetchAll]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const next = folderFromQuery ?? null;
    setCurrentFolderId((prev) => (prev === next ? prev : next));
  }, [folderFromQuery]);

  useEffect(() => {
    void refreshBreadcrumbs(currentFolderId);
  }, [currentFolderId, refreshBreadcrumbs]);

  const handleOpenFolder = async (folderId: string, _folderName: string) => {
    setCurrentFolderId(folderId);
    updateFolderInUrl(folderId);
  };

  const handleGoToBreadcrumb = (index: number) => {
    const next = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(next);
    const last = next[next.length - 1];
    const nextFolderId = last?.id ?? null;
    setCurrentFolderId(nextFolderId);
    updateFolderInUrl(nextFolderId);
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      toast.error('Bitte geben Sie einen Ordnernamen ein.');
      return;
    }

    try {
      await createFolderAction({
        customerId,
        name,
        parentId: currentFolderId,
      });
      toast.success('Ordner erfolgreich erstellt');
      setIsCreateFolderOpen(false);
      setNewFolderName('');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ordner konnte nicht erstellt werden';
      toast.error(message);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadFileAction({
        customerId,
        file,
        folderId: currentFolderId ?? undefined,
      });
      toast.success('Datei erfolgreich hochgeladen');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload fehlgeschlagen';
      toast.error(message);
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const filteredFolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return folders;
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const handleView = (url: string) => {
    openFilePreview(url);
  };

  const handleDownload = async (url: string, name: string) => {
    const ok = await downloadUrlAsFile(url, name);
    if (!ok) {
      toast.error('Direkter Download nicht möglich. Bitte Datei im Browser speichern.');
    }
  };

  const openRenameDialog = (target: ActionTarget) => {
    setRenameTarget(target);
    setRenameValue(target.name);
  };

  const openDeleteDialog = (target: ActionTarget) => {
    setDeleteTarget(target);
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget) return;
    const name = renameValue.trim();
    if (!name) {
      toast.error('Name darf nicht leer sein.');
      return;
    }

    const payload: RenameFileAndFolderPayload = {
      type: renameTarget.type,
      id: renameTarget.id,
      name,
    };

    try {
      await renameItemAction(payload);
      toast.success(`${renameTarget.type === 'folder' ? 'Ordner' : 'Datei'} umbenannt`);
      setRenameTarget(null);
      setRenameValue('');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Umbenennen fehlgeschlagen';
      toast.error(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteItemAction(deleteTarget.type, deleteTarget.id);
      toast.success(`${deleteTarget.type === 'folder' ? 'Ordner' : 'Datei'} gelöscht`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Löschen fehlgeschlagen';
      toast.error(message);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);

    const active = parseDragItemId(event.active.id);
    const targetFolderId = parseDropTargetId(event.over?.id);

    if (!active || !targetFolderId) return;
    if (active.type === 'folder' && active.id === targetFolderId) return;

    try {
      await moveItemsAction({
        items: [{ type: active.type, id: [active.id] }],
        targetParentId: targetFolderId,
      });
      toast.success(`${active.type === 'folder' ? 'Ordner' : 'Datei'} verschoben`);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verschieben fehlgeschlagen';
      toast.error(message);
    }
  };

  return (
    <div className="mb-20 w-full max-w-full space-y-6 p-4">
      <TopNavigation />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Drive Dokumente</h1>
            <p className="text-sm text-gray-500">
              Ordner: {folders.length} | Dateien: {files.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => void loadData()}
              disabled={isLoading || isMutating}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsCreateFolderOpen(true)}
              disabled={isMutating}
            >
              <FolderPlus className="h-4 w-4" />
              Neuer Ordner
            </Button>

            <Button className="gap-2 bg-[#61A175] hover:bg-[#4f8a61]" onClick={handleUploadClick} disabled={isMutating}>
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Datei hochladen
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isMutating}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm">
              Type
            </Button>
            <Button type="button" variant="outline" size="sm">
              Modified
            </Button>
            <Button type="button" variant="outline" size="sm">
              Source
            </Button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-gray-50 px-2 py-1">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb.id ?? 'root'}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleGoToBreadcrumb(index)}
                  className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen (Ordner/Dateien)"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={(e) => void handleDragEnd(e)}
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  clearError();
                  void loadData();
                }}
              >
                Erneut versuchen
              </Button>
            </div>
          </div>
        )}

        {activeDragId && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
            Drag & drop: Ziehen Sie die Datei/den Ordner auf einen Zielordner.
          </div>
        )}

        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Folder className="h-5 w-5 text-[#61A175]" />
              <h2 className="text-lg font-semibold text-gray-900">Ordner</h2>
            </div>

            {filteredFolders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
                Keine Ordner gefunden.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {filteredFolders.map((folder) => (
                  <FolderDropContainer key={folder.id} id={folder.id}>
                    <DragContainer id={dragItemId('folder', folder.id)}>
                      <div className="group rounded-xl border bg-[#f8f9fb] p-3 text-left transition hover:border-[#61A175] hover:shadow-sm">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => void handleOpenFolder(folder.id, folder.name)}
                            className="flex min-w-0 items-center gap-2"
                          >
                            <Folder className="h-5 w-5 shrink-0 text-[#5f8fdd]" />
                            <p className="line-clamp-1 font-medium text-gray-900">{folder.name}</p>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="rounded p-1 text-gray-500 opacity-0 transition group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-800"
                                aria-label="Mehr Optionen"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  openRenameDialog({
                                    id: folder.id,
                                    name: folder.name,
                                    type: 'folder',
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                                Umbenennen
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  openDeleteDialog({
                                    id: folder.id,
                                    name: folder.name,
                                    type: 'folder',
                                  })
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

          <section>
            <div className="mb-3 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Dateien</h2>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
                Keine Dateien gefunden.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {filteredFiles.map((file) => (
                  <DragContainer key={file.id} id={dragItemId('file', file.id)}>
                    <div className="group rounded-xl border bg-white p-3 transition hover:shadow-sm">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-red-500" />
                          <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-1 text-gray-500 opacity-0 transition group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-800"
                              aria-label="Mehr Optionen"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(file.url)}>
                              <Eye className="h-4 w-4" />
                              Ansehen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void handleDownload(file.url, file.name)}>
                              <Download className="h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openRenameDialog({
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
                                openDeleteDialog({
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

                      <button
                        type="button"
                        onClick={() => handleView(file.url)}
                        className="mb-3 flex h-28 w-full items-center justify-center rounded-lg bg-gray-100"
                      >
                        <FileText className="h-9 w-9 text-red-500" />
                      </button>

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
          </section>

          {pagination.hasNextFilesPage && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Es gibt weitere Dateien im Backend (next cursor vorhanden). Aktuell wird die erste Liste angezeigt.
            </div>
          )}
          </div>
        )}
      </DndContext>

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuen Ordner erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="z. B. Test 1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleCreateFolder();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Abbrechen
              </Button>
              <Button type="button" onClick={() => void handleCreateFolder()} disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {renameTarget?.type === 'folder' ? 'Ordner umbenennen' : 'Datei umbenennen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleRenameSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
                Abbrechen
              </Button>
              <Button type="button" onClick={() => void handleRenameSubmit()} disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteTarget?.type === 'folder' ? 'Ordner löschen' : 'Datei löschen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Möchten Sie <span className="font-semibold">{deleteTarget?.name}</span> wirklich löschen?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Abbrechen
              </Button>
              <Button type="button" variant="destructive" onClick={() => void handleDeleteConfirm()} disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Löschen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
