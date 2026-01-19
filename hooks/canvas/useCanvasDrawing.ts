import { useRef, useCallback, RefObject } from 'react'

export interface DrawingSettings {
    brushSize: number
    brushColor: string
    drawingMode: 'pen' | 'eraser'
}

export interface UseCanvasDrawingProps {
    canvasRef: RefObject<HTMLCanvasElement | null>
    containerRef: RefObject<HTMLDivElement | null>
    ctxRef: RefObject<CanvasRenderingContext2D | null>
    settings: DrawingSettings
    onInitialize?: () => void
}

export function useCanvasDrawing({
    canvasRef,
    containerRef,
    ctxRef,
    settings,
    onInitialize
}: UseCanvasDrawingProps) {
    const isDrawingRef = useRef(false)

    // Apply drawing settings to context
    const applyDrawingSettings = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.lineWidth = settings.brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalCompositeOperation = settings.drawingMode === 'pen' ? 'source-over' : 'destination-out'
        if (settings.drawingMode === 'pen') {
            ctx.strokeStyle = settings.brushColor
        }
    }, [settings.brushSize, settings.brushColor, settings.drawingMode])

    // Get coordinates relative to canvas
    const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        
        if (canvas.width === 0 || canvas.height === 0 || rect.width === 0 || rect.height === 0) {
            onInitialize?.()
            return { x: 0, y: 0 }
        }
        
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        
        return {
            x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
            y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY))
        }
    }, [onInitialize])

    // Start drawing
    const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            onInitialize?.()
            return
        }

        const ctx = ctxRef.current || canvas.getContext('2d')
        if (!ctx) return
        
        ctxRef.current = ctx
        isDrawingRef.current = true
        applyDrawingSettings(ctx)

        const coords = getCanvasCoordinates(e, canvas)
        ctx.beginPath()
        ctx.moveTo(coords.x, coords.y)
    }, [canvasRef, ctxRef, applyDrawingSettings, getCanvasCoordinates, onInitialize])

    // Draw on canvas
    const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return

        const canvas = canvasRef.current
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            onInitialize?.()
            return
        }

        const ctx = ctxRef.current || canvas.getContext('2d')
        if (!ctx) return

        ctxRef.current = ctx
        applyDrawingSettings(ctx)

        const coords = getCanvasCoordinates(e, canvas)
        ctx.lineTo(coords.x, coords.y)
        ctx.stroke()
    }, [canvasRef, ctxRef, applyDrawingSettings, getCanvasCoordinates, onInitialize])

    // Stop drawing
    const stopDrawing = useCallback(() => {
        isDrawingRef.current = false
    }, [])

    // Clear canvas
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctxRef.current = ctx
    }, [canvasRef, ctxRef])

    // Handle touch events
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        const touch = e.touches[0]
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect && canvasRef.current) {
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            })
            canvasRef.current.dispatchEvent(mouseEvent)
        }
    }, [canvasRef])

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        const touch = e.touches[0]
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect && canvasRef.current) {
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            })
            canvasRef.current.dispatchEvent(mouseEvent)
        }
    }, [canvasRef])

    const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        stopDrawing()
    }, [stopDrawing])

    return {
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        applyDrawingSettings,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    }
}

