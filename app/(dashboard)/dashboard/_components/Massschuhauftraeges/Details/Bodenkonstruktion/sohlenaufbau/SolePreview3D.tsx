"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

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

function createSoleShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.8, -2)
  shape.bezierCurveTo(-1.2, -1.5, -1.3, -0.5, -1.3, 0)
  shape.bezierCurveTo(-1.3, 0.8, -1.4, 1.2, -1.5, 1.8)
  shape.bezierCurveTo(-1.5, 2.5, -0.8, 3, 0, 3)
  shape.bezierCurveTo(0.8, 3, 1.5, 2.5, 1.5, 1.8)
  shape.bezierCurveTo(1.4, 1.2, 1.3, 0.8, 1.3, 0)
  shape.bezierCurveTo(1.3, -0.5, 1.2, -1.5, 0.8, -2)
  shape.bezierCurveTo(0.4, -2.3, -0.4, -2.3, -0.8, -2)
  return shape
}

function createHeelShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.8, -2)
  shape.bezierCurveTo(-1.2, -1.5, -1.3, -0.5, -1.3, 0)
  shape.lineTo(1.3, 0)
  shape.bezierCurveTo(1.3, -0.5, 1.2, -1.5, 0.8, -2)
  shape.bezierCurveTo(0.4, -2.3, -0.4, -2.3, -0.8, -2)
  return shape
}

function createStegkeilShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.8, -2)
  shape.bezierCurveTo(-1.2, -1.5, -1.3, -0.8, -1.3, -0.3)
  shape.bezierCurveTo(-1.0, -0.1, -0.6, 0, -0.4, 0)
  shape.lineTo(0.4, 0)
  shape.bezierCurveTo(0.6, 0, 1.0, -0.1, 1.3, -0.3)
  shape.bezierCurveTo(1.3, -0.8, 1.2, -1.5, 0.8, -2)
  shape.bezierCurveTo(0.4, -2.3, -0.4, -2.3, -0.8, -2)
  return shape
}

function createAbsatzkeilShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.7, -2)
  shape.bezierCurveTo(-1.0, -1.6, -1.1, -1.2, -1.1, -0.8)
  shape.lineTo(1.1, -0.8)
  shape.bezierCurveTo(1.1, -1.2, 1.0, -1.6, 0.7, -2)
  shape.bezierCurveTo(0.3, -2.2, -0.3, -2.2, -0.7, -2)
  return shape
}

function heelShapeForForm(form?: string): THREE.Shape {
  switch (form) {
    case "stegkeil":
      return createStegkeilShape()
    case "absatzkeil":
      return createAbsatzkeilShape()
    default:
      return createHeelShape()
  }
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
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  )
}

export default function SolePreview3D({ data }: { data: SohlenaufbauPreviewData }) {
  const soleShape = useMemo(() => createSoleShape(), [])
  const heelShape = useMemo(() => heelShapeForForm(data.absatzform), [data.absatzform])

  const scale = 0.04

  const layers = useMemo(() => {
    const result: { shape: THREE.Shape; height: number; yOffset: number; color: string }[] = []
    let y = 0

    for (const layer of data.zwLayers) {
      if (layer.height <= 0) continue
      const h = layer.height * scale
      result.push({ shape: soleShape, height: h, yOffset: y, color: layer.color })
      y += h
    }

    for (const layer of data.abLayers) {
      if (layer.height <= 0) continue
      const h = layer.height * scale
      result.push({ shape: heelShape, height: h, yOffset: y, color: layer.color })
      y += h
    }

    return result
  }, [data, soleShape, heelShape])

  const totalHeight = layers.reduce((s, l) => s + l.height, 0)

  return (
    <Canvas camera={{ position: [4, 3, 4], fov: 35 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <group position={[0, -totalHeight / 2, 0]}>
        {layers.map((l, i) => (
          <SoleLayer key={i} shape={l.shape} height={l.height} yOffset={l.yOffset} color={l.color} />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  )
}
