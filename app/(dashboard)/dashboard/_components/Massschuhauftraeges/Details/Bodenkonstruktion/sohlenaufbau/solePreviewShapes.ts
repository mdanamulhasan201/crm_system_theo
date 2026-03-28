import * as THREE from "three"

export function createSoleShape() {
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

export function createHeelShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.8, -2)
  shape.bezierCurveTo(-1.2, -1.5, -1.3, -0.5, -1.3, 0)
  shape.lineTo(1.3, 0)
  shape.bezierCurveTo(1.3, -0.5, 1.2, -1.5, 0.8, -2)
  shape.bezierCurveTo(0.4, -2.3, -0.4, -2.3, -0.8, -2)
  return shape
}

export function createStegkeilShape() {
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

export function createAbsatzkeilShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.7, -2)
  shape.bezierCurveTo(-1.0, -1.6, -1.1, -1.2, -1.1, -0.8)
  shape.lineTo(1.1, -0.8)
  shape.bezierCurveTo(1.1, -1.2, 1.0, -1.6, 0.7, -2)
  shape.bezierCurveTo(0.3, -2.2, -0.3, -2.2, -0.7, -2)
  return shape
}

export function heelShapeForForm(form?: string): THREE.Shape {
  switch (form) {
    case "stegkeil":
      return createStegkeilShape()
    case "absatzkeil":
      return createAbsatzkeilShape()
    default:
      return createHeelShape()
  }
}

/** Same scale as `SolePreview3D` — schematic, not 1:1 mm in scene units */
export const SOLE_PREVIEW_SCALE = 0.04
