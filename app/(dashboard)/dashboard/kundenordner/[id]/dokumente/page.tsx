'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Loader2 } from 'lucide-react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import type { DriveEntityType, RenameFileAndFolderPayload } from '@/apis/googleCustomDriveApis';
import TopNavigation from '../../../_components/Kundenordner/TopNavigation';
import HeaderCustomDrive from '../../../_components/CustomDrive/HeaderCustomDrive';
import FolderGridCustomDrive from '../../../_components/CustomDrive/FolderGridCustomDrive';
import FileGridCustomDrive from '../../../_components/CustomDrive/FileGridCustomDrive';
import CustomDriveDialogs from '../../../_components/CustomDrive/CustomDriveDialogs';
import CustomDriveUploadModal from '../../../_components/CustomDrive/CustomDriveUploadModal';
import type { ActionTarget, BreadcrumbItem } from '../../../_components/CustomDrive/types';
import { parseDragItemId, parseDropTargetId } from '../../../_components/CustomDrive/CustomDriveDnd';
import { useGoogleCustomDriveStore } from '@/stores';
import { downloadUrlAsFile, openFilePreview } from '@/lib/fileDownload';

const ROOT_BREADCRUMB: BreadcrumbItem = { id: null, name: 'My Drive' };

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
    isRefreshing,
    isMutating,
    error,
    fetchAll,
    fetchPath,
    createFolderAction,
    uploadFileAction,
    deleteItemAction,
    deleteItemsAction,
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
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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
        const response = await fetchPath(folderId, { silent: true });
        const pathData = (response as { data?: { path?: Array<{ id: string; name: string }> } })?.data?.path;
        if (Array.isArray(pathData) && pathData.length > 0) {
          setBreadcrumbs([
            ROOT_BREADCRUMB,
            ...pathData.map((item) => ({ id: item.id, name: item.name })),
          ]);
          return;
        }
      } catch {
        // fallback below
      }

      setBreadcrumbs([ROOT_BREADCRUMB, { id: folderId, name: 'Ordner' }]);
    },
    [fetchPath]
  );

  const loadData = useCallback(
    async (opts?: { silent?: boolean }) => {
      await fetchAll({
        customerId,
        limit: 100,
        folder: currentFolderId,
        silent: opts?.silent,
      });
    },
    [customerId, currentFolderId, fetchAll]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const next = folderFromQuery ?? null;
    setCurrentFolderId((prev) => (prev === next ? prev : next));
    setSelectedKeys(new Set());
  }, [folderFromQuery]);

  useEffect(() => {
    void refreshBreadcrumbs(currentFolderId);
  }, [currentFolderId, refreshBreadcrumbs]);

  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    updateFolderInUrl(folderId);
    setSelectedKeys(new Set());
  };

  const handleGoToBreadcrumb = (index: number) => {
    const next = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(next);
    const nextFolderId = next[next.length - 1]?.id ?? null;
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
      await loadData({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ordner konnte nicht erstellt werden';
      toast.error(message);
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadFiles = async (uploadFiles: File[]) => {
    if (uploadFiles.length === 0) return;

    try {
      const response = (await uploadFileAction({
        customerId,
        files: uploadFiles,
        folderId: currentFolderId ?? undefined,
      })) as { message?: string; success?: boolean };
      toast.success(response?.message || 'Dateien erfolgreich hochgeladen');
      setIsUploadModalOpen(false);
      await loadData({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload fehlgeschlagen';
      toast.error(message);
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
      await loadData({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Umbenennen fehlgeschlagen';
      toast.error(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const response = (await deleteItemAction(deleteTarget.type, deleteTarget.id)) as { message?: string };
      toast.success(response?.message || `${deleteTarget.type === 'folder' ? 'Ordner' : 'Datei'} gelöscht`);
      setDeleteTarget(null);
      setSelectedKeys(new Set());
      await loadData({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Löschen fehlgeschlagen';
      toast.error(message);
    }
  };

  const makeSelectionKey = (type: DriveEntityType, id: string) => `${type}:${id}`;

  const parseSelectionKey = (key: string): { type: DriveEntityType; id: string } | null => {
    const [type, id] = key.split(':');
    if (!id || (type !== 'folder' && type !== 'file')) return null;
    return { type, id };
  };

  const isFolderSelected = (folderId: string) => selectedKeys.has(makeSelectionKey('folder', folderId));
  const isFileSelected = (fileId: string) => selectedKeys.has(makeSelectionKey('file', fileId));

  const handleSelectItem = (target: ActionTarget, event: React.MouseEvent) => {
    const key = makeSelectionKey(target.type, target.id);
    const useMultiSelect = event.ctrlKey || event.metaKey;

    setSelectedKeys((prev) => {
      if (!useMultiSelect) {
        return new Set([key]);
      }

      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedKeys.size === 0) return;

    const items = Array.from(selectedKeys)
      .map((key) => parseSelectionKey(key))
      .filter((item): item is { type: DriveEntityType; id: string } => Boolean(item));

    if (items.length === 0) return;

    try {
      const response = (await deleteItemsAction(items)) as { message?: string };
      toast.success(response?.message || `${items.length} element(s) gelöscht`);
      setSelectedKeys(new Set());
      await loadData({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bulk delete fehlgeschlagen';
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
      await loadData({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verschieben fehlgeschlagen';
      toast.error(message);
    }
  };

  return (
    <div className="mb-20 w-full max-w-full space-y-6 p-4">
      <TopNavigation />

      <HeaderCustomDrive
        folderCount={folders.length}
        fileCount={files.length}
        breadcrumbs={breadcrumbs}
        searchQuery={searchQuery}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isMutating={isMutating}
        selectedCount={selectedKeys.size}
        onRefresh={() => void loadData({ silent: true })}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onUploadClick={handleUploadClick}
        onDeleteSelected={() => void handleDeleteSelected()}
        onSearchChange={setSearchQuery}
        onBreadcrumbClick={handleGoToBreadcrumb}
      />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={(e) => void handleDragEnd(e)}>
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
                  void loadData({ silent: true });
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
            <FolderGridCustomDrive
              folders={filteredFolders}
              formatDate={formatDate}
              isSelected={isFolderSelected}
              onSelect={handleSelectItem}
              onOpenFolder={(id) => handleOpenFolder(id)}
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
            />

            <FileGridCustomDrive
              files={filteredFiles}
              formatDate={formatDate}
              formatBytes={formatBytes}
              onView={handleView}
              onDownload={(url, name) => void handleDownload(url, name)}
              isSelected={isFileSelected}
              onSelect={handleSelectItem}
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
            />

            {pagination.hasNextFilesPage && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Es gibt weitere Dateien im Backend (next cursor vorhanden). Aktuell wird die erste Liste angezeigt.
              </div>
            )}
          </div>
        )}
      </DndContext>

      <CustomDriveUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        isUploading={isMutating}
        onUpload={(files) => handleUploadFiles(files)}
      />

      <CustomDriveDialogs
        isMutating={isMutating}
        isCreateFolderOpen={isCreateFolderOpen}
        newFolderName={newFolderName}
        renameTarget={renameTarget}
        renameValue={renameValue}
        deleteTarget={deleteTarget}
        onCreateOpenChange={setIsCreateFolderOpen}
        onNewFolderNameChange={setNewFolderName}
        onCreateSubmit={() => void handleCreateFolder()}
        onRenameOpenChange={(open) => !open && setRenameTarget(null)}
        onRenameValueChange={setRenameValue}
        onRenameSubmit={() => void handleRenameSubmit()}
        onDeleteOpenChange={(open) => !open && setDeleteTarget(null)}
        onDeleteConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}
