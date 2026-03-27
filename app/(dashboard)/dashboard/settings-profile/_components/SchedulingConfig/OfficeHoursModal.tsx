"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  getOfficeStartAndEndTime,
  setOfficeStartAndEndTime,
} from "@/apis/employeeaApis";

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "17:00";

function pickShopHours(res: unknown): { shop_open: string; shop_close: string } {
  const r = res as {
    data?: { shop_open?: string; shop_close?: string };
    shop_open?: string;
    shop_close?: string;
  };
  const inner = r?.data ?? r;
  return {
    shop_open:
      typeof inner?.shop_open === "string" ? inner.shop_open : DEFAULT_OPEN,
    shop_close:
      typeof inner?.shop_close === "string" ? inner.shop_close : DEFAULT_CLOSE,
  };
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES_60 = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

function parseTo24Parts(raw: string): { h: string; m: string } {
  const [a, b] = (raw || "00:00").split(":");
  const hn = parseInt(a ?? "0", 10);
  const mn = parseInt(b ?? "0", 10);
  const h = Number.isFinite(hn) ? Math.min(23, Math.max(0, hn)) : 0;
  const m = Number.isFinite(mn) ? Math.min(59, Math.max(0, mn)) : 0;
  return { h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0") };
}

function normalizeHhMm(raw: string): string {
  const { h, m } = parseTo24Parts(raw);
  return `${h}:${m}`;
}

function TimeInput24({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { h, m } = parseTo24Parts(value);
  const commit = (nh: string, nm: string) =>
    onChange(`${nh.padStart(2, "0")}:${nm.padStart(2, "0")}`);

  const triggerClass = cn(
    "w-full min-w-0 border-gray-200 bg-white shadow-sm",
    "focus-visible:border-[#61A07B] focus-visible:ring-[#61A07B]/25 focus-visible:ring-[3px]"
  );

  return (
    <div className="grid w-full min-w-0 gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}{" "}
        <span className="font-normal text-muted-foreground">(24 h)</span>
      </Label>
      <div
        className="flex w-full min-w-0 flex-nowrap items-center gap-2"
        id={id}
      >
        <div className="min-w-0 flex-1 basis-0">
          <Select value={h} onValueChange={(nh) => commit(nh, m)}>
            <SelectTrigger
              className={triggerClass}
              aria-label={`${label}: Stunde`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60 border-gray-200">
              {HOURS_24.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span
          className="shrink-0 text-sm font-semibold text-gray-400"
          aria-hidden
        >
          :
        </span>
        <div className="min-w-0 flex-1 basis-0">
          <Select value={m} onValueChange={(nm) => commit(h, nm)}>
            <SelectTrigger
              className={triggerClass}
              aria-label={`${label}: Minute`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60 border-gray-200">
              {MINUTES_60.map((min) => (
                <SelectItem key={min} value={min}>
                  {min}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default function OfficeHoursModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [officeStart, setOfficeStart] = useState(DEFAULT_OPEN);
  const [officeEnd, setOfficeEnd] = useState(DEFAULT_CLOSE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getOfficeStartAndEndTime();
        if (cancelled) return;
        const { shop_open, shop_close } = pickShopHours(res);
        setOfficeStart(normalizeHhMm(shop_open));
        setOfficeEnd(normalizeHhMm(shop_close));
      } catch {
        if (!cancelled) {
          toast.error("Bürozeiten konnten nicht geladen werden.");
          setOfficeStart(normalizeHhMm(DEFAULT_OPEN));
          setOfficeEnd(normalizeHhMm(DEFAULT_CLOSE));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (officeStart >= officeEnd) {
      toast.error("Endzeit muss nach der Startzeit liegen.");
      return;
    }
    const shop_open = normalizeHhMm(officeStart);
    const shop_close = normalizeHhMm(officeEnd);
    setSaving(true);
    try {
      await setOfficeStartAndEndTime(shop_open, shop_close);
      toast.success("Bürozeiten gespeichert.");
      onOpenChange(false);
    } catch {
      toast.error("Bürozeiten konnten nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bürozeiten</DialogTitle>
          <DialogDescription>
            Zeiten im 24-Stunden-Format (00:00–23:59). Werden für den Shop
            gespeichert.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid w-full min-w-0 gap-4 py-2"
        >
          <div className="grid w-full min-w-0 grid-cols-1 gap-5">
            {loading ? (
              <p className="text-sm text-muted-foreground py-4">
                Bürozeiten werden geladen…
              </p>
            ) : (
              <>
                <TimeInput24
                  id="office-start"
                  label="Startzeit"
                  value={officeStart}
                  onChange={setOfficeStart}
                />
                <TimeInput24
                  id="office-end"
                  label="Endzeit"
                  value={officeEnd}
                  onChange={setOfficeEnd}
                />
              </>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || saving}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-[#61A07B] hover:bg-[#4A8A6A] cursor-pointer"
              disabled={loading || saving}
            >
              {saving ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
