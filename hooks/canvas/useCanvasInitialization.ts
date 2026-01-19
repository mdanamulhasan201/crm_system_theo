import { useRef, useCallback, useEffect, RefObject } from 'react'
import { DrawingSettings } from './useCanvasDrawing'

export interface UseCanvasInitializationProps {
    canvasRef: RefObject<HTMLCanvasElement | null>
    containerRef: RefObject<HTMLDivElement | null>
    ctxRef: RefObject<CanvasRenderingContext2D | null>
    imageUrl: string
    settings: DrawingSettings
    applyDrawingSettings: (ctx: CanvasRenderingContext2D) => void
}

export function useCanvasInitialization({
    canvasRef,
    containerRef,
    ctxRef,
    imageUrl,
    settings,
    applyDrawingSettings
}: UseCanvasInitializationProps) {
    const imageUrlRef = useRef<string | null>(null)
    const isInitializedRef = useRef(false)

    // Initialize canvas when image loads
    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        
        if (!canvas || !container || !imageUrl) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Check if image URL changed - if so, reset initialization flag
        if (imageUrlRef.current !== imageUrl) {
            isInitializedRef.current = false
            imageUrlRef.current = imageUrl
        }

        const setCanvasSize = () => {
            const displayedImg = container.querySelector('img')
            if (!displayedImg) return false

            const displayedWidth = displayedImg.offsetWidth || displayedImg.clientWidth
            const displayedHeight = displayedImg.offsetHeight || displayedImg.clientHeight

            if (displayedWidth === 0 || displayedHeight === 0) return false

            // Check if this is first initialization (canvas not yet sized)
            const isFirstInit = !isInitializedRef.current || canvas.width === 0 || canvas.height === 0
            
            // Save existing canvas content before resizing (resizing clears canvas automatically)
            let imageData: ImageData | null = null
            if (!isFirstInit && canvas.width > 0 && canvas.height > 0) {
                try {
                    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                } catch (e) {
                    // Canvas might be tainted, ignore
                }
            }
            
            // Set canvas size (this will clear canvas if dimensions change)
            canvas.width = displayedWidth
            canvas.height = displayedHeight
            canvas.style.width = '100%'
            canvas.style.height = '100%'

            // Restore canvas content if we had saved it (preserve drawings when switching modes)
            if (imageData && imageData.width > 0 && imageData.height > 0) {
                try {
                    ctx.putImageData(imageData, 0, 0)
                } catch (e) {
                    // Canvas might be tainted, ignore
                }
            }

            applyDrawingSettings(ctx)
            
            // Only clear canvas on first initialization, not when switching drawing modes
            if (isFirstInit) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                isInitializedRef.current = true
            }
            
            ctxRef.current = ctx
            return true
        }

        if (setCanvasSize()) return

        const displayedImg = container.querySelector('img')
        if (displayedImg) {
            const handleImageReady = () => {
                let attempts = 0
                const maxAttempts = 10
                const checkSize = () => {
                    attempts++
                    if (setCanvasSize() || attempts >= maxAttempts) return
                    setTimeout(checkSize, 50)
                }
                setTimeout(checkSize, 50)
            }

            if (displayedImg.complete && displayedImg.naturalWidth > 0) {
                handleImageReady()
            } else {
                displayedImg.addEventListener('load', handleImageReady, { once: true })
            }
        }
    }, [canvasRef, containerRef, ctxRef, imageUrl, applyDrawingSettings])

    // Update drawing settings when props change (without clearing canvas)
    useEffect(() => {
        const ctx = ctxRef.current
        if (ctx && canvasRef.current && canvasRef.current.width > 0 && canvasRef.current.height > 0) {
            // Only update settings, don't clear or reinitialize
            applyDrawingSettings(ctx)
        }
    }, [ctxRef, applyDrawingSettings, canvasRef])

    // ResizeObserver to handle container size changes
    useEffect(() => {
        const container = containerRef.current
        const canvas = canvasRef.current
        
        if (!container || !canvas) return

        const updateCanvasSize = () => {
            const displayedImg = container.querySelector('img')
            if (!displayedImg) return

            const displayedWidth = displayedImg.offsetWidth || displayedImg.clientWidth
            const displayedHeight = displayedImg.offsetHeight || displayedImg.clientHeight

            if (displayedWidth > 0 && displayedHeight > 0 && 
                (canvas.width !== displayedWidth || canvas.height !== displayedHeight)) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    const imageData = canvas.width > 0 && canvas.height > 0 
                        ? ctx.getImageData(0, 0, canvas.width, canvas.height)
                        : null
                    
                    canvas.width = displayedWidth
                    canvas.height = displayedHeight
                    
                    if (imageData && imageData.width > 0 && imageData.height > 0) {
                        ctx.putImageData(imageData, 0, 0)
                    }
                    
                    applyDrawingSettings(ctx)
                    ctxRef.current = ctx
                }
            }
        }

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                setTimeout(updateCanvasSize, 50)
            })
            resizeObserver.observe(container)
            return () => resizeObserver.disconnect()
        } else {
            const handleResize = () => setTimeout(updateCanvasSize, 50)
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [imageUrl, initializeCanvas, applyDrawingSettings, containerRef, canvasRef, ctxRef])

    return { initializeCanvas, imageUrlRef }
}

