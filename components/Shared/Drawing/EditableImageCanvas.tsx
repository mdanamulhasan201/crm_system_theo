'use client'
import { useRef, useEffect } from 'react'
import { FaTrash } from 'react-icons/fa'
import { TfiDownload } from 'react-icons/tfi'
import { useCanvasDrawing } from '@/hooks/canvas/useCanvasDrawing'
import { useImageBlob } from '@/hooks/canvas/useImageBlob'
import { useCanvasInitialization } from '@/hooks/canvas/useCanvasInitialization'
import ImageDisplay from './ImageDisplay'
import DrawingToolbar from './DrawingToolbar'

export { DrawingToolbar }

interface EditableImageCanvasProps {
    imageUrl: string
    alt: string
    title: string
    onDownload?: (imageDataUrl: string) => void
    downloadFileName?: string
    drawingMode: 'pen' | 'eraser'
    brushSize: number
    brushColor: string
    isZoomMode?: boolean
    onImageDataReady?: (getImageData: () => Promise<Blob | null>) => void
}

export default function EditableImageCanvas({
    imageUrl,
    alt,
    title,
    onDownload,
    downloadFileName = 'edited_image',
    drawingMode,
    brushSize,
    brushColor,
    isZoomMode = false,
    onImageDataReady
}: EditableImageCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

    // Drawing settings
    const settings = {
        brushSize,
        brushColor,
        drawingMode
    }

    // Initialize canvas - need to create a wrapper since applyDrawingSettings comes from useCanvasDrawing
    // We'll use a ref to store the function and update it
    const applyDrawingSettingsRef = useRef<((ctx: CanvasRenderingContext2D) => void) | null>(null)
    
    const { initializeCanvas, imageUrlRef } = useCanvasInitialization({
        canvasRef,
        containerRef: imageContainerRef,
        ctxRef,
        imageUrl,
        settings,
        applyDrawingSettings: (ctx) => {
            applyDrawingSettingsRef.current?.(ctx)
        }
    })

    // Drawing functionality
    const {
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        applyDrawingSettings,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    } = useCanvasDrawing({
        canvasRef,
        containerRef: imageContainerRef,
        ctxRef,
        settings,
        onInitialize: initializeCanvas
    })

    // Store applyDrawingSettings in ref so initialization hook can use it
    useEffect(() => {
        applyDrawingSettingsRef.current = applyDrawingSettings
    }, [applyDrawingSettings])

    // Update canvas initialization ONLY when image URL changes (not when drawing mode changes)
    useEffect(() => {
        if (imageUrl) {
            setTimeout(() => initializeCanvas(), 200)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUrl]) // Only depend on imageUrl, not initializeCanvas or drawingMode

    // Image blob generation
    const { getEditedImageBlob } = useImageBlob({
        canvasRef,
        containerRef: imageContainerRef,
        imageUrlRef
    })

    // Expose getEditedImageBlob to parent component
    useEffect(() => {
        if (onImageDataReady) {
            onImageDataReady(getEditedImageBlob)
        }
    }, [onImageDataReady, getEditedImageBlob])

    // Download edited image
    const downloadEditedImage = async () => {
        const blob = await getEditedImageBlob()
        if (!blob) {
            alert('Bild nicht zum Download verfügbar.')
            return
        }

        // Convert blob to data URL for callback
        const reader = new FileReader()
        reader.onloadend = () => {
            const dataUrl = reader.result as string
            if (onDownload) {
                onDownload(dataUrl)
            }
        }
        reader.readAsDataURL(blob)

        // Download the blob
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${downloadFileName}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className={`text-center w-full ${isZoomMode ? '' : 'lg:w-auto'}`}>
            {/* Title and action buttons - hidden in zoom mode */}
            {!isZoomMode && (
                <div className="flex items-center justify-center gap-2 mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700">{title}</h3>
                    <button
                        onClick={clearCanvas}
                        className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
                        title="Zeichnungen löschen"
                    >
                        <FaTrash />
                        <span className="hidden sm:inline">Löschen</span>
                    </button>
                    <button
                        onClick={downloadEditedImage}
                        className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                        title="Bearbeitetes Bild herunterladen"
                    >
                        <TfiDownload />
                        <span className="hidden sm:inline">Herunterladen</span>
                    </button>
                </div>
            )}

            {/* Image container with responsive sizing */}
            <div 
                ref={imageContainerRef} 
                className={`w-full mx-auto relative ${
                    isZoomMode 
                        ? 'max-w-full' 
                        : 'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'
                }`}
            >
                <ImageDisplay
                    imageUrl={imageUrl}
                    alt={alt}
                    isZoomMode={isZoomMode}
                    onLoad={() => setTimeout(() => initializeCanvas(), 100)}
                />
                
                {/* Canvas overlay for drawing */}
                <canvas
                    ref={canvasRef}
                    className={`absolute top-0 left-0 w-full h-full ${
                        isZoomMode ? 'rounded-xl' : 'rounded-lg'
                    } cursor-crosshair pointer-events-auto transition-opacity hover:opacity-90`}
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            </div>
            
            {/* Zoom mode title overlay */}
            {isZoomMode && (
                <div className="mt-3 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">{title}</h3>
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <button
                            onClick={clearCanvas}
                            className="px-4 py-2 cursor-pointer text-sm bg-[#4A8A5F] hover:bg-[#4A8A5F]/80 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                            title="Zeichnungen löschen"
                        >
                            <FaTrash className="text-white" />
                            <span>Löschen</span>
                        </button>
                        <button
                            onClick={downloadEditedImage}
                            className="px-4 py-2 cursor-pointer text-sm bg-[#4A8A5F] hover:bg-[#4A8A5F]/80 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                            title="Bearbeitetes Bild herunterladen"
                        >
                            <TfiDownload />
                            <span>Herunterladen</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

