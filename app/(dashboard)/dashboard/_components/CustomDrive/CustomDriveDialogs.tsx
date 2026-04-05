'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ActionTarget } from './types';

type CustomDriveDialogsProps = {
  isMutating: boolean;
  isCreateFolderOpen: boolean;
  newFolderName: string;
  renameTarget: ActionTarget | null;
  renameValue: string;
  deleteTarget: ActionTarget | null;
  onCreateOpenChange: (open: boolean) => void;
  onNewFolderNameChange: (value: string) => void;
  onCreateSubmit: () => void;
  onRenameOpenChange: (open: boolean) => void;
  onRenameValueChange: (value: string) => void;
  onRenameSubmit: () => void;
  onDeleteOpenChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
};

export default function CustomDriveDialogs({
  isMutating,
  isCreateFolderOpen,
  newFolderName,
  renameTarget,
  renameValue,
  deleteTarget,
  onCreateOpenChange,
  onNewFolderNameChange,
  onCreateSubmit,
  onRenameOpenChange,
  onRenameValueChange,
  onRenameSubmit,
  onDeleteOpenChange,
  onDeleteConfirm,
}: CustomDriveDialogsProps) {
  return (
    <>
      <Dialog open={isCreateFolderOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuen Ordner erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newFolderName}
              onChange={(e) => onNewFolderNameChange(e.target.value)}
              placeholder="z. B. Test 1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onCreateSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onCreateOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="button" onClick={onCreateSubmit} disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renameTarget !== null} onOpenChange={onRenameOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {renameTarget?.type === 'folder' ? 'Ordner umbenennen' : 'Datei umbenennen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={renameValue}
              onChange={(e) => onRenameValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onRenameSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onRenameOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="button" onClick={onRenameSubmit} disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={onDeleteOpenChange}>
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
              <Button type="button" variant="outline" onClick={() => onDeleteOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="button" variant="destructive" onClick={onDeleteConfirm} disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Löschen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

