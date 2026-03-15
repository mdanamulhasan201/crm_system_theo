"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Clock, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import EmployeeListLeftSide from "./EmployeeListLeftSide";
import CrearteAvailabilityModal from "./CrearteAvailabilityModal";
import {
  getAllEmployees,
  getAllEmployeeAvailability,
  createEmployeeAvailability,
  toggleEmployeeAvailabilityActivity,
  updateEmployeeAvailabilityTime,
  addEmployeeAvailabilityTime,
  deleteEmployeeAvailabilityTime,
} from "@/apis/employeeaApis";
import toast from "react-hot-toast";

// 0=Sunday .. 6=Saturday – all days for Tag dropdown and cards
const DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] as const;
const DEFAULT_TITLE = "Arbeitszeit";
const EMPLOYEES_PER_PAGE = 6;

// Predefined title options for dropdown (Titel)
const TITLE_OPTIONS = [
  "Arbeitszeit",
  "Pause",
  "Mittagspause",
  "Lunch",
  "Break",
  "Vormittag",
  "Nachmittag",
  "Abend",
  "Frühschicht",
  "Spätschicht",
  "Ganztags",
] as const;

// API: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
const DAY_NAME_TO_WEEK: Record<string, number> = {
  Sonntag: 0,
  Montag: 1,
  Dienstag: 2,
  Mittwoch: 3,
  Donnerstag: 4,
  Freitag: 5,
  Samstag: 6,
};
const DAY_WEEK_TO_NAME: Record<number, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

interface ScheduleEntry {
  id: string;
  slotId?: string;
  day: string;
  title: string;
  start: string;
  end: string;
}

interface StaffMember {
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
}

type DayEnabledMap = Record<string, Record<string, boolean>>;

interface DayMeta {
  eavailabilityId: string;
  isActive: boolean;
}
type DayMetaMap = Record<string, Record<string, DayMeta>>;

type ModalRow = { day: string; title: string; start: string; end: string };

function TimeInputWithIcon({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className="relative w-full">
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.currentTarget.showPicker?.()}
        className={cn(
          "h-9 w-full pr-9 text-sm",
          /* Hide browser default time icon completely - show only our right icon */
          "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-date-and-time-value]:text-left",
          className
        )}
      />
      <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none shrink-0" />
    </div>
  );
}

const newModalRow = (): ModalRow => ({
  day: DAYS[0],
  title: DEFAULT_TITLE,
  start: "09:00",
  end: "17:00",
});

export default function StaffAvailability() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [employeePage, setEmployeePage] = useState(1);
  const [totalEmployeePages, setTotalEmployeePages] = useState(1);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [scheduleEntries, setScheduleEntries] = useState<Record<string, ScheduleEntry[]>>({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [modalRows, setModalRows] = useState<ModalRow[]>([newModalRow()]);
  const [dayEnabled, setDayEnabled] = useState<DayEnabledMap>({});
  const [dayMeta, setDayMeta] = useState<DayMetaMap>({});
  const [togglingDay, setTogglingDay] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<ScheduleEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentEntries = selectedStaffId ? scheduleEntries[selectedStaffId] ?? [] : [];

  // Fetch employees for current page
  useEffect(() => {
    let cancelled = false;
    setLoadingEmployees(true);
    getAllEmployees(employeePage, EMPLOYEES_PER_PAGE)
      .then((res: any) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.data ?? [];
        const mapped: StaffMember[] = list
          .map((e: any) => ({
            id: e.id || e._id || "",
            name: e.employeeName || e.name || "—",
            email: e.email,
            image: e.image,
          }))
          .filter((e: StaffMember) => e.id);
        setStaffMembers(mapped);
        const pagination = res?.pagination;
        const totalPages = pagination?.totalPages ?? 1;
        setTotalEmployeePages(totalPages);
        if (mapped.length > 0) {
          setSelectedStaffId(mapped[0].id);
        } else {
          setSelectedStaffId(null);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Mitarbeiter konnten nicht geladen werden.");
      })
      .finally(() => {
        if (!cancelled) setLoadingEmployees(false);
      });
    return () => {
      cancelled = true;
    };
  }, [employeePage]);

  // When selectedStaffId is set, sync it from staff list if needed
  useEffect(() => {
    if (staffMembers.length > 0 && selectedStaffId === null) {
      setSelectedStaffId(staffMembers[0].id);
    }
  }, [staffMembers, selectedStaffId]);

  // Fetch availability when employee is selected
  useEffect(() => {
    if (!selectedStaffId) {
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    getAllEmployeeAvailability(selectedStaffId)
      .then((res: any) => {
        if (cancelled) return;
        // API shape: { success: true, data: [{ id, dayOfWeek, isActive, availability_time: [] }, ...] }
        const list: any[] = Array.isArray(res)
          ? res
          : (res?.data != null ? res.data : res?.availability) ?? [];
        const entries: ScheduleEntry[] = [];
        const meta: Record<string, DayMeta> = {};
        list.forEach((item: any) => {
          const dayName = DAY_WEEK_TO_NAME[item.dayOfWeek] ?? null;
          if (dayName == null) return;
          const eavailabilityId = item.id;
          const isActive = item.isActive !== false;
          // Day exists in API → always show card (even when availability_time is empty)
          if (eavailabilityId) {
            meta[dayName] = { eavailabilityId, isActive };
          }
          const slots = item.availability_time ?? item.availabilityTime ?? [];
          (Array.isArray(slots) ? slots : []).forEach((slot: any) => {
            entries.push({
              id: crypto.randomUUID(),
              slotId: slot.id,
              day: dayName,
              title: slot.title || DEFAULT_TITLE,
              start: slot.startTime ?? slot.start ?? "09:00",
              end: slot.endTime ?? slot.end ?? "17:00",
            });
          });
        });
        setScheduleEntries((prev) => ({
          ...prev,
          [selectedStaffId]: entries,
        }));
        setDayMeta((prev) => ({ ...prev, [selectedStaffId]: meta }));
      })
      .catch(() => {
        if (!cancelled) {
          setScheduleEntries((prev) => ({ ...prev, [selectedStaffId]: [] }));
          toast.error("Arbeitszeiten konnten nicht geladen werden.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStaffId]);

  const entriesByDay = useMemo(() => {
    const entries = selectedStaffId ? (scheduleEntries[selectedStaffId] ?? []) : [];
    const g: Record<string, ScheduleEntry[]> = {};
    entries.forEach((e: ScheduleEntry) => {
      if (!g[e.day]) g[e.day] = [];
      g[e.day].push(e);
    });
    return g;
  }, [scheduleEntries, selectedStaffId]);

  const daysWithEntries = useMemo(() => {
    const staffMeta = (selectedStaffId && dayMeta ? dayMeta[selectedStaffId] : null) ?? {};
    return DAYS.filter(
      (d) =>
        (entriesByDay?.[d]?.length ?? 0) > 0 || !!staffMeta?.[d]
    );
  }, [entriesByDay, dayMeta, selectedStaffId]);

  const isDayEnabled = (day: string) => {
    if (!selectedStaffId) return true;
    const meta = dayMeta[selectedStaffId]?.[day];
    if (meta) return meta.isActive;
    return dayEnabled[selectedStaffId]?.[day] ?? true;
  };

  const handleToggleDay = async (day: string) => {
    if (!selectedStaffId) return;
    const meta = dayMeta[selectedStaffId]?.[day];
    if (!meta?.eavailabilityId) {
      setDayEnabled((prev: DayEnabledMap) => ({
        ...prev,
        [selectedStaffId]: {
          ...(prev[selectedStaffId] ?? {}),
          [day]: !(prev[selectedStaffId]?.[day] ?? true),
        },
      }));
      return;
    }
    setTogglingDay(day);
    const nextActive = !meta.isActive;
    try {
      await toggleEmployeeAvailabilityActivity(selectedStaffId, meta.eavailabilityId);
      setDayMeta((prev) => ({
        ...prev,
        [selectedStaffId]: {
          ...(prev[selectedStaffId] ?? {}),
          [day]: { ...meta, isActive: nextActive },
        },
      }));
    } catch {
      toast.error("Aktivität konnte nicht umgeschaltet werden.");
    } finally {
      setTogglingDay(null);
    }
  };

  const openAddModal = () => {
    setEditingSlotId(null);
    setModalRows([newModalRow()]);
    setAddModalOpen(true);
  };

  const openAddModalForDay = (day: string) => {
    setEditingSlotId(null);
    setModalRows([{ day, title: DEFAULT_TITLE, start: "09:00", end: "17:00" }]);
    setAddModalOpen(true);
  };

  const openEditModal = (entry: ScheduleEntry) => {
    if (!entry.slotId) return;
    setEditingSlotId(entry.slotId);
    setModalRows([
      {
        day: entry.day,
        title: entry.title || DEFAULT_TITLE,
        start: entry.start,
        end: entry.end,
      },
    ]);
    setAddModalOpen(true);
  };

  const handleDayHeaderEditClick = (day: string) => {
    const dayEntries = entriesByDay?.[day] ?? [];
    const existingWithSlot = dayEntries.find((e) => e.slotId);

    if (existingWithSlot) {
      openEditModal(existingWithSlot);
    } else {
      openAddModalForDay(day);
    }
  };

  const addModalRow = () => {
    setModalRows((prev) => [...prev, newModalRow()]);
  };

  const updateModalRow = (index: number, field: keyof ModalRow, value: string) => {
    setModalRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeModalRow = (index: number) => {
    setModalRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const refetchAvailability = async () => {
    if (!selectedStaffId) return;
    const res: any = await getAllEmployeeAvailability(selectedStaffId);
    const list: any[] = Array.isArray(res)
      ? res
      : (res?.data != null ? res.data : res?.availability) ?? [];
    const entries: ScheduleEntry[] = [];
    const meta: Record<string, DayMeta> = {};
    list.forEach((item: any) => {
      const dayName = DAY_WEEK_TO_NAME[item.dayOfWeek] ?? null;
      if (dayName == null) return;
      const eavailabilityId = item.id;
      const isActive = item.isActive !== false;
      if (eavailabilityId) {
        meta[dayName] = { eavailabilityId, isActive };
      }
      const slots = item.availability_time ?? item.availabilityTime ?? [];
      (Array.isArray(slots) ? slots : []).forEach((slot: any) => {
        entries.push({
          id: crypto.randomUUID(),
          slotId: slot.id,
          day: dayName,
          title: slot.title || DEFAULT_TITLE,
          start: slot.startTime ?? slot.start ?? "09:00",
          end: slot.endTime ?? slot.end ?? "17:00",
        });
      });
    });
    setScheduleEntries((prev) => ({ ...prev, [selectedStaffId]: entries }));
    setDayMeta((prev) => ({ ...prev, [selectedStaffId]: meta }));
  };

  const saveModalEntries = async () => {
    const valid = modalRows.filter((r) => r.start && r.end);
    if (valid.length === 0 || !selectedStaffId) return;

    setSaving(true);
    try {
      if (editingSlotId) {
        // Update existing time slot: PATCH /v2/employee-availability/update-availability-time/{availabilityId}
        const row = valid[0];
        await updateEmployeeAvailabilityTime(editingSlotId, {
          title: row.title?.trim() || DEFAULT_TITLE,
          startTime: row.start,
          endTime: row.end,
        });
        toast.success("Arbeitszeit aktualisiert.");
        setAddModalOpen(false);
        setEditingSlotId(null);
        await refetchAvailability();
      } else {
        // New time slots:
        // - if day already exists (has eavailabilityId): POST /v2/employee-availability/add-availability-time
        // - if day does NOT exist yet: POST /v2/employee-availability/create/{employeeId}
        const byDay: Record<string, { title: string; start: string; end: string }[]> = {};
        valid.forEach((r) => {
          const day = r.day;
          if (!byDay[day]) byDay[day] = [];
          byDay[day].push({
            title: r.title?.trim() || DEFAULT_TITLE,
            start: r.start,
            end: r.end,
          });
        });
        await Promise.all(
          Object.entries(byDay).map(([dayName, slots]) => {
            const dayOfWeek = DAY_NAME_TO_WEEK[dayName];
            if (dayOfWeek == null) return Promise.resolve();

            const existingDay =
              selectedStaffId && dayMeta[selectedStaffId]
                ? dayMeta[selectedStaffId][dayName]
                : undefined;

            const payloadTimes = slots.map((s) => ({
              title: s.title,
              startTime: s.start,
              endTime: s.end,
            }));

            // Existing day from API but no times yet (availability_time: [])
            if (existingDay?.eavailabilityId) {
              return addEmployeeAvailabilityTime({
                availability_id: existingDay.eavailabilityId,
                availability_time: payloadTimes,
              });
            }

            // Day not yet created for this employee
            return createEmployeeAvailability(selectedStaffId, {
              dayOfWeek,
              availability_time: payloadTimes,
            });
          })
        );
        toast.success("Arbeitszeiten gespeichert.");
        setAddModalOpen(false);
        await refetchAvailability();
      }
    } catch {
      toast.error(editingSlotId ? "Aktualisierung fehlgeschlagen." : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = (id: string) => {
    if (!selectedStaffId) return;
    setScheduleEntries((prev) => ({
      ...prev,
      [selectedStaffId]: (prev[selectedStaffId] ?? []).filter((e) => e.id !== id),
    }));
  };

  const handleDeleteClick = (entry: ScheduleEntry) => {
    if (entry.slotId) {
      setEntryToDelete(entry);
    } else {
      removeEntry(entry.id);
    }
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete?.slotId) return;
    setDeleting(true);
    try {
      await deleteEmployeeAvailabilityTime(entryToDelete.slotId);
      toast.success("Zeit gelöscht.");
      setEntryToDelete(null);
      await refetchAvailability();
    } catch {
      toast.error("Löschen fehlgeschlagen.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Delete single time confirm modal */}
      <Dialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zeit löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            {entryToDelete && (
              <>
                Möchten Sie &quot;{entryToDelete.title?.trim() || "Arbeitszeit"}&quot; ({entryToDelete.start} –{" "}
                {entryToDelete.end}) wirklich löschen?
              </>
            )}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEntryToDelete(null)}
              disabled={deleting}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteEntry}
              disabled={deleting}
            >
              {deleting ? "Löschen…" : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrearteAvailabilityModal
        open={addModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingSlotId(null);
          setAddModalOpen(open);
        }}
        rows={modalRows}
        days={Array.from(DAYS)}
        titleOptions={Array.from(TITLE_OPTIONS)}
        saving={saving}
        onAddRow={addModalRow}
        onRemoveRow={removeModalRow}
        onChangeRow={updateModalRow}
        onSave={saveModalEntries}
        TimeInputWithIcon={TimeInputWithIcon}
        editMode={!!editingSlotId}
        saveButtonLabel={editingSlotId ? "Speichern" : "Hinzufügen"}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Staff members list from API (separate component) */}
        <EmployeeListLeftSide
          loading={loadingEmployees}
          employees={staffMembers}
          selectedId={selectedStaffId}
          page={employeePage}
          totalPages={totalEmployeePages}
          onSelect={setSelectedStaffId}
          onPageChange={setEmployeePage}
        />

        {/* Wöchentliche Arbeitszeiten — Add button + list from modal */}
        <div className="md:col-span-2">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Wöchentliche Arbeitszeiten
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openAddModal}
              disabled={!selectedStaffId || loadingAvailability}
              className="shrink-0 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-[#61A07B] hover:text-[#61A07B] disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Hinzufügen
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {!selectedStaffId ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-8 text-center text-sm text-gray-500">
                Bitte wählen Sie links einen Mitarbeiter aus.
              </div>
            ) : loadingAvailability ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                      <div className="h-5 w-5 rounded shrink-0 shimmer" />
                      <div className="h-4 w-24 shimmer" />
                    </div>
                    <div className="divide-y divide-gray-50 p-4 space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-20 shrink-0 shimmer" />
                        <div className="h-4 flex-1 max-w-[140px] shimmer" />
                        <div className="h-8 w-8 shrink-0 rounded-lg shimmer" />
                        <div className="h-8 w-8 shrink-0 rounded-lg shimmer" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-20 shrink-0 shimmer" />
                        <div className="h-4 flex-1 max-w-[120px] shimmer" />
                        <div className="h-8 w-8 shrink-0 rounded-lg shimmer" />
                        <div className="h-8 w-8 shrink-0 rounded-lg shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : daysWithEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-8 text-center text-sm text-gray-500">
                Noch keine Zeiten. Klicken Sie auf &quot;Hinzufügen&quot;, um Arbeitszeiten und Pausen einzutragen.
              </div>
            ) : (
              daysWithEntries.map((day) => {
                const dayEntries = entriesByDay?.[day] ?? [];
                const enabled = isDayEnabled(day);
                return (
                  <div
                    key={day}
                    className={cn(
                      "rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md",
                      enabled ? "border-gray-200" : "border-gray-100 bg-gray-50/50"
                    )}
                  >
                    {/* Card header: switch + day */}
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 rounded-t-xl border-b",
                        enabled ? "border-gray-100 bg-gray-50/30" : "border-gray-100 bg-gray-50/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => handleToggleDay(day)}
                          disabled={togglingDay === day}
                          className="data-[state=checked]:bg-[#61A07B] shrink-0 cursor-pointer"
                        />
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            enabled ? "text-gray-900" : "text-gray-400"
                          )}
                        >
                          {day}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDayHeaderEditClick(day)}
                        disabled={!enabled}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          enabled
                            ? "text-gray-400 hover:text-[#61A07B] hover:bg-[#61A07B]/10 cursor-pointer"
                            : "text-gray-300 cursor-not-allowed"
                        )}
                        aria-label="Arbeitszeit für diesen Tag hinzufügen oder bearbeiten"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Time slots list */}
                    <div className="divide-y divide-gray-50">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={cn(
                            "flex items-center gap-4 px-4 py-2.5 transition-colors",
                            enabled
                              ? "hover:bg-gray-50/80"
                              : "opacity-60"
                          )}
                        >
                          <span
                            className={cn(
                              "text-sm w-24 shrink-0",
                              enabled ? "text-gray-500 font-medium" : "text-gray-400"
                            )}
                          >
                            {entry.title?.trim() || "Zeit"}:
                          </span>
                          <span
                            className={cn(
                              "text-sm tabular-nums flex-1 min-w-0",
                              enabled ? "text-gray-800" : "text-gray-500"
                            )}
                          >
                            {entry.start} – {entry.end}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(entry)}
                              disabled={!enabled}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                enabled
                                  ? "text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  : "text-gray-300 cursor-not-allowed"
                              )}
                              aria-label="Eintrag entfernen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

