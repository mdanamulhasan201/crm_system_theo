/**
 * Partner "order required fields" from GET /v2/order-required-fields/get
 * Used by Einlagen scanning flow and settings UI.
 */

export const ORDER_REQUIRED_FIELD_KEYS = [
  "ausführliche_diagnose",
  "versorgung_laut_arzt",
  "positionsnummer",
  "diagnosisList",
  "employeeId",
  "kva",
  "halbprobe",
  "einlagentyp",
  "überzug",
  "quantity",
  "schuhmodell_wählen",
  "versorgung_note",
  /** Standardversorgung (Versorgung konfigurieren → Standard-Vorlage) */
  "versorgung",
] as const;

export type OrderRequiredFieldKey = (typeof ORDER_REQUIRED_FIELD_KEYS)[number];

/** If GET fails or payload is invalid, keep previous product behavior (strict). */
export const FALLBACK_ORDER_REQUIRED_FIELDS: Record<OrderRequiredFieldKey, boolean> = {
  ausführliche_diagnose: true,
  versorgung_laut_arzt: false,
  positionsnummer: true,
  diagnosisList: false,
  employeeId: true,
  kva: false,
  halbprobe: false,
  einlagentyp: true,
  überzug: true,
  quantity: true,
  schuhmodell_wählen: false,
  versorgung_note: false,
  versorgung: true,
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Parse API body; returns null if unusable (caller should use FALLBACK_ORDER_REQUIRED_FIELDS).
 * Unknown / missing keys default to false (not required); only explicit booleans from `data` apply.
 */
export function parseOrderRequiredFieldsFromApiBody(body: unknown): Record<OrderRequiredFieldKey, boolean> | null {
  if (!isRecord(body) || body.success !== true) return null;
  const data = body.data;
  if (!isRecord(data)) return null;

  const out: Record<OrderRequiredFieldKey, boolean> = {
    ausführliche_diagnose: false,
    versorgung_laut_arzt: false,
    positionsnummer: false,
    diagnosisList: false,
    employeeId: false,
    kva: false,
    halbprobe: false,
    einlagentyp: false,
    überzug: false,
    quantity: false,
    schuhmodell_wählen: false,
    versorgung_note: false,
    versorgung: false,
  };

  let anyBoolean = false;
  for (const key of ORDER_REQUIRED_FIELD_KEYS) {
    if (key in data && typeof data[key] === "boolean") {
      out[key] = data[key] as boolean;
      anyBoolean = true;
    }
  }

  if (!anyBoolean) return null;
  return out;
}
