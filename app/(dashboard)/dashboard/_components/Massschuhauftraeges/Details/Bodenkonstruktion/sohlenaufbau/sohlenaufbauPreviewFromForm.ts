import type { SohlenaufbauData } from "../FormFields"
import type { SohlenaufbauPreviewData } from "./SolePreview3D"
import { parseSohlenaufbauNum } from "./utils"

/** Same logic as `SohlenaufbauConfigCard` preview `useMemo` — single source for 3D + export. */
export function getSohlenaufbauPreviewDataFromForm(value: SohlenaufbauData): SohlenaufbauPreviewData {
  const primary = value.links
  const ferse = parseSohlenaufbauNum(primary.ferse)
  const ballen = parseSohlenaufbauNum(primary.ballen)
  const zwischensohle = ballen
  const absatz = Math.max(0, ferse - ballen)

  const zwLayers =
    value.zwSplit.mode === "einteilig"
      ? [{ height: zwischensohle, color: value.zwFarbe }]
      : value.zwSplit.layers.map((v, i) => ({
          height: parseSohlenaufbauNum(v),
          color:
            value.farbModus === "individuell" ? value.zwLayerFarben[i] || "#1a1a1a" : value.zwFarbe,
        }))

  const abLayers =
    value.abSplit.mode === "einteilig"
      ? [{ height: absatz, color: value.abFarbe }]
      : value.abSplit.layers.map((v, i) => ({
          height: parseSohlenaufbauNum(v),
          color:
            value.farbModus === "individuell" ? value.abLayerFarben[i] || "#1a1a1a" : value.abFarbe,
        }))

  return {
    zwLayers,
    abLayers,
    ballenHeight: ballen,
    ferseHeight: ferse,
    absatzform: "keilabsatz",
  }
}

export function canExportSohlenaufbau3d(value: SohlenaufbauData): boolean {
  const ferse = parseSohlenaufbauNum(value.links.ferse)
  const ballen = parseSohlenaufbauNum(value.links.ballen)
  if (ferse < ballen) return false
  const zw = ballen
  const ab = Math.max(0, ferse - ballen)
  return zw > 0 || ab > 0
}
