"use client";

import React, { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  active: boolean;
}

const INITIAL_ROOMS: Room[] = [
  { id: "1", name: "Scan 1", active: true },
  { id: "2", name: "Scan 2", active: true },
  { id: "3", name: "Beratung", active: true },
  { id: "4", name: "Labor", active: false },
];

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomActive, setNewRoomActive] = useState(true);

  const setRoomActive = (id: string, active: boolean) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setNewRoomName("");
    setNewRoomActive(true);
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setNewRoomName(room.name);
    setNewRoomActive(room.active);
    setModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingRoom(null);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) return;
    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === editingRoom.id
            ? { ...r, name, active: newRoomActive }
            : r
        )
      );
    } else {
      setRooms((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name, active: newRoomActive },
      ]);
    }
    setModalOpen(false);
    setEditingRoom(null);
  };

  const handleDelete = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Header: title, subtitle, Add Room button */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Räume</h2>
          <p className="text-sm text-gray-500 mt-1">
            Räume für die Terminplanung verwalten. Die Raumauswahl ist bei der
            Erstellung von Terminen optional.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="shrink-0 bg-[#61A07B] hover:bg-[#4A8A6A] text-white cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Raum hinzufügen
        </Button>
      </div>

      {/* Table card — same design as image */}
      <div className="rounded-xl border border-gray-200 bg-white p-0 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 hover:bg-transparent bg-gray-50/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 py-4 px-4">
                Raumbeschreibung
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 text-center py-4 px-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 text-right py-4 px-4">
                Aktionen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow
                key={room.id}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50"
              >
                <TableCell className="font-medium text-gray-900 py-4 px-4">
                  {room.name}
                </TableCell>
                <TableCell className="text-center py-4 px-4">
                  <div className="flex justify-center">
                    <Switch
                      checked={room.active}
                      onCheckedChange={(checked) =>
                        setRoomActive(room.id, checked)
                      }
                      className="data-[state=checked]:bg-[#61A07B] cursor-pointer"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right py-4 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 rounded transition-colors"
                      onClick={() => openEditModal(room)}
                      aria-label="Raum bearbeiten"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 cursor-pointer text-gray-500 hover:text-red-600 rounded transition-colors"
                      onClick={() => handleDelete(room.id)}
                      aria-label="Raum löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Room modal */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Raum bearbeiten" : "Raum hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Name und Status des Raums aktualisieren."
                : "Neuen Raum für die Terminplanung anlegen. Name und Status können später geändert werden."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRoom} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Raumbeschreibung</Label>
              <Input
                id="room-name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="z. B. Beratung"
                className="border-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="room-active"
                checked={newRoomActive}
                onCheckedChange={setNewRoomActive}
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
                onClick={() => handleCloseModal(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                className="bg-[#61A07B] hover:bg-[#4A8A6A] cursor-pointer"
                disabled={!newRoomName.trim()}
              >
                {editingRoom ? "Raum aktualisieren" : "Raum anlegen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
