import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

type ModalRow = { day: string; title: string; start: string; end: string };

interface CreateAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: ModalRow[];
  days: string[];
  titleOptions: string[];
  saving: boolean;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChangeRow: (index: number, field: keyof ModalRow, value: string) => void;
  onSave: () => void;
  TimeInputWithIcon: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    className?: string;
  }>;
  editMode?: boolean;
  saveButtonLabel?: string;
}

export default function CrearteAvailabilityModal({
  open,
  onOpenChange,
  rows,
  days,
  titleOptions,
  saving,
  onAddRow,
  onRemoveRow,
  onChangeRow,
  onSave,
  TimeInputWithIcon,
  editMode = false,
  saveButtonLabel = "Hinzufügen",
}: CreateAvailabilityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editMode ? "Arbeitszeit bearbeiten" : "Arbeitszeiten hinzufügen"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
          {rows.map((row, index) => (
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
                    onChange={(e) => !editMode && onChangeRow(index, "day", e.target.value)}
                    disabled={editMode}
                    className={cn(
                      "h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm w-full",
                      editMode && "bg-gray-100 cursor-not-allowed opacity-80"
                    )}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5 min-w-0">
                  <label className="text-xs font-medium text-gray-600">Titel</label>
                  <select
                    value={row.title}
                    onChange={(e) => onChangeRow(index, "title", e.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm w-full"
                  >
                    {titleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Start half + Ende half — full width row + trash */}
              <div className="flex gap-3 items-end">
                <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
                  <div className="grid gap-1.5 min-w-0">
                    <label className="text-xs font-medium text-gray-600">Start</label>
                    <TimeInputWithIcon
                      value={row.start}
                      onChange={(v) => onChangeRow(index, "start", v)}
                      className="h-9 text-sm w-full"
                    />
                  </div>
                  <div className="grid gap-1.5 min-w-0">
                    <label className="text-xs font-medium text-gray-600">Ende</label>
                    <TimeInputWithIcon
                      value={row.end}
                      onChange={(v) => onChangeRow(index, "end", v)}
                      className="h-9 text-sm w-full"
                    />
                  </div>
                </div>
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => onRemoveRow(index)}
                    className="p-2 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    aria-label="Zeile entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {!editMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddRow}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Weitere Zeile hinzufügen
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="bg-[#61A07B] hover:bg-[#61A07B]/90"
          >
            {saving ? "Speichern…" : saveButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
