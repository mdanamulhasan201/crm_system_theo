"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Room } from "./types";

export default function DeleteRoomDialog({
  room,
  deletingId,
  onClose,
  onConfirm,
}: {
  room: Room | null;
  deletingId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!room} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raum löschen?</DialogTitle>
          <DialogDescription>
            {room
              ? `Möchten Sie den Raum "${room.name}" wirklich löschen?`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deletingId !== null}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={deletingId !== null}
          >
            {deletingId !== null ? "Wird gelöscht…" : "Löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
