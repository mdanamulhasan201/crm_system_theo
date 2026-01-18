'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FaPen, FaEraser, FaTrash } from 'react-icons/fa'
import { TfiDownload } from 'react-icons/tfi'

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
    const isDrawingRef = useRef(false)
    const imageUrlRef = useRef<string | null>(null)
    const [isImageLoading, setIsImageLoading] = useState(true)

    // Initialize canvas when image loads
    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const container = imageContainerRef.current
        
        if (!canvas || !container || !imageUrl) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        imageUrlRef.current = imageUrl

        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            const displayedImg = container.querySelector('img')
            if (!displayedImg) return

            const displayedWidth = displayedImg.offsetWidth
            const displayedHeight = displayedImg.offsetHeight

            canvas.width = displayedWidth
            canvas.height = displayedHeight

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctxRef.current = ctx
        }
        img.src = imageUrl
    }, [imageUrl])

    // Get coordinates relative to canvas
    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        }
    }

    // Start drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        isDrawingRef.current = true
        const ctx = ctxRef.current
        if (!ctx) return

        const coords = getCanvasCoordinates(e, canvas)
        ctx.beginPath()
        ctx.moveTo(coords.x, coords.y)
    }

    // Draw on canvas
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = ctxRef.current
        if (!ctx) return

        const coords = getCanvasCoordinates(e, canvas)
        
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        if (drawingMode === 'pen') {
            ctx.globalCompositeOperation = 'source-over'
            ctx.strokeStyle = brushColor
        } else {
            ctx.globalCompositeOperation = 'destination-out'
        }
        
        ctx.lineTo(coords.x, coords.y)
        ctx.stroke()
    }

    // Stop drawing
    const stopDrawing = () => {
        isDrawingRef.current = false
    }

    // Clear canvas
    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctxRef.current = ctx
    }

    // Get edited image as blob (for saving) - Fixed CORS issues for production
    const getEditedImageBlob = useCallback(async (): Promise<Blob | null> => {
        const canvas = canvasRef.current
        const container = imageContainerRef.current
        const imageUrl = imageUrlRef.current
        
        if (!canvas || !imageUrl || !container) {
            console.error('Missing canvas, imageUrl, or container')
            return null
        }

        try {
            // Try to use the displayed image element first (already loaded, no CORS issues)
            const displayedImg = container.querySelector('img') as HTMLImageElement
            if (displayedImg && displayedImg.complete && displayedImg.naturalWidth > 0) {
                const combinedCanvas = document.createElement('canvas')
                const ctx = combinedCanvas.getContext('2d')
                if (!ctx) {
                    return null
                }

                // Use the actual image dimensions
                combinedCanvas.width = displayedImg.naturalWidth
                combinedCanvas.height = displayedImg.naturalHeight
                
                // Draw the original image
                ctx.drawImage(displayedImg, 0, 0)
                
                // Draw the canvas overlay (drawings) scaled to match
                if (canvas.width > 0 && canvas.height > 0) {
                    const scaleX = displayedImg.naturalWidth / displayedImg.offsetWidth
                    const scaleY = displayedImg.naturalHeight / displayedImg.offsetHeight
                    ctx.save()
                    ctx.scale(scaleX, scaleY)
                    ctx.drawImage(canvas, 0, 0)
                    ctx.restore()
                }

                return new Promise((resolve) => {
                    combinedCanvas.toBlob((blob) => {
                        resolve(blob)
                    }, 'image/png', 0.95)
                })
            }

            // Fallback: Try fetching image as blob to avoid CORS issues
            try {
                const response = await fetch(imageUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                })
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`)
                }

                const imageBlob = await response.blob()
                const imageObjectUrl = URL.createObjectURL(imageBlob)

                const combinedCanvas = document.createElement('canvas')
                const ctx = combinedCanvas.getContext('2d')
                if (!ctx) {
                    URL.revokeObjectURL(imageObjectUrl)
                    return null
                }

                const img = new window.Image()
                
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Image load timeout'))
                    }, 10000)

                    img.onload = () => {
                        clearTimeout(timeout)
                        combinedCanvas.width = img.width
                        combinedCanvas.height = img.height
                        
                        ctx.drawImage(img, 0, 0)
                        
                        if (canvas.width > 0 && canvas.height > 0) {
                            const scaleX = img.width / canvas.width
                            const scaleY = img.height / canvas.height
                            ctx.save()
                            ctx.scale(scaleX, scaleY)
                            ctx.drawImage(canvas, 0, 0)
                            ctx.restore()
                        }
                        
                        URL.revokeObjectURL(imageObjectUrl)
                        resolve(null)
                    }
                    img.onerror = (err) => {
                        clearTimeout(timeout)
                        URL.revokeObjectURL(imageObjectUrl)
                        reject(err)
                    }
                    img.src = imageObjectUrl
                })

                return new Promise((resolve) => {
                    combinedCanvas.toBlob((blob) => {
                        resolve(blob)
                    }, 'image/png', 0.95)
                })
            } catch (fetchError) {
                console.warn('Fetch method failed, trying direct image load:', fetchError)
                
                // Last resort: Try direct image load with CORS
                const combinedCanvas = document.createElement('canvas')
                const ctx = combinedCanvas.getContext('2d')
                if (!ctx) {
                    return null
                }

                const img = new window.Image()
                img.crossOrigin = 'anonymous'
                
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Image load timeout'))
                    }, 10000)

                    img.onload = () => {
                        clearTimeout(timeout)
                        combinedCanvas.width = img.width
                        combinedCanvas.height = img.height
                        
                        ctx.drawImage(img, 0, 0)
                        
                        if (canvas.width > 0 && canvas.height > 0) {
                            const scaleX = img.width / canvas.width
                            const scaleY = img.height / canvas.height
                            ctx.save()
                            ctx.scale(scaleX, scaleY)
                            ctx.drawImage(canvas, 0, 0)
                            ctx.restore()
                        }
                        
                        resolve(null)
                    }
                    img.onerror = (err) => {
                        clearTimeout(timeout)
                        reject(err)
                    }
                    img.src = imageUrl
                })

                return new Promise((resolve) => {
                    combinedCanvas.toBlob((blob) => {
                        resolve(blob)
                    }, 'image/png', 0.95)
                })
            }
        } catch (error) {
            console.error('Error getting edited image:', error)
            return null
        }
    }, [])

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

    // Expose getEditedImageBlob to parent component
    useEffect(() => {
        if (onImageDataReady) {
            onImageDataReady(getEditedImageBlob)
        }
    }, [onImageDataReady, getEditedImageBlob])

    // Re-initialize when image URL changes
    useEffect(() => {
        if (imageUrl) {
            setIsImageLoading(true)
            setTimeout(() => initializeCanvas(), 200)
        }
    }, [imageUrl, initializeCanvas])

    // Update drawing settings when props change
    useEffect(() => {
        const ctx = ctxRef.current
        if (ctx) {
            ctx.lineWidth = brushSize
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            if (drawingMode === 'pen') {
                ctx.globalCompositeOperation = 'source-over'
                ctx.strokeStyle = brushColor
            } else {
                ctx.globalCompositeOperation = 'destination-out'
            }
        }
    }, [drawingMode, brushSize, brushColor])

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
                {imageUrl ? (
                    <>
                        <div className="relative w-full">
                            {/* Shimmer effect while loading */}
                            {isImageLoading && (
                                <div className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse z-10 ${isZoomMode ? 'rounded-xl' : 'rounded-lg'}`} />
                            )}
                            <Image
                                src={imageUrl}
                                alt={alt}
                                width={isZoomMode ? 800 : 400}
                                height={isZoomMode ? 1200 : 600}
                                className={`w-full h-auto transition-opacity duration-300 ${isZoomMode ? 'rounded-xl shadow-inner' : 'rounded-lg'} bg-gray-50 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                priority={isZoomMode}
                                unoptimized={true}
                                crossOrigin="anonymous"
                                onLoad={() => {
                                    setIsImageLoading(false)
                                    setTimeout(() => initializeCanvas(), 50)
                                }}
                                onError={(e) => {
                                    console.error('Image load error:', e)
                                    setIsImageLoading(false)
                                }}
                            />
                            <canvas
                                ref={canvasRef}
                                className={`absolute top-0 left-0 w-full h-full ${isZoomMode ? 'rounded-xl' : 'rounded-lg'} cursor-crosshair pointer-events-auto transition-opacity hover:opacity-90`}
                                style={{ touchAction: 'none' }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={(e) => {
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
                                }}
                                onTouchMove={(e) => {
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
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault()
                                    stopDrawing()
                                }}
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
                    </>
                ) : (
                    <div className={`w-full bg-gray-100 border-2 border-dashed border-gray-300 ${isZoomMode ? 'rounded-xl h-[600px] lg:h-[800px]' : 'rounded-lg h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]'} flex items-center justify-center text-gray-500 text-sm md:text-base`}>
                        Kein Bild verfügbar
                    </div>
                )}
            </div>
        </div>
    )
}

// Toolbar component for drawing controls
export function DrawingToolbar({
    drawingMode,
    setDrawingMode,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    onExitZoom
}: {
    drawingMode: 'pen' | 'eraser'
    setDrawingMode: (mode: 'pen' | 'eraser') => void
    brushSize: number
    setBrushSize: (size: number) => void
    brushColor: string
    setBrushColor: (color: string) => void
    onExitZoom: () => void
}) {
    return (
        <div className="py-4">
            <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-4">
                {/* Exit Zoom Button */}
                <button
                    onClick={onExitZoom}
                    className="bg-gradient-to-r cursor-pointer from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-2 rounded-lg transition-all flex items-center gap-2 text-sm shadow transform "
                    title="Zoom-Modus beenden"
                >
                    <span className="text-sm">✕</span>
                    <span className="hidden sm:inline">Zoom beenden</span>
                </button>
                
                {/* Divider */}
                <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                
                {/* Drawing Tools */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setDrawingMode('pen')}
                        className={`px-2 py-2 cursor-pointer rounded-md transition-all flex items-center gap-2 text-sm ${
                            drawingMode === 'pen' 
                                ? 'bg-[#4A8A5F]  text-white ' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title="Stiftwerkzeug"
                    >
                        <FaPen />
                        <span className="hidden sm:inline">Stift</span>
                    </button>
                    
                    <button
                        onClick={() => setDrawingMode('eraser')}
                        className={`px-2 py-2 cursor-pointer rounded-md transition-all flex items-center gap-2 text-sm ${
                            drawingMode === 'eraser' 
                                ? 'bg-[#4A8A5F] text-white ' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title="Radiergummi-Werkzeug"
                    >
                        <FaEraser />
                        <span className="hidden sm:inline">Radiergummi</span>
                    </button>
                </div>
                
                {/* Divider */}
                <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                
                {/* Brush Size Control */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Größe:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-24 lg:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 w-8 text-center bg-white px-2 py-1 rounded border border-gray-200">{brushSize}</span>
                </div>
                
                {/* Color Picker - Only show for pen mode */}
                {drawingMode === 'pen' && (
                    <>
                        <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Farbe:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={brushColor}
                                    onChange={(e) => setBrushColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                    title="Pinselfarbe auswählen"
                                />
                                <div 
                                    className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                                    style={{ backgroundColor: brushColor }}
                                    title={`Aktuelle Farbe: ${brushColor}`}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

