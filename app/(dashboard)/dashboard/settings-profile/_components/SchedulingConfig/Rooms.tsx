"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import {
  createAppointmentRoom,
  deleteAppointmentRoom,
  getAllAppointmentRooms,
  updateAppointmentRoom,
} from "@/apis/employeeaApis";
import toast from "react-hot-toast";
import type { Room } from "./types";
import OfficeHoursModal from "./OfficeHoursModal";
import RoomFormModal from "./RoomFormModal";
import DeleteRoomDialog from "./DeleteRoomDialog";
import { standortKurz } from "./standortDisplay";

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [officeHoursModalOpen, setOfficeHoursModalOpen] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res: any = await getAllAppointmentRooms();
      const data = res?.data ?? res;
      if (Array.isArray(data)) {
        setRooms(
          data.map((room: any) => {
            const sl = room.storeLocation;
            const storeLocationId =
              sl?.id ??
              room.storeLocationId ??
              room.store_location_id ??
              null;
            const storeLocationAddress =
              sl && typeof sl.address === "string"
                ? sl.address
                : null;
            return {
              id: room.id || room._id,
              name: room.name,
              isActive: room.isActive,
              storeLocationId,
              storeLocationAddress,
            };
          })
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
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleRoomModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingRoom(null);
  };

  const handleSaveRoom = async (data: {
    name: string;
    isActive: boolean;
    storeLocationId: string;
  }) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        isActive: data.isActive,
        storeLocationId: data.storeLocationId,
      };
      if (editingRoom) {
        await updateAppointmentRoom(editingRoom.id, payload);
        toast.success("Raum aktualisiert.");
      } else {
        await createAppointmentRoom(payload);
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
        ...(room.storeLocationId
          ? { storeLocationId: room.storeLocationId }
          : {}),
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
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 pt-4">
      <div className="flex flex-col gap-4 xl:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Räume</h2>
          <p className="mt-1 text-sm text-gray-500">
            Räume für die Terminplanung verwalten. Die Raumauswahl ist bei der
            Erstellung von Terminen optional.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOfficeHoursModalOpen(true)}
            className="cursor-pointer border-gray-300"
          >
            <Clock className="h-4 w-4" />
            Bürozeiten
          </Button>
          <Button
            onClick={openAddModal}
            className="cursor-pointer bg-[#61A07B] text-white hover:bg-[#4A8A6A]"
          >
            <Plus className="h-4 w-4" />
            Raum hinzufügen
          </Button>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-gray-200 bg-white p-0 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50 hover:bg-transparent">
              <TableHead className="px-4 py-4 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                Raumbeschreibung
              </TableHead>
              <TableHead className="w-[6.5rem] max-w-[6.5rem] sm:w-28 sm:max-w-28 px-2 py-4 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                Standort
              </TableHead>
              <TableHead className="px-4 py-4 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase">
                Status
              </TableHead>
              <TableHead className="px-4 py-4 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">
                Aktionen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  Räume werden geladen…
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  Noch keine Räume angelegt.
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow
                  key={room.id}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50"
                >
                  <TableCell className="px-4 py-4 font-medium text-gray-900">
                    {room.name}
                  </TableCell>
                  <TableCell className="w-[6.5rem] max-w-[6.5rem] sm:w-28 sm:max-w-28 px-2 py-4 align-top">
                    {room.storeLocationAddress ? (
                      <span
                        className="block max-w-full truncate text-[11px] leading-tight text-gray-600"
                        title={room.storeLocationAddress}
                      >
                        {standortKurz(room.storeLocationAddress)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={room.isActive}
                        disabled={togglingId === room.id}
                        onCheckedChange={(checked) =>
                          handleToggleActive(room, checked)
                        }
                        className="cursor-pointer data-[state=checked]:bg-[#61A07B]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="cursor-pointer rounded p-2 text-gray-500 transition-colors hover:text-gray-700"
                        onClick={() => openEditModal(room)}
                        aria-label="Raum bearbeiten"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded p-2 text-gray-500 transition-colors hover:text-red-600 disabled:opacity-50"
                        onClick={() => setRoomToDelete(room)}
                        aria-label="Raum löschen"
                        disabled={deletingId === room.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RoomFormModal
        open={modalOpen}
        onOpenChange={handleRoomModalOpenChange}
        editingRoom={editingRoom}
        saving={saving}
        onSave={handleSaveRoom}
      />

      <OfficeHoursModal
        open={officeHoursModalOpen}
        onOpenChange={setOfficeHoursModalOpen}
      />

      <DeleteRoomDialog
        room={roomToDelete}
        deletingId={deletingId}
        onClose={() => setRoomToDelete(null)}
        onConfirm={confirmDeleteRoom}
      />
    </div>
  );
}
