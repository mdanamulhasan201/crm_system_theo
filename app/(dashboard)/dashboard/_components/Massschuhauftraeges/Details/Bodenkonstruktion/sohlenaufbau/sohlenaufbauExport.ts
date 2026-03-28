import * as THREE from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"
import type { SohlenaufbauPreviewData } from "./SolePreview3D"
import { createSoleShape, heelShapeForForm, SOLE_PREVIEW_SCALE } from "./solePreviewShapes"

function materialForLayerColor(hex: string): THREE.MeshStandardMaterial {
  const c = new THREE.Color()
  try {
    c.set(hex || "#888888")
  } catch {
    c.set("#888888")
  }
  return new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.6,
    metalness: 0.1,
  })
}

/** Same layered meshes as `SolePreview3D`, with per-layer materials (Farbkonzept). */
export function buildSohlenaufbauExportGroup(data: SohlenaufbauPreviewData): THREE.Group | null {
  const soleShape = createSoleShape()
  const heelShape = heelShapeForForm(data.absatzform)

  type Layer = { shape: THREE.Shape; height: number; yOffset: number; color: string }
  const layers: Layer[] = []
  let y = 0

  for (const layer of data.zwLayers) {
    if (layer.height <= 0) continue
    const h = layer.height * SOLE_PREVIEW_SCALE
    layers.push({ shape: soleShape, height: h, yOffset: y, color: layer.color })
    y += h
  }
  for (const layer of data.abLayers) {
    if (layer.height <= 0) continue
    const h = layer.height * SOLE_PREVIEW_SCALE
    layers.push({ shape: heelShape, height: h, yOffset: y, color: layer.color })
    y += h
  }

  if (layers.length === 0) return null

  const totalHeight = layers.reduce((s, l) => s + l.height, 0)
  const group = new THREE.Group()
  group.position.set(0, -totalHeight / 2, 0)

  for (const layer of layers) {
    const geo = new THREE.ExtrudeGeometry(layer.shape, { depth: layer.height, bevelEnabled: false })
    geo.rotateX(-Math.PI / 2)
    const mesh = new THREE.Mesh(geo, materialForLayerColor(layer.color))
    mesh.position.set(0, layer.yOffset, 0)
    group.add(mesh)
  }

  return group
}

/** glTF binary — materials/Farben bleiben erhalten (z. B. Blender). */
export async function buildSohlenaufbauGlbBlob(data: SohlenaufbauPreviewData): Promise<Blob | null> {
  const root = buildSohlenaufbauExportGroup(data)
  if (!root) return null
  const exporter = new GLTFExporter()
  const result = await exporter.parseAsync(root, { binary: true })
  return new Blob([result as ArrayBuffer], { type: "model/gltf-binary" })
}

export async function downloadSohlenaufbauGlb(
  data: SohlenaufbauPreviewData,
  filename = "sohlenaufbau-vorschau.glb"
): Promise<boolean> {
  const blob = await buildSohlenaufbauGlbBlob(data)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}
