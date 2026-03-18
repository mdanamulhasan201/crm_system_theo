"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CalendarClock,
  Users,
  SlidersHorizontal,
  ClipboardList,
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

export default function AbholungTerminplanungPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [calculationBase, setCalculationBase] =
    useState<"fixed-processing-time">("fixed-processing-time");
  const [processingDays, setProcessingDays] = useState<string>("5");
  const [autoCreateEnabled, setAutoCreateEnabled] = useState(false);
  const [assigneeCreator, setAssigneeCreator] = useState(true);
  const [assigneeFixedPerLocation, setAssigneeFixedPerLocation] =
    useState(false);
  const [respectWorkTimes, setRespectWorkTimes] = useState(true);
  const [respectExistingAppointments, setRespectExistingAppointments] =
    useState(true);
  const [calendarSource, setCalendarSource] = useState("partner");
  const [kvAssignmentMode, setKvAssignmentMode] = useState<
    "fixed-employee" | "creator"
  >("fixed-employee");
  const [kvEmployee, setKvEmployee] = useState("");

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
              disabled={!isEnabled}
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
              disabled={!isEnabled}
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
                checked={assigneeCreator}
                onChange={(event) =>
                  setAssigneeCreator(event.target.checked)
                }
              />
              <span>Auftragsersteller übernimmt Abholung</span>
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
              <Checkbox
                checked={assigneeFixedPerLocation}
                onChange={(event) =>
                  setAssigneeFixedPerLocation(event.target.checked)
                }
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
              />
              <span>Arbeitszeiten berücksichtigen</span>
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
              <Checkbox
                checked={respectExistingAppointments}
                onChange={(event) =>
                  setRespectExistingAppointments(event.target.checked)
                }
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
        <CardContent className="pt-1 space-y-3">
          {/* Option 1 */}
          <button
            type="button"
            onClick={() => setKvAssignmentMode("fixed-employee")}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              kvAssignmentMode === "fixed-employee"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                  kvAssignmentMode === "fixed-employee"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {kvAssignmentMode === "fixed-employee" && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <div className="space-y-2 w-full">
                <div className="text-sm font-medium text-gray-900">
                  Fester Mitarbeiter für KV-Erstellungen
                </div>
                <p className="text-xs text-gray-500">
                  Alle KV-Aufträge werden automatisch einem festgelegten
                  Mitarbeiter zugewiesen.
                </p>
                {kvAssignmentMode === "fixed-employee" && (
                  <Input
                    value={kvEmployee}
                    onChange={(e) => setKvEmployee(e.target.value)}
                    placeholder="Mitarbeiter auswählen"
                    className="mt-1"
                  />
                )}
              </div>
            </div>
          </button>

          {/* Option 2 */}
          <button
            type="button"
            onClick={() => setKvAssignmentMode("creator")}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              kvAssignmentMode === "creator"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                  kvAssignmentMode === "creator"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {kvAssignmentMode === "creator" && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Auftragsersteller erhält den KV-Auftrag
                </div>
                <p className="text-xs text-gray-500">
                  Der Mitarbeiter, der den Auftrag erstellt hat, ist
                  automatisch für die KV-Erstellung verantwortlich.
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}