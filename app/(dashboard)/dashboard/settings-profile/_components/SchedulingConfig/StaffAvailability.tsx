"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"] as const;
const DEFAULT_TITLE = "Arbeitszeit";

interface ScheduleEntry {
  id: string;
  day: string;
  title: string;
  start: string;
  end: string;
}

const STAFF_MEMBERS = [
  { id: "anna", name: "Anna" },
  { id: "mark", name: "Mark" },
  { id: "lisa", name: "Lisa" },
  { id: "tom", name: "Tom" },
];

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
  title: "",
  start: "09:00",
  end: "17:00",
});

export default function StaffAvailability() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("anna");
  const [scheduleEntries, setScheduleEntries] = useState<Record<string, ScheduleEntry[]>>(() => {
    const initial: Record<string, ScheduleEntry[]> = {};
    STAFF_MEMBERS.forEach((s) => {
      initial[s.id] = [];
    });
    return initial;
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<ModalRow[]>([newModalRow()]);
  const [dayEnabled, setDayEnabled] = useState<Record<string, Record<string, boolean>>>({});

  const currentEntries = scheduleEntries[selectedStaffId] ?? [];

  const entriesByDay = useMemo(() => {
    const entries = scheduleEntries[selectedStaffId] ?? [];
    const g: Record<string, ScheduleEntry[]> = {};
    entries.forEach((e) => {
      if (!g[e.day]) g[e.day] = [];
      g[e.day].push(e);
    });
    return g;
  }, [scheduleEntries, selectedStaffId]);

  const daysWithEntries = useMemo(
    () => DAYS.filter((d) => (entriesByDay[d]?.length ?? 0) > 0),
    [entriesByDay]
  );

  const isDayEnabled = (day: string) => dayEnabled[selectedStaffId]?.[day] ?? true;

  const setDayEnabledFor = (day: string, enabled: boolean) => {
    setDayEnabled((prev) => ({
      ...prev,
      [selectedStaffId]: {
        ...(prev[selectedStaffId] ?? {}),
        [day]: enabled,
      },
    }));
  };

  const openAddModal = () => {
    setModalRows([newModalRow()]);
    setAddModalOpen(true);
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

  const saveModalEntries = () => {
    const toAdd: ScheduleEntry[] = modalRows
      .filter((r) => r.start && r.end)
      .map((r) => ({
        id: crypto.randomUUID(),
        day: r.day,
        title: r.title || DEFAULT_TITLE,
        start: r.start,
        end: r.end,
      }));
    if (toAdd.length === 0) return;
    setScheduleEntries((prev) => ({
      ...prev,
      [selectedStaffId]: [...(prev[selectedStaffId] ?? []), ...toAdd],
    }));
    setAddModalOpen(false);
  };

  const removeEntry = (id: string) => {
    setScheduleEntries((prev) => ({
      ...prev,
      [selectedStaffId]: (prev[selectedStaffId] ?? []).filter((e) => e.id !== id),
    }));
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Arbeitszeiten hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
            {modalRows.map((row, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50"
              >
                {/* Tag half + Titel half — full width row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5 min-w-0">
                    <label className="text-xs font-medium text-gray-600">Tag</label>
                    <select
                      value={row.day}
                      onChange={(e) => updateModalRow(index, "day", e.target.value)}
                      className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm w-full"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1.5 min-w-0">
                    <label className="text-xs font-medium text-gray-600">Titel</label>
                    <Input
                      value={row.title}
                      onChange={(e) => updateModalRow(index, "title", e.target.value)}
                      placeholder={DEFAULT_TITLE}
                      className="h-9 text-sm w-full"
                    />
                  </div>
                </div>
                {/* Start half + Ende half — full width row + trash */}
                <div className="flex gap-3 items-end">
                  <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
                    <div className="grid gap-1.5 min-w-0">
                      <label className="text-xs font-medium text-gray-600">Start</label>
                      <TimeInputWithIcon
                        value={row.start}
                        onChange={(v) => updateModalRow(index, "start", v)}
                        className="h-9 text-sm w-full"
                      />
                    </div>
                    <div className="grid gap-1.5 min-w-0">
                      <label className="text-xs font-medium text-gray-600">Ende</label>
                      <TimeInputWithIcon
                        value={row.end}
                        onChange={(v) => updateModalRow(index, "end", v)}
                        className="h-9 text-sm w-full"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModalRow(index)}
                    className="p-2 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    aria-label="Zeile entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addModalRow}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Weitere Zeile hinzufügen
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={saveModalEntries}
              className="bg-[#61A07B] hover:bg-[#61A07B]/90"
            >
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Staff members list */}
        <div className="md:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
            Mitarbeiter
          </h3>
          <div className="flex flex-col gap-2">
            {STAFF_MEMBERS.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaffId(staff.id)}
                className={cn(
                  "w-full cursor-pointer text-left px-4 py-3 rounded-lg border transition-colors",
                  selectedStaffId === staff.id
                    ? "bg-[#61A07B] border-[#61A07B]/60 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {staff.name}
              </button>
            ))}
          </div>
        </div>

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
              className="shrink-0 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-[#61A07B] hover:text-[#61A07B]"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Hinzufügen
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {currentEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-8 text-center text-sm text-gray-500">
                Noch keine Zeiten. Klicken Sie auf &quot;Hinzufügen&quot;, um Arbeitszeiten und Pausen einzutragen.
              </div>
            ) : (
              daysWithEntries.map((day) => {
                const dayEntries = entriesByDay[day] ?? [];
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
                        "flex items-center gap-3 px-4 py-3 rounded-t-xl border-b",
                        enabled ? "border-gray-100 bg-gray-50/30" : "border-gray-100 bg-gray-50/50"
                      )}
                    >
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => setDayEnabledFor(day, checked)}
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
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            disabled={!enabled}
                            className={cn(
                              "p-2 rounded-lg shrink-0 transition-colors",
                              enabled
                                ? "text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                : "text-gray-300 cursor-not-allowed"
                            )}
                            aria-label="Eintrag entfernen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
