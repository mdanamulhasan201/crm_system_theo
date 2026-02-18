declare module 'canvasjs-react-charts' {
    import type { ComponentType } from 'react'
    export const CanvasJSChart: ComponentType<{
      options: Record<string, unknown>
      containerProps?: { style?: Record<string, string | number> }
    }>
  }
  