'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  pointerWithin,
  rectIntersection,
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
import CustomDriveDragOverlay from '../../../_components/CustomDrive/CustomDriveDragOverlay';
import type { ActionTarget, BreadcrumbItem } from '../../../_components/CustomDrive/types';
import { parseDragItemId, parseDropTargetId } from '../../../_components/CustomDrive/CustomDriveDnd';
import FilePreviewModal from '@/components/file-preview/FilePreviewModal';
import { useFilePreviewStore, useGoogleCustomDriveStore } from '@/stores';
import type {
  DriveCollectionResponse,
  DriveFile,
} from '@/stores/google-custom-drive/googleCustomDrive.store';
import { downloadUrlAsFile } from '@/lib/fileDownload';
import { DRIVE_FILES_QUERY_ROOT, useDriveInfiniteFiles } from '@/hooks/useDriveInfiniteFiles';
import { useFilesPageLimit } from '@/hooks/useFilesPageLimit';

const ROOT_BREADCRUMB: BreadcrumbItem = { id: null, name: 'My Drive' };

const SEARCH_DEBOUNCE_MS = 350;

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

const driveFileToPreviewItem = (f: DriveFile) => ({
  id: f.id,
  name: f.name,
  url: f.url,
  mimeType: typeof f.type === 'string' ? f.type : undefined,
  size: f.size,
  createdAt: f.createdAt,
});

export default function KundenordnerDokumentePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const customerId = String(params.id);
  const folderFromQuery = searchParams.get('folder');

  const {
    isMutating,
    fetchPath,
    createFolderAction,
    uploadFileAction,
    deleteItemAction,
    deleteItemsAction,
    moveItemsAction,
    renameItemAction,
  } = useGoogleCustomDriveStore();

  const openFilePreviewModal = useFilePreviewStore((s) => s.open);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const queryClient = useQueryClient();
  const filesLimit = useFilesPageLimit();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data: driveData,
    error: driveQueryError,
    isPending: drivePending,
    isFetching: driveFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchDrive,
  } = useDriveInfiniteFiles({
    customerId,
    folderId: currentFolderId,
    search: debouncedSearch,
    limit: filesLimit,
  });

  const folders = useMemo(() => driveData?.pages[0]?.data?.folders ?? [], [driveData]);

  const files = useMemo(
    () =>
      driveData?.pages.flatMap((page: DriveCollectionResponse) => page.data?.files ?? []) ?? [],
    [driveData]
  );

  const isInitialLoading = drivePending;
  const isListRefreshing = driveFetching && !drivePending && !isFetchingNextPage;

  const invalidateDriveList = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [DRIVE_FILES_QUERY_ROOT, customerId],
    });
  }, [queryClient, customerId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  /** Pointer-based first: large drag preview used to use rectIntersection and often hit the wrong breadcrumb (e.g. My Drive). */
  const driveCollisionDetection = useCallback<CollisionDetection>((args) => {
    const byPointer = pointerWithin(args);
    if (byPointer.length > 0) return byPointer;
    return rectIntersection(args);
  }, []);

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

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: '0px 0px 480px 0px', threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (renameTarget) {
      setRenameValue(renameTarget.name);
    } else {
      setRenameValue('');
    }
  }, [renameTarget]);

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
      await invalidateDriveList();
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
      await invalidateDriveList();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload fehlgeschlagen';
      toast.error(message);
    }
  };

  const handleView = (file: DriveFile) => {
    openFilePreviewModal(driveFileToPreviewItem(file), files.map(driveFileToPreviewItem));
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
      await invalidateDriveList();
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
      await invalidateDriveList();
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

  const handleClearSelection = () => {
    setSelectedKeys(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedKeys.size === 0) {
      setBulkDeleteOpen(false);
      return;
    }

    const items = Array.from(selectedKeys)
      .map((key) => parseSelectionKey(key))
      .filter((item): item is { type: DriveEntityType; id: string } => Boolean(item));

    if (items.length === 0) {
      setBulkDeleteOpen(false);
      return;
    }

    try {
      const response = (await deleteItemsAction(items)) as { message?: string };
      toast.success(response?.message || `${items.length} Element(e) gelöscht`);
      setSelectedKeys(new Set());
      setBulkDeleteOpen(false);
      await invalidateDriveList();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bulk delete fehlgeschlagen';
      toast.error(message);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const active = parseDragItemId(event.active.id);
    const targetParentId = parseDropTargetId(event.over?.id);
    if (!active || targetParentId === undefined) return;
    if (active.type === 'folder' && active.id === targetParentId) return;

    const alreadyInThisFolder =
      (targetParentId === null && currentFolderId === null) ||
      (targetParentId !== null && targetParentId === currentFolderId);
    if (alreadyInThisFolder) return;

    try {
      await moveItemsAction({
        items: [{ type: active.type, id: [active.id] }],
        targetParentId,
      });
      toast.success(`${active.type === 'folder' ? 'Ordner' : 'Datei'} verschoben`);
      await invalidateDriveList();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verschieben fehlgeschlagen';
      toast.error(message);
    }
  };

  return (
    <div className="mb-20 w-full max-w-full space-y-6 p-4" onClick={handleClearSelection}>
      <DndContext
        sensors={sensors}
        collisionDetection={driveCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={(e) => void handleDragEnd(e)}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-6">
        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
          <TopNavigation />

          <HeaderCustomDrive
            folderCount={folders.length}
            fileCount={files.length}
            breadcrumbs={breadcrumbs}
            searchQuery={searchQuery}
            isLoading={isInitialLoading}
            isRefreshing={isListRefreshing}
            isMutating={isMutating}
            selectedCount={selectedKeys.size}
            onRefresh={() => void invalidateDriveList()}
            onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
            onUploadClick={handleUploadClick}
            onDeleteSelected={() => setBulkDeleteOpen(true)}
            onSearchChange={setSearchQuery}
            onBreadcrumbClick={handleGoToBreadcrumb}
          />
        </div>

        {driveQueryError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-3">
              <span>
                {driveQueryError instanceof Error ? driveQueryError.message : 'Laden fehlgeschlagen'}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={() => void refetchDrive()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        )}

        {activeDragId && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
            Ziehen Sie auf einen Ordner in der Liste oder auf einen Eintrag im Pfad oben (übergeordnete Ordner /
            My Drive).
          </div>
        )}

        {isInitialLoading ? (
          <div
            role="presentation"
            className="flex h-40 cursor-default items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white"
            onClick={handleClearSelection}
          >
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div
            role="presentation"
            className="min-h-[120px] space-y-6"
            onClick={handleClearSelection}
          >
            <FolderGridCustomDrive
              folders={folders}
              formatDate={formatDate}
              isSelected={isFolderSelected}
              onSelect={handleSelectItem}
              onOpenFolder={(id) => handleOpenFolder(id)}
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
            />

            <FileGridCustomDrive
              files={files}
              formatDate={formatDate}
              formatBytes={formatBytes}
              onView={handleView}
              onDownload={(url, name) => void handleDownload(url, name)}
              isSelected={isFileSelected}
              onSelect={handleSelectItem}
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
              footer={
                <>
                  {hasNextPage ? (
                    <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden />
                  ) : null}
                  {isFetchingNextPage ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Weitere Dateien" />
                    </div>
                  ) : null}
                </>
              }
            />
          </div>
        )}

        <CustomDriveDragOverlay activeId={activeDragId} folders={folders} files={files} />
        </div>
      </DndContext>

      <FilePreviewModal
        formatBytes={formatBytes}
        formatDate={formatDate}
        onDelete={async (item) => {
          const response = (await deleteItemAction('file', item.id)) as { message?: string };
          toast.success(response?.message || 'Datei gelöscht');
          await invalidateDriveList();
        }}
      />

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
        bulkDeleteOpen={bulkDeleteOpen}
        bulkDeleteCount={selectedKeys.size}
        onCreateOpenChange={setIsCreateFolderOpen}
        onNewFolderNameChange={setNewFolderName}
        onCreateSubmit={() => void handleCreateFolder()}
        onRenameOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        onRenameValueChange={setRenameValue}
        onRenameSubmit={() => void handleRenameSubmit()}
        onDeleteOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleteConfirm={() => void handleDeleteConfirm()}
        onBulkDeleteOpenChange={setBulkDeleteOpen}
        onBulkDeleteConfirm={() => void handleDeleteSelected()}
      />
    </div>
  );
}
