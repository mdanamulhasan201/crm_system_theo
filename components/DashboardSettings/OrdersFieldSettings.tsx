"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getOrdersFieldSettings,
  updateOrdersFieldSettings,
} from "@/apis/setting/basicSettingsApis";
import toast from "react-hot-toast";

const METADATA_KEYS = new Set([
  "id",
  "partnerId",
  "createdAt",
  "updatedAt",
]);

function formatFieldLabel(key: string): string {
  const spaced = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

type OrderRequiredFieldItem = {
  key: string;
  label: string;
  value: boolean;
};

function parseOrderRequiredFieldItem(item: unknown): OrderRequiredFieldItem | null {
  if (!isRecord(item)) return null;
  const key = item.key;
  const label = item.label;
  const value = item.value;
  if (typeof key !== "string" || !key.trim()) return null;
  if (typeof label !== "string" || !label.trim()) return null;
  if (typeof value !== "boolean") return null;
  return {
    key: key.trim(),
    label: label.trim(),
    value,
  };
}

/** Pull boolean toggles from API `data` in key order; skip metadata keys. */
function booleansFromDataObject(data: Record<string, unknown>): {
  keys: string[];
  values: Record<string, boolean>;
  labels: Record<string, string>;
} {
  const keys: string[] = [];
  const values: Record<string, boolean> = {};
  const labels: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (METADATA_KEYS.has(k)) continue;
    if (typeof v === "boolean") {
      keys.push(k);
      values[k] = v;
      labels[k] = formatFieldLabel(k);
    }
  }
  return { keys, values, labels };
}

function booleansFromDataArray(data: unknown[]): {
  keys: string[];
  values: Record<string, boolean>;
  labels: Record<string, string>;
} {
  const keys: string[] = [];
  const values: Record<string, boolean> = {};
  const labels: Record<string, string> = {};

  for (const rawItem of data) {
    const item = parseOrderRequiredFieldItem(rawItem);
    if (!item) continue;
    if (keys.includes(item.key)) continue;
    keys.push(item.key);
    values[item.key] = item.value;
    labels[item.key] = item.label;
  }

  return { keys, values, labels };
}

function messageFromUnknownBody(body: unknown): string | null {
  if (!isRecord(body)) return null;
  const m = body.message;
  return typeof m === "string" && m.trim() ? m.trim() : null;
}

function parseLoadResult(body: unknown): {
  ok: true;
  keys: string[];
  values: Record<string, boolean>;
  labels: Record<string, string>;
} | {
  ok: false;
  message: string;
} {
  if (!isRecord(body)) {
    return { ok: false, message: "Ungültige Serverantwort." };
  }

  const msg = messageFromUnknownBody(body);
  const success = body.success;

  if (success === false) {
    return { ok: false, message: msg ?? "Daten konnten nicht geladen werden." };
  }

  const data = body.data;
  if (!isRecord(data) && !Array.isArray(data)) {
    if (msg) return { ok: false, message: msg };
    return { ok: false, message: "Keine Einstellungen in der Antwort (data fehlt)." };
  }

  const { keys, values, labels } = Array.isArray(data)
    ? booleansFromDataArray(data)
    : booleansFromDataObject(data);

  if (keys.length === 0) {
    return {
      ok: false,
      message: msg ?? "Keine schaltbaren Felder in der Antwort.",
    };
  }

  if (success === true || success === undefined) {
    return { ok: true, keys, values, labels };
  }

  return {
    ok: false,
    message: msg ?? "Antwort ohne gültige Erfolgskennung.",
  };
}

function axiosErrorMessage(error: unknown): string | null {
  const err = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const body = err.response?.data;
  const fromBody = messageFromUnknownBody(body);
  if (fromBody) return fromBody;
  const status = err.response?.status;
  if (typeof status === "number") return `Anfrage fehlgeschlagen (HTTP ${status}).`;
  if (typeof err.message === "string" && err.message) return err.message;
  return null;
}

export default function OrdersFieldSettings() {
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [fieldKeys, setFieldKeys] = useState<string[]>([]);
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<Record<string, boolean>>({});
  const [baseline, setBaseline] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoadStatus("loading");
    setLoadErrorMessage(null);
    try {
      const body = await getOrdersFieldSettings();
      const parsed = parseLoadResult(body);

      if (!parsed.ok) {
        setLoadStatus("error");
        setLoadErrorMessage(parsed.message);
        setFieldKeys([]);
        setFieldLabels({});
        setFields({});
        setBaseline({});
        toast.error(parsed.message);
        return;
      }

      setFieldKeys(parsed.keys);
      setFieldLabels(parsed.labels);
      setFields(parsed.values);
      setBaseline({ ...parsed.values });
      setLoadStatus("ready");
    } catch (error) {
      const msg =
        axiosErrorMessage(error) ?? "Auftragsfelder konnten nicht geladen werden.";
      console.error("Fehler beim Laden der Auftragsfelder:", error);
      setLoadStatus("error");
      setLoadErrorMessage(msg);
      setFieldKeys([]);
      setFieldLabels({});
      setFields({});
      setBaseline({});
      toast.error(msg);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setHasChanges(JSON.stringify(fields) !== JSON.stringify(baseline));
  }, [fields, baseline]);

  const handleSwitch = (key: string, checked: boolean) => {
    setFields((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSave = async () => {
    if (loadStatus !== "ready") return;
    try {
      setIsSaving(true);
      const response = await updateOrdersFieldSettings({ ...fields });
      if (response?.success) {
        setBaseline({ ...fields });
        setHasChanges(false);
        const msg =
          typeof response?.message === "string" && response.message.trim()
            ? response.message.trim()
            : "Einstellungen gespeichert.";
        toast.success(msg);
      } else {
        const errMsg =
          typeof response?.message === "string" && response.message.trim()
            ? response.message.trim()
            : "Speichern fehlgeschlagen.";
        toast.error(errMsg);
      }
    } catch (error) {
      const msg = axiosErrorMessage(error);
      console.error("Fehler beim Speichern der Auftragsfelder:", error);
      toast.error(msg ?? "Fehler beim Speichern der Auftragsfelder.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-10 rounded-lg border bg-white p-4 shadow-sm">
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold">
          Bestellung 
        </h1>
        <p className="mb-4 mt-2 text-base font-semibold">Pflichtfelder für Aufträge</p>

        {loadStatus === "loading" ? (
          <p className="text-muted-foreground text-sm">Laden…</p>
        ) : loadStatus === "error" ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="text-destructive font-medium">{loadErrorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void fetchSettings()}
            >
              Erneut laden
            </Button>
          </div>
        ) : (
          <div className="ml-0 space-y-4 sm:ml-2">
            {fieldKeys.map((key) => (
              <div
                key={key}
                className="flex flex-row items-center justify-between gap-4 rounded-md border border-transparent py-1 pr-1 sm:pr-2"
              >
                <Label
                  htmlFor={`order-field-${key}`}
                  className="cursor-pointer text-base font-normal"
                >
                  {fieldLabels[key] ?? formatFieldLabel(key)}
                </Label>
                <Switch
                  id={`order-field-${key}`}
                  checked={Boolean(fields[key])}
                  onCheckedChange={(checked) => handleSwitch(key, checked)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={loadStatus !== "ready" || !hasChanges || isSaving}
        >
          {isSaving ? "Speichern…" : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
