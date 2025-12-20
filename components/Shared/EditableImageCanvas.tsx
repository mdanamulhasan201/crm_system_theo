'use client'
import { useState, useRef, useEffect } from 'react'
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
}

export default function EditableImageCanvas({
    imageUrl,
    alt,
    title,
    onDownload,
    downloadFileName = 'edited_image',
    drawingMode,
    brushSize,
    brushColor
}: EditableImageCanvasProps) {
    
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const isDrawingRef = useRef(false)
    const imageUrlRef = useRef<string | null>(null)

    // Initialize canvas when image loads
    const initializeCanvas = () => {
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
    }

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

    // Download edited image
    const downloadEditedImage = async () => {
        const canvas = canvasRef.current
        const imageUrl = imageUrlRef.current
        
        if (!canvas || !imageUrl) {
            alert('Image not available for download.')
            return
        }

        try {
            const combinedCanvas = document.createElement('canvas')
            const ctx = combinedCanvas.getContext('2d')
            if (!ctx) {
                alert('Failed to create canvas context.')
                return
            }

            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
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
                img.onerror = reject
                img.src = imageUrl
            })

            combinedCanvas.toBlob((blob) => {
                if (!blob) {
                    alert('Failed to generate image.')
                    return
                }

                const url = URL.createObjectURL(blob)
                const dataUrl = combinedCanvas.toDataURL('image/png')
                
                // Call onDownload callback if provided
                if (onDownload) {
                    onDownload(dataUrl)
                }

                const a = document.createElement('a')
                a.href = url
                a.download = `${downloadFileName}.png`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }, 'image/png')
        } catch (error) {
            console.error('Error downloading image:', error)
            alert('Failed to download image.')
        }
    }

    // Re-initialize when image URL changes
    useEffect(() => {
        if (imageUrl) {
            setTimeout(() => initializeCanvas(), 200)
        }
    }, [imageUrl])

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
        <div className="text-center w-full lg:w-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-700">{title}</h3>
                <button
                    onClick={clearCanvas}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors flex items-center gap-1"
                    title="Clear drawings"
                >
                    <FaTrash />
                    Clear
                </button>
                <button
                    onClick={downloadEditedImage}
                    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-1"
                    title="Download edited image"
                >
                    <TfiDownload />
                    Download
                </button>
            </div>
            <div ref={imageContainerRef} className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto relative">
                {imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt={alt}
                            width={400}
                            height={600}
                            className="w-full h-auto rounded-lg"
                            onLoad={() => {
                                setTimeout(() => initializeCanvas(), 100)
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full rounded-lg cursor-crosshair pointer-events-auto"
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
                    </>
                ) : (
                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm md:text-base">
                        No image available
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
        <div className="flex flex-wrap justify-center items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <button
                onClick={onExitZoom}
                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                title="Exit zoom mode"
            >
                <span>✕</span>
                <span className="hidden sm:inline">Exit Zoom</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button
                onClick={() => setDrawingMode('pen')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                    drawingMode === 'pen' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
                title="Pen tool"
            >
                <FaPen />
                <span className="hidden sm:inline">Pen</span>
            </button>
            
            <button
                onClick={() => setDrawingMode('eraser')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                    drawingMode === 'eraser' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
                title="Eraser tool"
            >
                <FaEraser />
                <span className="hidden sm:inline">Eraser</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Size:</label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20"
                />
                <span className="text-sm text-gray-600 w-6">{brushSize}</span>
            </div>
            
            {drawingMode === 'pen' && (
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Color:</label>
                    <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                </div>
            )}
        </div>
    )
}

