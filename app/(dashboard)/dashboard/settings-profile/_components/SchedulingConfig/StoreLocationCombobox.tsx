"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchAllStoreLocations,
  type StoreLocation,
} from "@/apis/setting/locationManagementApis";
import { standortKurz } from "./standortDisplay";

const PAGE_SIZE = 10;

function locationLabel(loc: StoreLocation): string {
  const d = (loc.description || "").trim();
  if (d) return `${loc.address} — ${d}`;
  return loc.address || loc.id;
}

export default function StoreLocationCombobox({
  value,
  onChange,
  disabled,
  id = "store-location",
  /** Load options as soon as true (e.g. modal open), not only when dropdown opens */
  preload = false,
  /** Shown when `value` is set but the matching location is not in the loaded list yet */
  pendingSelectionLabel,
}: {
  value: string | null;
  onChange: (storeLocationId: string | null) => void;
  disabled?: boolean;
  id?: string;
  preload?: boolean;
  pendingSelectionLabel?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [listPage, setListPage] = useState(1);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchDoneRef = useRef(false);

  const load = useCallback(async () => {
    if (fetchDoneRef.current) return;
    fetchDoneRef.current = true;
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchAllStoreLocations();
      setLocations(list);
    } catch {
      setLoadError("Standorte konnten nicht geladen werden.");
      setLocations([]);
      fetchDoneRef.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open || preload) void load();
  }, [open, preload, load]);

  const selected = useMemo(
    () => locations.find((l) => l.id === value) ?? null,
    [locations, value]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      const hay = `${loc.address} ${loc.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [locations, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pagedLocations = useMemo(() => {
    const start = (listPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, listPage]);

  useEffect(() => {
    setListPage(1);
  }, [search]);

  useEffect(() => {
    setListPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!open) setListPage(1);
  }, [open]);

  const TRIGGER_PREVIEW_LEN = 28;
  const pending = (pendingSelectionLabel ?? "").trim();
  const displayText = selected
    ? standortKurz(locationLabel(selected), TRIGGER_PREVIEW_LEN)
    : value && pending
      ? standortKurz(pending, TRIGGER_PREVIEW_LEN)
      : value
        ? "Standort wird geladen…"
        : "Standort wählen…";
  const titleText = selected
    ? locationLabel(selected)
    : pending
      ? pending
      : undefined;
  const showPagination = filtered.length > PAGE_SIZE;

  return (
    <div className="grid min-w-0 w-full max-w-full gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-900">
        Standort <span className="text-red-500">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            title={titleText}
            className={cn(
              "h-10 w-full min-w-0 max-w-full justify-between gap-2 overflow-hidden border-gray-200 bg-white font-normal shadow-sm",
              "hover:bg-white focus-visible:border-[#61A07B] focus-visible:ring-[#61A07B]/25 focus-visible:ring-[3px]",
              !value && "text-muted-foreground"
            )}
          >
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
              {displayText}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0 border-gray-200"
          align="start"
        >
          <div className="flex flex-col gap-0 border-b border-gray-100 p-2">
            <Input
              placeholder="Suche nach Adresse…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "h-9 border-gray-200",
                "focus-visible:border-[#61A07B] focus-visible:ring-[#61A07B]/25"
              )}
              autoComplete="off"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {loading && locations.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Standorte werden geladen…
              </div>
            ) : loadError ? (
              <p className="px-2 py-3 text-sm text-destructive">{loadError}</p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Kein Treffer.
              </p>
            ) : (
              pagedLocations.map((loc) => {
                const isSel = value === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors",
                      isSel ? "bg-[#61A07B]/15 text-gray-900" : "hover:bg-gray-100"
                    )}
                    onClick={() => {
                      onChange(loc.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 text-[#61A07B]",
                        isSel ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug break-words">
                        {loc.address}
                      </span>
                      {(loc.description || "").trim() ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {loc.description}
                        </span>
                      ) : null}
                      {loc.isPrimary ? (
                        <span className="mt-1 inline-block rounded bg-[#61A07B]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#61A07B]">
                          Primär
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {showPagination && !loading && !loadError && filtered.length > 0 ? (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-1 py-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                disabled={listPage <= 1}
                onClick={() => setListPage((p) => Math.max(1, p - 1))}
                aria-label="Vorherige Seite"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {listPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                disabled={listPage >= totalPages}
                onClick={() =>
                  setListPage((p) => Math.min(totalPages, p + 1))
                }
                aria-label="Nächste Seite"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Mit dem Raum verknüpfter Filial- / Store-Standort.
      </p>
    </div>
  );
}
