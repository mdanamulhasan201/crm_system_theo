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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  createAppointmentRoom,
  deleteAppointmentRoom,
  getAllAppointmentRooms,
  updateAppointmentRoom,
} from "@/apis/employeeaApis";
import toast from "react-hot-toast";

interface Room {
  id: string;
  name: string;
  isActive: boolean;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomActive, setNewRoomActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res: any = await getAllAppointmentRooms();
      const data = res?.data ?? res;
      if (Array.isArray(data)) {
        setRooms(
          data.map((room: any) => ({
            id: room.id || room._id,
            name: room.name,
            isActive: room.isActive,
          }))
        );
      } else {
        setRooms([]);
      }
    } catch {
      toast.error("Räume konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setNewRoomName("");
    setNewRoomActive(true);
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setNewRoomName(room.name);
    setNewRoomActive(room.isActive);
    setModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingRoom(null);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) return;

    setSaving(true);
    try {
      if (editingRoom) {
        await updateAppointmentRoom(editingRoom.id, {
          name,
          isActive: newRoomActive,
        });
        toast.success("Raum aktualisiert.");
      } else {
        await createAppointmentRoom({
          name,
          isActive: newRoomActive,
        });
        toast.success("Raum erstellt.");
      }
      await fetchRooms();
      setModalOpen(false);
      setEditingRoom(null);
    } catch {
      toast.error("Raum konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    const id = roomToDelete.id;
    setDeletingId(id);
    try {
      await deleteAppointmentRoom(id);
      toast.success("Raum gelöscht.");
      setRoomToDelete(null);
      await fetchRooms();
    } catch {
      toast.error("Raum konnte nicht gelöscht werden.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (room: Room, nextActive: boolean) => {
    setTogglingId(room.id);
    try {
      await updateAppointmentRoom(room.id, {
        name: room.name,
        isActive: nextActive,
      });
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, isActive: nextActive } : r
        )
      );
    } catch {
      toast.error("Status konnte nicht aktualisiert werden.");
    } finally {
      setTogglingId(null);
    }
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
                      checked={room.isActive}
                      disabled={togglingId === room.id}
                      onCheckedChange={(checked) =>
                        handleToggleActive(room, checked)
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
                      onClick={() => handleDeleteClick(room)}
                      aria-label="Raum löschen"
                      disabled={deletingId === room.id}
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
                disabled={!newRoomName.trim() || saving}
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

      {/* Delete confirmation modal */}
      <Dialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Raum löschen?</DialogTitle>
            <DialogDescription>
              {roomToDelete
                ? `Möchten Sie den Raum "${roomToDelete.name}" wirklich löschen?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoomToDelete(null)}
              disabled={deletingId !== null}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteRoom}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? "Wird gelöscht…" : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
