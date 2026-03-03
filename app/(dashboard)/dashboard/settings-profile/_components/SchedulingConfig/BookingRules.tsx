"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Info, Clock, CalendarX, Calendar } from "lucide-react";

export default function BookingRules() {
  const [minNoticeHours, setMinNoticeHours] = useState("24");
  const [cancellationHours, setCancellationHours] = useState("48");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Booking Rules</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure global rules that apply to all appointment bookings.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        {/* Minimum Notice — card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex flex-row items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Minimum Notice Time
              </Label>
              <p className="text-sm text-gray-500">
                Appointments must be booked at least this many hours in advance.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  value={minNoticeHours}
                  onChange={(e) => setMinNoticeHours(e.target.value)}
                  className="h-9 w-24 rounded-md border-gray-200 bg-white"
                />
                <span className="text-sm text-gray-600">hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Deadline — card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex flex-row items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <CalendarX className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Cancellation Deadline
              </Label>
              <p className="text-sm text-gray-500">
                Appointments can be cancelled up to this many hours before the
                start time.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  value={cancellationHours}
                  onChange={(e) => setCancellationHours(e.target.value)}
                  className="h-9 w-24 rounded-md border-gray-200 bg-white"
                />
                <span className="text-sm text-gray-600">hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slot Length — read-only info card */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-row items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200/80 text-gray-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <Label className="text-sm font-semibold text-gray-900">
                Slot Length
              </Label>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <span className="font-medium text-gray-700">30 minutes</span>
                <span
                  className="text-gray-400"
                  title="All appointment slots are fixed at 30 minutes. Duration can be adjusted when creating appointments."
                >
                  <Info className="h-4 w-4 shrink-0" />
                </span>
              </p>
              <p className="text-xs text-gray-500">
                All appointment slots are fixed at 30 minutes. Duration can be
                adjusted when creating appointments.
              </p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#61A07B] hover:bg-[#4A8A6A] text-white cursor-pointer"
          >
            <Check className="h-4 w-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
