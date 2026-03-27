"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Room } from "./types";
import StoreLocationCombobox from "./StoreLocationCombobox";

export default function RoomFormModal({
  open,
  onOpenChange,
  editingRoom,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRoom: Room | null;
  saving: boolean;
  onSave: (data: {
    name: string;
    isActive: boolean;
    storeLocationId: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [storeLocationId, setStoreLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editingRoom) {
      setName(editingRoom.name);
      setIsActive(editingRoom.isActive);
      setStoreLocationId(editingRoom.storeLocationId?.trim() || null);
    } else {
      setName("");
      setIsActive(true);
      setStoreLocationId(null);
    }
  }, [open, editingRoom]);

  const handleClose = (next: boolean) => {
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !storeLocationId) return;
    await onSave({
      name: trimmed,
      isActive,
      storeLocationId,
    });
  };

  const canSubmit = Boolean(name.trim() && storeLocationId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[min(90vh,720px)] min-w-0 overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRoom ? "Raum bearbeiten" : "Raum hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {editingRoom
              ? "Name, Standort und Status des Raums aktualisieren."
              : "Neuen Raum mit Standort anlegen. Name und Status können später geändert werden."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid min-w-0 max-w-full gap-4 py-2"
        >
          <div className="grid min-w-0 gap-2">
            <Label
              htmlFor="room-name"
              className="text-sm font-medium text-gray-900"
            >
              Raumbeschreibung
            </Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Beratung"
              autoComplete="off"
              className={cn(
                "h-10 border-gray-200 bg-white shadow-sm",
                "focus-visible:border-[#61A07B] focus-visible:ring-[#61A07B]/25 focus-visible:ring-[3px]"
              )}
            />
            <p className="text-xs text-muted-foreground">
              Kurze Bezeichnung, die bei der Terminauswahl erscheint.
            </p>
          </div>

          <StoreLocationCombobox
            value={storeLocationId}
            onChange={setStoreLocationId}
            disabled={saving}
            preload={open}
            pendingSelectionLabel={editingRoom?.storeLocationAddress ?? null}
          />

          <div className="flex items-center gap-2">
            <Switch
              id="room-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-[#61A07B] cursor-pointer"
            />
            <Label htmlFor="room-active" className="text-sm font-normal">
              Aktiv (Raum buchbar)
            </Label>
          </div>
          <DialogFooter className="gap-2 sm:gap-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-[#61A07B] hover:bg-[#4A8A6A] cursor-pointer"
              disabled={!canSubmit || saving}
            >
              {saving
                ? "Wird gespeichert…"
                : editingRoom
                  ? "Raum aktualisieren"
                  : "Raum anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
