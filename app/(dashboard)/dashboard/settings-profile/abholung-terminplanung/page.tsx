"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarClock,
  Users,
  SlidersHorizontal,
  ClipboardList,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import WohnortInput from "../../_components/Customers/WohnortInput";
import toast from "react-hot-toast";
import { createAuftragszettel, getAuftragszettel } from "@/apis/auftragszettelApis";
import { getAllLocations } from "@/apis/setting/locationManagementApis";

type PickupAddress = { address: string };

type HydratedValues = {
  isEnabled: boolean;
  processingDays: string;
  autoCreateEnabled: boolean;
  assigneeOption: "creator" | "fixed-per-location";
  respectWorkTimes: boolean;
  respectExistingAppointments: boolean;
  pickupLocations: PickupAddress[];
};

export default function AbholungTerminplanungPage() {
  const saveTimerRef = useRef<number | null>(null);
  // Stores the last values loaded from the API so we can skip saving when
  // nothing has actually changed after hydration.
  const hydratedValuesRef = useRef<HydratedValues | null>(null);

  const [isEnabled, setIsEnabled] = useState(true);
  const [calculationBase, setCalculationBase] =
    useState<"fixed-processing-time">("fixed-processing-time");
  const [processingDays, setProcessingDays] = useState<string>("5");
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(false);
  const [assigneeOption, setAssigneeOption] = useState<
    "creator" | "fixed-per-location"
  >("creator");
  const [respectWorkTimes, setRespectWorkTimes] = useState(true);
  const [respectExistingAppointments, setRespectExistingAppointments] =
    useState(true);
  const [calendarSource, setCalendarSource] = useState("partner");
  const [kvAssignmentMode, setKvAssignmentMode] = useState<
    "fixed-employee" | "creator"
  >("fixed-employee");
  const [kvEmployee, setKvEmployee] = useState("");
  const [pickupLocations, setPickupLocations] = useState<PickupAddress[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [storeLocations, setStoreLocations] = useState<Array<{ id: string; address: string; description?: string }>>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const buildPayload = () => {
    const insoleDays = Number.parseInt(processingDays || "0", 10);
    return {
      isInsolePickupDateLine: Boolean(isEnabled),
      insolePickupDateLine: Number.isFinite(insoleDays) ? insoleDays : 0,
      order_creation_appomnent: Boolean(autoCreateEnabled),
      pickupAssignmentMode: assigneeOption === "creator",
      lookWorkTime: Boolean(respectWorkTimes),
      appomnentOverlap: Boolean(respectExistingAppointments),
      shipping_addresses_for_kv: pickupLocations,
    };
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const res = await createAuftragszettel(buildPayload());
      if (res?.success) return;
      throw new Error(res?.message || "Update failed");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || error?.message || "Fehler beim Speichern."
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Hydrate from API on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        setIsLoading(true);
        const res = await getAuftragszettel();
        const data = res?.data;
        if (res?.success && data) {
          // Parse shipping_addresses_for_kv — may be array, JSON string, or plain string
          let parsedLocations: PickupAddress[] = [];
          const raw = data.shipping_addresses_for_kv;
          if (Array.isArray(raw)) {
            parsedLocations = raw
              .map((item: any) =>
                typeof item === "string"
                  ? { address: item }
                  : { address: String(item?.address ?? "") }
              )
              .filter((loc) => loc.address.trim());
          } else if (typeof raw === "string" && raw.trim()) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsedLocations = parsed
                  .map((item: any) =>
                    typeof item === "string"
                      ? { address: item }
                      : { address: String(item?.address ?? "") }
                  )
                  .filter((loc) => loc.address.trim());
              } else {
                parsedLocations = [{ address: raw }];
              }
            } catch {
              parsedLocations = [{ address: raw }];
            }
          }

          const loaded: HydratedValues = {
            isEnabled: Boolean(data.isInsolePickupDateLine),
            processingDays:
              data.insolePickupDateLine != null
                ? String(data.insolePickupDateLine)
                : "0",
            autoCreateEnabled: Boolean(data.order_creation_appomnent),
            assigneeOption: Boolean(data.pickupAssignmentMode)
              ? "creator"
              : "fixed-per-location",
            respectWorkTimes: Boolean(data.lookWorkTime),
            respectExistingAppointments: Boolean(data.appomnentOverlap),
            pickupLocations: parsedLocations,
          };

          // Store loaded values BEFORE applying them to state so the
          // auto-save effect can detect that nothing has actually changed.
          hydratedValuesRef.current = loaded;

          setIsEnabled(loaded.isEnabled);
          setProcessingDays(loaded.processingDays);
          setAutoCreateEnabled(loaded.autoCreateEnabled);
          setAssigneeOption(loaded.assigneeOption);
          setRespectWorkTimes(loaded.respectWorkTimes);
          setRespectExistingAppointments(loaded.respectExistingAppointments);
          setPickupLocations(loaded.pickupLocations);
        }
      } catch (error) {
        console.error(error);
        toast.error("Fehler beim Laden der Einstellungen.");
      } finally {
        setIsLoading(false);
      }
    };

    void hydrate();
  }, []);

  // Debounced auto-save — only runs when the user actually changes a value.
  // If current state matches what was just loaded from the API, skip saving.
  useEffect(() => {
    if (isLoading) return;

    const h = hydratedValuesRef.current;
    if (h) {
      const unchanged =
        isEnabled === h.isEnabled &&
        processingDays === h.processingDays &&
        autoCreateEnabled === h.autoCreateEnabled &&
        assigneeOption === h.assigneeOption &&
        respectWorkTimes === h.respectWorkTimes &&
        respectExistingAppointments === h.respectExistingAppointments &&
        JSON.stringify(pickupLocations) === JSON.stringify(h.pickupLocations);

      if (unchanged) return;

      // A real user change happened — clear the guard so future changes save normally.
      hydratedValuesRef.current = null;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveSettings();
        toast.success("Einstellungen gespeichert.");
      } catch {
        // toast handled in saveSettings
      }
    }, 700);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEnabled,
    processingDays,
    autoCreateEnabled,
    assigneeOption,
    respectWorkTimes,
    respectExistingAppointments,
    pickupLocations,
    isLoading,
  ]);

  return (
    <div className="w-full px-5 py-6 space-y-6 mb-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Abholung &amp; Terminplanung
        </h1>
        <p className="text-sm text-gray-600">
          Lege fest, ob und wie Abholtermine automatisch berechnet und im
          Kalender geplant werden.
        </p>
      </div>

      {/* Abholtermin berechnen */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Abholtermin berechnen
              </h2>
              <p className="text-xs text-gray-500">
                Automatische Berechnung des Abholdatums
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              className="cursor-pointer"
              disabled={isLoading}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="space-y-2 max-w-md">
            <Label className="text-sm font-medium text-gray-700">
              Berechnungsbasis
            </Label>
            <Select
              value={calculationBase}
              onValueChange={(value) =>
                setCalculationBase(value as "fixed-processing-time")
              }
              disabled={!isEnabled || isLoading}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed-processing-time">
                  Fixe Bearbeitungsdauer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-w-xs">
            <Label className="text-sm font-medium text-gray-700">
              Bearbeitungsdauer (Tage)
            </Label>
            <Input
              type="number"
              min={0}
              value={processingDays}
              onChange={(e) => setProcessingDays(e.target.value)}
              disabled={!isEnabled || isLoading}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Termin automatisch erstellen */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Termin automatisch erstellen
              </h2>
              <p className="text-xs text-gray-500">
                Kalendereintrag bei Auftragsanlage
              </p>
            </div>
          </div>

          <Switch
            checked={autoCreateEnabled}
            onCheckedChange={setAutoCreateEnabled}
            className="cursor-pointer"
            disabled={isLoading}
          />
        </CardHeader>
        <CardContent className="pt-1">
          <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-4 py-3">
            Es wird nur das Datum berechnet – kein Kalendereintrag.
          </p>
        </CardContent>
      </Card>

      {/* Mitarbeiter-Zuweisung */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Mitarbeiter-Zuweisung
              </h2>
              <p className="text-xs text-gray-500">
                Wer übernimmt die Abholung?
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
              <Checkbox
                checked={assigneeOption === "creator"}
                onChange={() => setAssigneeOption("creator")}
                disabled={isLoading}
              />
              <span>Auftragsersteller übernimmt Abholung</span>
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
              <Checkbox
                checked={assigneeOption === "fixed-per-location"}
                onChange={() => setAssigneeOption("fixed-per-location")}
                disabled={isLoading}
              />
              <span>Fester Mitarbeiter pro Standort</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Kalender-Regeln */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Kalender-Regeln
              </h2>
              <p className="text-xs text-gray-500">
                Konflikte und Verfügbarkeit
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
              <Checkbox
                checked={respectWorkTimes}
                onChange={(event) =>
                  setRespectWorkTimes(event.target.checked)
                }
                disabled={isLoading}
              />
              <span>Arbeitszeiten berücksichtigen</span>
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
              <Checkbox
                checked={respectExistingAppointments}
                onChange={(event) =>
                  setRespectExistingAppointments(event.target.checked)
                }
                disabled={isLoading}
              />
              <span>Bestehende Termine berücksichtigen</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Kalenderquelle
            </Label>
            <Select
              value={calendarSource}
              onValueChange={(value) => setCalendarSource(value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Kalender wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">Partner-Kalender</SelectItem>
                <SelectItem value="intern">Interner Kalender</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <span className="mr-2 font-semibold">!</span>
            Wenn keine Slots verfügbar sind, wird der Termin nicht erstellt und
            der Auftrag bleibt „Abholung offen“.
          </div>
        </CardContent>
      </Card>

      {/* Automatische Zuweisung für Kassenverordnung (KV) */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Automatische Zuweisung für Kassenverordnung (KV)
              </h2>
              <p className="text-xs text-gray-500">
                Die Software erstellt abhängig von dieser Einstellung
                automatisch passende Aufgaben und weist sie dem entsprechenden
                Mitarbeiter oder Team zu.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-1 space-y-4">
          {/* Option 1: Fester Mitarbeiter */}
          <div className="rounded-xl border px-4 py-3 bg-white">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={kvAssignmentMode === "fixed-employee"}
                onChange={() => setKvAssignmentMode("fixed-employee")}
                className="mt-1"
                disabled={isLoading}
              />
              <div className="space-y-2 w-full">
                <div className="text-sm font-medium text-gray-900">
                  Fester Mitarbeiter für KV-Erstellungen
                </div>
                <p className="text-xs text-gray-500">
                  Alle KV-Aufträge werden automatisch einem festgelegten
                  Mitarbeiter zugewiesen.
                </p>
                <Select
                  value={kvEmployee}
                  onValueChange={(value) => {
                    setKvAssignmentMode("fixed-employee");
                    setKvEmployee(value);
                  }}
                  disabled={kvAssignmentMode !== "fixed-employee"}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mitarbeiter-1">Mitarbeiter 1</SelectItem>
                    <SelectItem value="mitarbeiter-2">Mitarbeiter 2</SelectItem>
                    <SelectItem value="team-kv">Team KV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </label>
          </div>

          {/* Option 2: Auftragsersteller */}
          <div className="rounded-xl border px-4 py-3 bg-white">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={kvAssignmentMode === "creator"}
                onChange={() => setKvAssignmentMode("creator")}
                className="mt-1"
                disabled={isLoading}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Auftragsersteller erhält den KV-Auftrag
                </div>
                <p className="text-xs text-gray-500">
                  Der Mitarbeiter, der den Auftrag erstellt hat, ist
                  automatisch für die KV-Erstellung verantwortlich.
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Abholort / Standortsuche */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Abholorte
              </h2>
              <p className="text-xs text-gray-500">
                Mehrere Abhol-Standorte hinzufügen
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-1 space-y-4">
          {/* Input row */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs font-medium text-gray-600">
                Neue Adresse
              </Label>
              <WohnortInput
                value={newAddress}
                onChange={setNewAddress}
                hideLabel
                placeholder="Abhol-Standort suchen (Straße, PLZ, Stadt, Land)"
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!newAddress.trim() || isLoading}
              onClick={() => {
                const trimmed = newAddress.trim();
                if (!trimmed) return;
                setPickupLocations((prev) => [...prev, { address: trimmed }]);
                setNewAddress("");
              }}
              className="h-9 shrink-0 bg-[#61A07B] hover:bg-[#4e8d6a] text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          </div>

          {/* List of added locations */}
          {pickupLocations.length > 0 && (
            <ul className="flex flex-col gap-2">
              {pickupLocations.map((loc, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-800 break-all">
                    {loc.address}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPickupLocations((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    aria-label="Adresse entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {pickupLocations.length === 0 && !isLoading && (
            <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">
              Noch keine Abholorte hinzugefügt.
            </p>
          )}

         

      
          {(isLoading || isSaving) && (
            <p className="text-xs text-gray-500">
              {isLoading ? "Lade Einstellungen..." : "Speichere..."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}