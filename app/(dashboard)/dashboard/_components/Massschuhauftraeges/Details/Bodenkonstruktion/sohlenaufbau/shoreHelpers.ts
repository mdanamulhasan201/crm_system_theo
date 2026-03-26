import type { SohlenaufbauData, SohlenaufbauShoreValue } from "../FormFields"
import { parseSohlenaufbauNum } from "./utils"
import { isSohlenaufbauColorAllowedForShore } from "./shoreColorRules"

export function syncSohlenaufbauShoreLayerLengths(data: SohlenaufbauData): SohlenaufbauData {
  const zwN = data.zwSplit.mode === "einteilig" ? 1 : Math.max(1, data.zwSplit.layers.length)
  const abN = data.abSplit.mode === "einteilig" ? 1 : Math.max(1, data.abSplit.layers.length)
  const zwLayers = [...data.shorePerLayer.zwLayers]
  const abLayers = [...data.shorePerLayer.abLayers]
  while (zwLayers.length < zwN) zwLayers.push("53")
  zwLayers.length = zwN
  while (abLayers.length < abN) abLayers.push("53")
  abLayers.length = abN
  return { ...data, shorePerLayer: { zwLayers, abLayers } }
}

export function getSohlenaufbauShoreForColor(
  data: SohlenaufbauData,
  area: "zw" | "ab",
  layerIdx?: number
): SohlenaufbauShoreValue {
  if (data.shoreModus === "einheitlich") return data.globalShore
  if (layerIdx !== undefined && data.farbModus === "individuell") {
    const arr = area === "zw" ? data.shorePerLayer.zwLayers : data.shorePerLayer.abLayers
    const fallback = area === "zw" ? data.shorePerArea.zwischensohle : data.shorePerArea.absatz
    return arr[layerIdx] ?? fallback
  }
  return area === "zw" ? data.shorePerArea.zwischensohle : data.shorePerArea.absatz
}

export function sanitizeSohlenaufbauColorsForShore(data: SohlenaufbauData): SohlenaufbauData {
  const ferse = parseSohlenaufbauNum(data.links.ferse)
  const ballen = parseSohlenaufbauNum(data.links.ballen)
  const zwischensohle = ballen
  const absatz = Math.max(0, ferse - ballen)
  const next = { ...data }

  const fix = (color: string, shore: SohlenaufbauShoreValue) =>
    isSohlenaufbauColorAllowedForShore(color, shore) ? color : "#1a1a1a"

  if (next.farbModus === "einheitlich") {
    if (zwischensohle > 0) {
      next.zwFarbe = fix(next.zwFarbe, getSohlenaufbauShoreForColor(next, "zw"))
    }
    if (absatz > 0) {
      next.abFarbe = fix(next.abFarbe, getSohlenaufbauShoreForColor(next, "ab"))
    }
  } else {
    if (zwischensohle > 0) {
      const indices = next.zwSplit.mode === "einteilig" ? [0] : next.zwSplit.layers.map((_, i) => i)
      const zf = [...next.zwLayerFarben]
      indices.forEach((idx) => {
        const shore = getSohlenaufbauShoreForColor(next, "zw", idx)
        zf[idx] = fix(zf[idx] || "#1a1a1a", shore)
      })
      next.zwLayerFarben = zf
    }
    if (absatz > 0) {
      const indices = next.abSplit.mode === "einteilig" ? [0] : next.abSplit.layers.map((_, i) => i)
      const af = [...next.abLayerFarben]
      indices.forEach((idx) => {
        const shore = getSohlenaufbauShoreForColor(next, "ab", idx)
        af[idx] = fix(af[idx] || "#1a1a1a", shore)
      })
      next.abLayerFarben = af
    }
  }
  return next
}
