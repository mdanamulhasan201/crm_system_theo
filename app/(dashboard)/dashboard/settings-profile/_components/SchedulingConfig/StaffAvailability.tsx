"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

interface BreakSlot {
  id: string;
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
  breaks: BreakSlot[];
}

const defaultDaySchedule = (): DaySchedule => ({
  enabled: true,
  start: "09:00",
  end: "17:00",
  breaks: [{ id: crypto.randomUUID(), start: "12:00", end: "13:00" }],
});

const STAFF_MEMBERS = [
  { id: "anna", name: "Anna" },
  { id: "mark", name: "Mark" },
  { id: "lisa", name: "Lisa" },
  { id: "tom", name: "Tom" },
];

function TimeInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-[110px] rounded-md border border-gray-200 bg-white pl-2.5 pr-8 text-sm text-gray-900",
        className
      )}
    />
  );
}

export default function StaffAvailability() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("anna");
  const [schedules, setSchedules] = useState<Record<string, Record<string, DaySchedule>>>(() => {
    const initial: Record<string, Record<string, DaySchedule>> = {};
    STAFF_MEMBERS.forEach((s) => {
      initial[s.id] = {};
      DAYS.forEach((day) => {
        initial[s.id][day] = defaultDaySchedule();
      });
    });
    return initial;
  });

  const currentSchedule = schedules[selectedStaffId];
  if (!currentSchedule) return null;

  const updateDay = (day: (typeof DAYS)[number], updater: (d: DaySchedule) => DaySchedule) => {
    setSchedules((prev) => ({
      ...prev,
      [selectedStaffId]: {
        ...prev[selectedStaffId],
        [day]: updater(prev[selectedStaffId][day]),
      },
    }));
  };

  const addBreak = (day: (typeof DAYS)[number]) => {
    updateDay(day, (d) => ({
      ...d,
      breaks: [...d.breaks, { id: crypto.randomUUID(), start: "12:00", end: "13:00" }],
    }));
  };

  const removeBreak = (day: (typeof DAYS)[number], breakId: string) => {
    updateDay(day, (d) => ({
      ...d,
      breaks: d.breaks.filter((b) => b.id !== breakId),
    }));
  };

  const setBreakTime = (
    day: (typeof DAYS)[number],
    breakId: string,
    field: "start" | "end",
    value: string
  ) => {
    updateDay(day, (d) => ({
      ...d,
      breaks: d.breaks.map((b) => (b.id === breakId ? { ...b, [field]: value } : b)),
    }));
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Staff members list */}
        <div className="md:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
            Staff Members
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

        {/* Weekly working hours */}
        <div className="md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
            Weekly Working Hours
          </h3>
          <div className="flex flex-col gap-4">
            {DAYS.map((day) => {
              const dayData = currentSchedule[day];
              if (!dayData) return null;
              return (
                <div
                  key={day}
                  className="rounded-xl flex flex-row items-start gap-6 border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                >
                  {/* Row — left: Switch + day */}
                  <div className="flex items-center gap-3 shrink-0 pt-0.5">
                    <Switch
                      checked={dayData.enabled}
                      onCheckedChange={(checked) =>
                        updateDay(day, (d) => ({ ...d, enabled: checked }))
                      }
                      className="data-[state=checked]:bg-[#61A07B] shrink-0 cursor-pointer"
                    />
                    <span className="font-medium text-gray-900 whitespace-nowrap">{day}</span>
                  </div>

                  {/* Row — right: Hours & Breaks rows, labels aligned */}
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {/* Hours row: label + 09:00 - 17:00 */}
                    <div className="flex flex-row flex-wrap items-center gap-3">
                      <span className="text-sm font-normal text-gray-500 w-14 shrink-0">
                        Hours:
                      </span>
                      <TimeInput
                        value={dayData.start}
                        onChange={(v) => updateDay(day, (d) => ({ ...d, start: v }))}
                      />
                      <span className="text-gray-400 font-medium">–</span>
                      <TimeInput
                        value={dayData.end}
                        onChange={(v) => updateDay(day, (d) => ({ ...d, end: v }))}
                      />
                    </div>

                    {/* Breaks rows: label + times + trash, same alignment */}
                    {dayData.breaks.map((br, idx) => (
                      <div key={br.id} className="flex flex-row flex-wrap items-center gap-3">
                        <span className="text-sm font-normal text-gray-500 w-14 shrink-0">
                          {idx === 0 ? "Breaks:" : ""}
                        </span>
                        <TimeInput
                          value={br.start}
                          onChange={(v) => setBreakTime(day, br.id, "start", v)}
                        />
                        <span className="text-gray-400 font-medium">–</span>
                        <TimeInput
                          value={br.end}
                          onChange={(v) => setBreakTime(day, br.id, "end", v)}
                        />
                        <button
                          type="button"
                          className="p-1.5 cursor-pointer text-gray-400 hover:text-red-600 rounded transition-colors shrink-0"
                          onClick={() => removeBreak(day, br.id)}
                          aria-label="Remove break"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-row items-center">
                      <span className="w-14 shrink-0" aria-hidden />
                      <button
                        type="button"
                        onClick={() => addBreak(day)}
                        className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        + Add break
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
