'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, FolderInput, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionTarget } from './types';

type CustomDriveDialogsProps = {
  isMutating: boolean;
  isCreateFolderOpen: boolean;
  newFolderName: string;
  renameTarget: ActionTarget | null;
  renameValue: string;
  deleteTarget: ActionTarget | null;
  bulkDeleteOpen: boolean;
  bulkDeleteCount: number;
  onCreateOpenChange: (open: boolean) => void;
  onNewFolderNameChange: (value: string) => void;
  onCreateSubmit: () => void;
  onRenameOpenChange: (open: boolean) => void;
  onRenameValueChange: (value: string) => void;
  onRenameSubmit: () => void;
  onDeleteOpenChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
  onBulkDeleteOpenChange: (open: boolean) => void;
  onBulkDeleteConfirm: () => void;
};

export default function CustomDriveDialogs({
  isMutating,
  isCreateFolderOpen,
  newFolderName,
  renameTarget,
  renameValue,
  deleteTarget,
  bulkDeleteOpen,
  bulkDeleteCount,
  onCreateOpenChange,
  onNewFolderNameChange,
  onCreateSubmit,
  onRenameOpenChange,
  onRenameValueChange,
  onRenameSubmit,
  onDeleteOpenChange,
  onDeleteConfirm,
  onBulkDeleteOpenChange,
  onBulkDeleteConfirm,
}: CustomDriveDialogsProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renameTarget) return;
    const id = requestAnimationFrame(() => {
      const el = renameInputRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [renameTarget?.id, renameTarget?.type]);

  return (
    <>
      <Dialog open={isCreateFolderOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="gap-1 border-b bg-muted/30 px-6 py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#61A175]/15 text-[#61A175]">
                <FolderInput className="h-4 w-4" />
              </span>
              <DialogTitle className="text-lg">Neuen Ordner erstellen</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              Der neue Ordner wird im aktuellen Verzeichnis angelegt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="drive-new-folder-name">Ordnername</Label>
              <Input
                id="drive-new-folder-name"
                value={newFolderName}
                onChange={(e) => onNewFolderNameChange(e.target.value)}
                placeholder="z. B. Verträge 2026"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onCreateSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onCreateOpenChange(false)}>
              Abbrechen
            </Button>
            <Button
              type="button"
              className="bg-[#61A175] hover:bg-[#4f8a61]"
              onClick={onCreateSubmit}
              disabled={isMutating}
            >
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          onRenameOpenChange(open);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="gap-1 border-b bg-muted/30 px-6 py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Pencil className="h-4 w-4" />
              </span>
              <DialogTitle className="text-lg">
                {renameTarget?.type === 'folder' ? 'Ordner umbenennen' : 'Datei umbenennen'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-left">
              Aktueller Name:{' '}
              <span className="font-medium text-foreground">{renameTarget?.name ?? '—'}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="drive-rename-input">Neuer Name</Label>
              <Input
                ref={renameInputRef}
                id="drive-rename-input"
                value={renameValue}
                onChange={(e) => onRenameValueChange(e.target.value)}
                placeholder="Name eingeben"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onRenameSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onRenameOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={onRenameSubmit} disabled={isMutating}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          onDeleteOpenChange(open);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="gap-1 border-b border-destructive/20 bg-destructive/5 px-6 py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <Trash2 className="h-4 w-4" />
              </span>
              <DialogTitle className="text-lg">
                {deleteTarget?.type === 'folder' ? 'Ordner löschen' : 'Datei löschen'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-left">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <div className="flex gap-3 rounded-lg border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <p>
                Möchten Sie{' '}
                <span className="font-semibold text-foreground">&quot;{deleteTarget?.name}&quot;</span>{' '}
                wirklich endgültig löschen?
              </p>
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onDeleteOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="button" variant="destructive" onClick={onDeleteConfirm} disabled={isMutating}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={onBulkDeleteOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="gap-1 border-b border-destructive/20 bg-destructive/5 px-6 py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <Trash2 className="h-4 w-4" />
              </span>
              <DialogTitle className="text-lg">Auswahl löschen</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              {bulkDeleteCount === 1
                ? 'Ein Element wird unwiderruflich gelöscht.'
                : `${bulkDeleteCount} Elemente werden unwiderruflich gelöscht.`}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <div className="flex gap-3 rounded-lg border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <p>
                Sind Sie sicher? Ordner, Dateien und deren Inhalte können nicht wiederhergestellt werden.
              </p>
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onBulkDeleteOpenChange(false)}>
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onBulkDeleteConfirm}
              disabled={isMutating || bulkDeleteCount === 0}
            >
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {bulkDeleteCount === 1 ? 'Ja, löschen' : `Ja, ${bulkDeleteCount} löschen`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
