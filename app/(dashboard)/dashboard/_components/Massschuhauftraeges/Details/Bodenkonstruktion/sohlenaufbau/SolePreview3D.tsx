"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"
import { createSoleShape, heelShapeForForm, SOLE_PREVIEW_SCALE } from "./solePreviewShapes"

export interface SohlenaufbauPreviewLayer {
  height: number
  color: string
}

export interface SohlenaufbauPreviewData {
  zwLayers: SohlenaufbauPreviewLayer[]
  abLayers: SohlenaufbauPreviewLayer[]
  ballenHeight: number
  ferseHeight: number
  absatzform?: string
}

function SoleLayer({
  shape,
  height,
  yOffset,
  color,
}: {
  shape: THREE.Shape
  height: number
  yOffset: number
  color: string
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [shape, height])

  return (
    <mesh geometry={geometry} position={[0, yOffset, 0]}>
      {/* key ensures Farbkonzept-Updates zuverlässig im Canvas ankommen */}
      <meshStandardMaterial key={color} color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  )
}

export default function SolePreview3D({ data }: { data: SohlenaufbauPreviewData }) {
  const soleShape = useMemo(() => createSoleShape(), [])
  const heelShape = useMemo(() => heelShapeForForm(data.absatzform), [data.absatzform])

  const layers = useMemo(() => {
    const result: { shape: THREE.Shape; height: number; yOffset: number; color: string }[] = []
    let y = 0

    for (const layer of data.zwLayers) {
      if (layer.height <= 0) continue
      const h = layer.height * SOLE_PREVIEW_SCALE
      result.push({ shape: soleShape, height: h, yOffset: y, color: layer.color })
      y += h
    }

    for (const layer of data.abLayers) {
      if (layer.height <= 0) continue
      const h = layer.height * SOLE_PREVIEW_SCALE
      result.push({ shape: heelShape, height: h, yOffset: y, color: layer.color })
      y += h
    }

    return result
  }, [data, soleShape, heelShape])

  const totalHeight = layers.reduce((s, l) => s + l.height, 0)

  return (
    <Canvas
      className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
      camera={{ position: [4, 3, 4], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop="always"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <group position={[0, -totalHeight / 2, 0]}>
        {layers.map((l, i) => (
          <SoleLayer
            key={`${i}-${l.height}-${l.color}`}
            shape={l.shape}
            height={l.height}
            yOffset={l.yOffset}
            color={l.color}
          />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.035}
        rotateSpeed={0.6}
        zoomSpeed={0.55}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI - 0.35}
        autoRotate
        autoRotateSpeed={0.65}
      />
    </Canvas>
  )
}
