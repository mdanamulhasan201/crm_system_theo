"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Clock, CalendarX, Calendar } from "lucide-react";
import { createBookingRule, getAllBookingRules } from "@/apis/employeeaApis";
import toast from "react-hot-toast";

export default function BookingRules() {
  // Start with empty fields; they will be populated from API if data exists
  const [minNoticeHours, setMinNoticeHours] = useState("");
  const [cancellationHours, setCancellationHours] = useState("");
  const [defaultSlotMinutes, setDefaultSlotMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const res: any = await getAllBookingRules();
        const data = res?.data ?? res;
        if (data) {
          if (typeof data.minNoticeHours === "number") {
            setMinNoticeHours(String(data.minNoticeHours));
          }
          if (typeof data.cancellationHours === "number") {
            setCancellationHours(String(data.cancellationHours));
          }
          if (typeof data.defaultSlotMinutes === "number") {
            setDefaultSlotMinutes(String(data.defaultSlotMinutes));
          }
        }
      } catch {
        toast.error("Buchungsregeln konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleSave = async () => {
    const payload = {
      minNoticeHours: minNoticeHours === "" ? null : Number(minNoticeHours),
      cancellationHours: cancellationHours === "" ? null : Number(cancellationHours),
      defaultSlotMinutes: defaultSlotMinutes === "" ? null : Number(defaultSlotMinutes),
    };

    setSaving(true);
    try {
      await createBookingRule(payload);
      toast.success("Buchungsregeln gespeichert.");
    } catch {
      toast.error("Buchungsregeln konnten nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Buchungsregeln</h2>
        <p className="text-sm text-gray-500 mt-1">
          Globale Regeln für alle Terminbuchungen festlegen.
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
                Mindestvorlaufzeit
              </Label>
              <p className="text-sm text-gray-500">
                Termine müssen mindestens so viele Stunden im Voraus gebucht werden.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  value={minNoticeHours}
                  onChange={(e) => setMinNoticeHours(e.target.value)}
                  disabled={loading}
                  className="h-9 w-24 rounded-md border-gray-200 bg-white"
                />
                <span className="text-sm text-gray-600">Stunden</span>
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
                Stornierungsfrist
              </Label>
              <p className="text-sm text-gray-500">
                Termine können bis zu so vielen Stunden vor Beginn storniert werden.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  value={cancellationHours}
                  onChange={(e) => setCancellationHours(e.target.value)}
                  disabled={loading}
                  className="h-9 w-24 rounded-md border-gray-200 bg-white"
                />
                <span className="text-sm text-gray-600">Stunden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slot Length — editable card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex flex-row items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Slot-Länge
              </Label>
              <p className="text-sm text-gray-500">
                Standard-Dauer eines Terminslots in Minuten.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={0}
                  value={defaultSlotMinutes}
                  onChange={(e) => setDefaultSlotMinutes(e.target.value)}
                  disabled={loading}
                  className="h-9 w-24 rounded-md border-gray-200 bg-white"
                />
                <span className="text-sm text-gray-600">Minuten</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#61A07B] hover:bg-[#4A8A6A] text-white cursor-pointer"
          >
            <Check className="h-4 w-4" />
            {saving ? "Wird gespeichert…" : "Änderungen speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}
