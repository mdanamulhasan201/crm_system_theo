import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY_ABBR: Record<string, string> = {
  Sonntag: "So",
  Montag: "Mo",
  Dienstag: "Di",
  Mittwoch: "Mi",
  Donnerstag: "Do",
  Freitag: "Fr",
  Samstag: "Sa",
};

const WORKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const WEEKEND = ["Samstag", "Sonntag"];

interface CreateAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: string[];
  titleOptions: string[];
  saving: boolean;
  onSave: () => void;
  TimeInputWithIcon: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    className?: string;
  }>;
  editMode?: boolean;
  saveButtonLabel?: string;
  // Shared fields (add + edit)
  title: string;
  start: string;
  end: string;
  onTitleChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  // Add mode only
  selectedDays?: string[];
  onDayToggle?: (day: string) => void;
  // Edit mode only (read-only display)
  editDay?: string;
}

export default function CrearteAvailabilityModal({
  open,
  onOpenChange,
  days,
  titleOptions,
  saving,
  onSave,
  TimeInputWithIcon,
  editMode = false,
  saveButtonLabel,
  title,
  start,
  end,
  onTitleChange,
  onStartChange,
  onEndChange,
  selectedDays = [],
  onDayToggle,
  editDay,
}: CreateAvailabilityModalProps) {
  const allSelected = days.every((d) => selectedDays.includes(d));
  const workdaysSelected = WORKDAYS.every((d) => selectedDays.includes(d));
  const weekendSelected = WEEKEND.every((d) => selectedDays.includes(d));

  const toggleAll = () => {
    if (!onDayToggle) return;
    if (allSelected) {
      days.forEach((d) => { if (selectedDays.includes(d)) onDayToggle(d); });
    } else {
      days.forEach((d) => { if (!selectedDays.includes(d)) onDayToggle(d); });
    }
  };

  const toggleGroup = (group: string[]) => {
    if (!onDayToggle) return;
    const allIn = group.every((d) => selectedDays.includes(d));
    if (allIn) {
      group.forEach((d) => { if (selectedDays.includes(d)) onDayToggle(d); });
    } else {
      group.forEach((d) => { if (!selectedDays.includes(d)) onDayToggle(d); });
    }
  };

  const dayCount = selectedDays.length;
  const buttonLabel = saveButtonLabel
    ? saveButtonLabel
    : editMode
    ? "Speichern"
    : dayCount > 1
    ? `Hinzufügen (${dayCount} Tage)`
    : "Hinzufügen";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Arbeitszeit bearbeiten" : "Arbeitszeiten hinzufügen"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* ── ADD MODE: multi-day selector ── */}
          {!editMode && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tage auswählen
              </span>

              {/* Day pills */}
              <div className="flex flex-wrap gap-2">
                {days.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onDayToggle?.(day)}
                      className={cn(
                        "h-9 w-11 rounded-lg text-sm font-semibold transition-all cursor-pointer border",
                        active
                          ? "bg-[#61A07B] text-white border-[#61A07B] shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#61A07B] hover:text-[#61A07B]"
                      )}
                      title={day}
                    >
                      {DAY_ABBR[day] ?? day.slice(0, 2)}
                    </button>
                  );
                })}
              </div>

              {/* Quick-select shortcuts */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(WORKDAYS)}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer",
                    workdaysSelected
                      ? "bg-[#61A07B]/10 text-[#61A07B] border-[#61A07B]/30"
                      : "bg-gray-100 text-gray-500 border-gray-200 hover:border-[#61A07B] hover:text-[#61A07B]"
                  )}
                >
                  Mo – Fr
                </button>
                <button
                  type="button"
                  onClick={() => toggleGroup(WEEKEND)}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer",
                    weekendSelected
                      ? "bg-[#61A07B]/10 text-[#61A07B] border-[#61A07B]/30"
                      : "bg-gray-100 text-gray-500 border-gray-200 hover:border-[#61A07B] hover:text-[#61A07B]"
                  )}
                >
                  Wochenende
                </button>
                <button
                  type="button"
                  onClick={toggleAll}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer",
                    allSelected
                      ? "bg-[#61A07B]/10 text-[#61A07B] border-[#61A07B]/30"
                      : "bg-gray-100 text-gray-500 border-gray-200 hover:border-[#61A07B] hover:text-[#61A07B]"
                  )}
                >
                  Alle Tage
                </button>
              </div>

              {/* Selected summary */}
              {dayCount > 0 && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-[#61A07B]">{dayCount} Tag{dayCount !== 1 ? "e" : ""}</span>{" "}
                  ausgewählt: {selectedDays.map((d) => DAY_ABBR[d] ?? d).join(", ")}
                </p>
              )}
              {dayCount === 0 && (
                <p className="text-xs text-red-500">Bitte mindestens einen Tag auswählen.</p>
              )}
            </div>
          )}

          {/* ── EDIT MODE: read-only day badge ── */}
          {editMode && editDay && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tag</span>
              <div className="inline-flex h-9 items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 w-fit">
                {editDay}
              </div>
            </div>
          )}

          {/* ── SHARED: Titel + Start + Ende ── */}
          <div className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Zeitraum</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Titel */}
              <div className="grid gap-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-600">Titel</label>
                <select
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm w-full"
                >
                  {titleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {/* Start */}
              <div className="grid gap-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-600">Start</label>
                <TimeInputWithIcon
                  value={start}
                  onChange={onStartChange}
                  className="h-9 text-sm w-full"
                />
              </div>
              {/* Ende */}
              <div className="grid gap-1.5 min-w-0">
                <label className="text-xs font-medium text-gray-600">Ende</label>
                <TimeInputWithIcon
                  value={end}
                  onChange={onEndChange}
                  className="h-9 text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={saving || (!editMode && dayCount === 0)}
            className="bg-[#61A07B] hover:bg-[#61A07B]/90"
          >
            {saving ? "Speichern…" : buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
