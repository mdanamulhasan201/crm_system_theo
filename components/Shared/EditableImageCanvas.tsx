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
    const [useFallbackImage, setUseFallbackImage] = useState(false)
    const [imageLoadError, setImageLoadError] = useState<string | null>(null)

    // Initialize canvas when image loads - Fixed for production timing issues
    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const container = imageContainerRef.current
        
        if (!canvas || !container || !imageUrl) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        imageUrlRef.current = imageUrl

        // Function to set canvas size based on displayed image
        const setCanvasSize = () => {
            const displayedImg = container.querySelector('img')
            if (!displayedImg) return false

            // Wait for image to be fully rendered
            const displayedWidth = displayedImg.offsetWidth || displayedImg.clientWidth
            const displayedHeight = displayedImg.offsetHeight || displayedImg.clientHeight

            // If dimensions are still 0, image isn't ready yet
            if (displayedWidth === 0 || displayedHeight === 0) {
                return false
            }

            // Set canvas size to match displayed image
            canvas.width = displayedWidth
            canvas.height = displayedHeight

            // Set canvas CSS size to match container
            canvas.style.width = '100%'
            canvas.style.height = '100%'

            // Set drawing context properties
            ctx.lineWidth = brushSize
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            if (drawingMode === 'pen') {
                ctx.globalCompositeOperation = 'source-over'
                ctx.strokeStyle = brushColor
            } else {
                ctx.globalCompositeOperation = 'destination-out'
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctxRef.current = ctx
            return true
        }

        // Try to initialize immediately
        if (setCanvasSize()) {
            return
        }

        // If not ready, wait for image load event
        const displayedImg = container.querySelector('img')
        if (displayedImg) {
            // Image element exists, wait for it to load
            const handleImageReady = () => {
                // Use multiple attempts with delays to ensure DOM is ready
                let attempts = 0
                const maxAttempts = 10
                const checkSize = () => {
                    attempts++
                    if (setCanvasSize() || attempts >= maxAttempts) {
                        return
                    }
                    setTimeout(checkSize, 50)
                }
                setTimeout(checkSize, 50)
            }

            if (displayedImg.complete && displayedImg.naturalWidth > 0) {
                // Image already loaded
                handleImageReady()
            } else {
                // Wait for image to load
                displayedImg.addEventListener('load', handleImageReady, { once: true })
            }
        } else {
            // Fallback: create new image to track loading
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                let attempts = 0
                const maxAttempts = 10
                const checkSize = () => {
                    attempts++
                    if (setCanvasSize() || attempts >= maxAttempts) {
                        return
                    }
                    setTimeout(checkSize, 50)
                }
                setTimeout(checkSize, 100)
            }
            img.src = imageUrl
        }
    }, [imageUrl, brushSize, brushColor, drawingMode])

    // Get coordinates relative to canvas - Fixed for production sizing issues
    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        
        // Ensure canvas has valid dimensions
        if (canvas.width === 0 || canvas.height === 0 || rect.width === 0 || rect.height === 0) {
            // Try to reinitialize canvas if dimensions are invalid
            setTimeout(() => initializeCanvas(), 50)
            return { x: 0, y: 0 }
        }
        
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY
        
        // Clamp coordinates to canvas bounds
        return {
            x: Math.max(0, Math.min(canvas.width, x)),
            y: Math.max(0, Math.min(canvas.height, y))
        }
    }

    // Start drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Ensure canvas is properly initialized
        if (canvas.width === 0 || canvas.height === 0) {
            initializeCanvas()
            return
        }

        isDrawingRef.current = true
        let ctx = ctxRef.current
        
        // Get context if not available
        if (!ctx) {
            ctx = canvas.getContext('2d')
            if (!ctx) return
            ctxRef.current = ctx
        }

        // Ensure drawing settings are applied
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        if (drawingMode === 'pen') {
            ctx.globalCompositeOperation = 'source-over'
            ctx.strokeStyle = brushColor
        } else {
            ctx.globalCompositeOperation = 'destination-out'
        }

        const coords = getCanvasCoordinates(e, canvas)
        ctx.beginPath()
        ctx.moveTo(coords.x, coords.y)
    }

    // Draw on canvas
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Ensure canvas is properly initialized
        if (canvas.width === 0 || canvas.height === 0) {
            initializeCanvas()
            return
        }

        let ctx = ctxRef.current
        if (!ctx) {
            ctx = canvas.getContext('2d')
            if (!ctx) return
            ctxRef.current = ctx
        }

        const coords = getCanvasCoordinates(e, canvas)
        
        // Ensure drawing settings are applied
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
            // Get displayed image dimensions for scaling
            const displayedImg = container.querySelector('img') as HTMLImageElement
            const displayedWidth = displayedImg?.offsetWidth || canvas.width
            const displayedHeight = displayedImg?.offsetHeight || canvas.height
            
            // Always fetch image as blob first to avoid CORS tainting issues
            let imageBlob: Blob | null = null
            let imageWidth = 0
            let imageHeight = 0

            // Check if URL is a data URL or blob URL (no CORS issues)
            const isDataUrl = imageUrl.startsWith('data:')
            const isBlobUrl = imageUrl.startsWith('blob:')

            try {
                if (isDataUrl || isBlobUrl) {
                    // For data/blob URLs, convert to blob directly
                    const response = await fetch(imageUrl)
                    if (response.ok) {
                        imageBlob = await response.blob()
                    }
                } else {
                    // Method 1: Fetch image as blob (best for CORS)
                    const response = await fetch(imageUrl, {
                        mode: 'cors',
                        credentials: 'omit',
                        cache: 'default'
                    })
                
                    if (response.ok) {
                        imageBlob = await response.blob()
                    } else {
                        throw new Error(`Fetch failed: ${response.status}`)
                    }
                }
            } catch (fetchError) {
                console.warn('Fetch failed, trying alternative method:', fetchError)
                
                // Method 2: Try with no-cors mode (may work for same-origin)
                if (!isDataUrl && !isBlobUrl) {
                    try {
                        const response = await fetch(imageUrl, {
                            mode: 'no-cors',
                            credentials: 'omit'
                        })
                        if (response.ok || response.type === 'opaque') {
                            imageBlob = await response.blob()
                        }
                    } catch (noCorsError) {
                        console.warn('No-cors fetch also failed:', noCorsError)
                    }
                }
            }

            // If fetch failed, try to get image data from displayed image directly
            if (!imageBlob && displayedImg && displayedImg.complete && displayedImg.naturalWidth > 0) {
                try {
                    // Try to get image data via canvas (only works if same-origin or CORS enabled)
                    const tempCanvas = document.createElement('canvas')
                    const tempCtx = tempCanvas.getContext('2d')
                    if (tempCtx) {
                        tempCanvas.width = displayedImg.naturalWidth
                        tempCanvas.height = displayedImg.naturalHeight
                        tempCtx.drawImage(displayedImg, 0, 0)
                        
                        // Try to export - if this fails, canvas is tainted
                        const blob = await new Promise<Blob | null>((resolve) => {
                            try {
                                tempCanvas.toBlob((blob) => {
                                    resolve(blob)
                                }, 'image/png')
                            } catch (error) {
                                resolve(null)
                            }
                        })
                        
                        if (blob) {
                            imageBlob = blob
                            imageWidth = displayedImg.naturalWidth
                            imageHeight = displayedImg.naturalHeight
                        }
                    }
                } catch (canvasError) {
                    // Silently fail - we'll use white background
                    console.warn('Canvas method failed (likely CORS issue), will use white background')
                }
            }

            // If we still don't have image data, use displayed image dimensions for white background
            if (!imageBlob) {
                // Use displayed image dimensions - we'll create canvas with white background + drawings
                console.warn('Cannot access image data due to CORS. Creating canvas with drawings on white background.')
                // Try to get natural dimensions first (actual image size)
                if (displayedImg && displayedImg.naturalWidth > 0 && displayedImg.naturalHeight > 0) {
                    imageWidth = displayedImg.naturalWidth
                    imageHeight = displayedImg.naturalHeight
                } else if (displayedWidth > 0 && displayedHeight > 0) {
                    // Use displayed dimensions
                    imageWidth = displayedWidth
                    imageHeight = displayedHeight
                } else {
                    // Final fallback
                    imageWidth = canvas.width || 800
                    imageHeight = canvas.height || 1200
                }
            } else {
                // Get image dimensions from blob
                try {
                    const img = new window.Image()
                    const imageObjectUrl = URL.createObjectURL(imageBlob)
                    
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            URL.revokeObjectURL(imageObjectUrl)
                            reject(new Error('Image load timeout'))
                        }, 10000)

                        img.onload = () => {
                            clearTimeout(timeout)
                            imageWidth = img.width
                            imageHeight = img.height
                            URL.revokeObjectURL(imageObjectUrl)
                            resolve(null)
                        }
                        img.onerror = () => {
                            clearTimeout(timeout)
                            URL.revokeObjectURL(imageObjectUrl)
                            reject(new Error('Image load error'))
                        }
                        img.src = imageObjectUrl
                    })
                } catch (dimensionError) {
                    console.warn('Could not get image dimensions from blob, using displayed dimensions:', dimensionError)
                    // Use displayed image dimensions as fallback
                    imageWidth = displayedImg?.naturalWidth || displayedWidth || canvas.width || 800
                    imageHeight = displayedImg?.naturalHeight || displayedHeight || canvas.height || 1200
                    // Don't clear imageBlob - we'll try to use it anyway, and fallback to white if it fails
                }
            }

            // Create combined canvas
            const combinedCanvas = document.createElement('canvas')
            const ctx = combinedCanvas.getContext('2d')
            if (!ctx) {
                return null
            }

            // Ensure we have valid dimensions
            const finalWidth = imageWidth > 0 ? imageWidth : (displayedWidth > 0 ? displayedWidth : canvas.width || 800)
            const finalHeight = imageHeight > 0 ? imageHeight : (displayedHeight > 0 ? displayedHeight : canvas.height || 1200)
            
            combinedCanvas.width = finalWidth
            combinedCanvas.height = finalHeight

            // Draw original image if we have it
            let imageDrawn = false
            if (imageBlob) {
                try {
                    const img = new window.Image()
                    const imageObjectUrl = URL.createObjectURL(imageBlob)
                    
                    await new Promise((resolve) => {
                        const timeout = setTimeout(() => {
                            URL.revokeObjectURL(imageObjectUrl)
                            console.warn('Image load timeout, using white background')
                            resolve(null)
                        }, 8000) // Reduced timeout for faster fallback

                        img.onload = () => {
                            clearTimeout(timeout)
                            try {
                                ctx.drawImage(img, 0, 0, finalWidth, finalHeight)
                                imageDrawn = true
                            } catch (drawError) {
                                console.warn('Could not draw image to canvas:', drawError)
                            }
                            URL.revokeObjectURL(imageObjectUrl)
                            resolve(null)
                        }
                        img.onerror = () => {
                            clearTimeout(timeout)
                            URL.revokeObjectURL(imageObjectUrl)
                            console.warn('Image load error, using white background')
                            resolve(null)
                        }
                        img.src = imageObjectUrl
                    })
                } catch (imageLoadError) {
                    console.warn('Could not load image blob, using white background:', imageLoadError)
                }
            }
            
            // Fill with white background if image wasn't drawn
            if (!imageDrawn) {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)
            }

            // Draw the canvas overlay (drawings) scaled to match
            if (canvas.width > 0 && canvas.height > 0 && displayedWidth > 0 && displayedHeight > 0) {
                const scaleX = combinedCanvas.width / displayedWidth
                const scaleY = combinedCanvas.height / displayedHeight
                ctx.save()
                ctx.scale(scaleX, scaleY)
                ctx.drawImage(canvas, 0, 0)
                ctx.restore()
            }

            // Export as blob - ensure we always return a valid blob
            return new Promise((resolve) => {
                try {
                    combinedCanvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            // If toBlob fails, try creating a minimal canvas with just drawings
                            console.warn('toBlob returned null, creating fallback canvas')
                            try {
                                const fallbackCanvas = document.createElement('canvas')
                                const fallbackCtx = fallbackCanvas.getContext('2d')
                                if (fallbackCtx && canvas.width > 0 && canvas.height > 0) {
                                    fallbackCanvas.width = canvas.width
                                    fallbackCanvas.height = canvas.height
                                    fallbackCtx.fillStyle = '#FFFFFF'
                                    fallbackCtx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height)
                                    fallbackCtx.drawImage(canvas, 0, 0)
                                    
                                    fallbackCanvas.toBlob((fallbackBlob) => {
                                        resolve(fallbackBlob || new Blob())
                                    }, 'image/png', 0.95)
                                } else {
                                    resolve(new Blob())
                                }
                            } catch (fallbackError) {
                                console.error('Fallback canvas creation failed:', fallbackError)
                                resolve(new Blob())
                            }
                        }
                    }, 'image/png', 0.95)
                } catch (error) {
                    console.error('Error in toBlob:', error)
                    // Last resort: return empty blob (better than null)
                    resolve(new Blob())
                }
            })
        } catch (error) {
            console.error('Error getting edited image, creating fallback with drawings only:', error)
            // Last resort: Create a canvas with just the drawings on white background
            try {
                const canvas = canvasRef.current
                const container = imageContainerRef.current
                
                if (!canvas || !container) {
                    return null
                }
                
                const displayedImg = container.querySelector('img') as HTMLImageElement
                const fallbackWidth = displayedImg?.naturalWidth || displayedImg?.offsetWidth || canvas.width || 800
                const fallbackHeight = displayedImg?.naturalHeight || displayedImg?.offsetHeight || canvas.height || 1200
                
                const fallbackCanvas = document.createElement('canvas')
                const fallbackCtx = fallbackCanvas.getContext('2d')
                if (!fallbackCtx) {
                    return null
                }
                
                fallbackCanvas.width = fallbackWidth
                fallbackCanvas.height = fallbackHeight
                
                // White background
                fallbackCtx.fillStyle = '#FFFFFF'
                fallbackCtx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height)
                
                // Draw the drawings canvas if it has content
                if (canvas.width > 0 && canvas.height > 0) {
                    const displayedWidth = displayedImg?.offsetWidth || canvas.width
                    const displayedHeight = displayedImg?.offsetHeight || canvas.height
                    if (displayedWidth > 0 && displayedHeight > 0) {
                        const scaleX = fallbackCanvas.width / displayedWidth
                        const scaleY = fallbackCanvas.height / displayedHeight
                        fallbackCtx.save()
                        fallbackCtx.scale(scaleX, scaleY)
                        fallbackCtx.drawImage(canvas, 0, 0)
                        fallbackCtx.restore()
                    }
                }
                
                return new Promise((resolve) => {
                    fallbackCanvas.toBlob((blob) => {
                        resolve(blob)
                    }, 'image/png', 0.95)
                })
            } catch (fallbackError) {
                console.error('Fallback canvas creation also failed:', fallbackError)
                return null
            }
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
            setUseFallbackImage(false) // Reset fallback when URL changes
            setImageLoadError(null) // Reset error
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

    // ResizeObserver to handle container size changes (important for production)
    useEffect(() => {
        const container = imageContainerRef.current
        const canvas = canvasRef.current
        
        if (!container || !canvas) return

        // Function to update canvas size
        const updateCanvasSize = () => {
            const displayedImg = container.querySelector('img')
            if (!displayedImg) return

            const displayedWidth = displayedImg.offsetWidth || displayedImg.clientWidth
            const displayedHeight = displayedImg.offsetHeight || displayedImg.clientHeight

            if (displayedWidth > 0 && displayedHeight > 0) {
                // Only update if size actually changed
                if (canvas.width !== displayedWidth || canvas.height !== displayedHeight) {
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        // Save current canvas content
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        
                        // Resize canvas
                        canvas.width = displayedWidth
                        canvas.height = displayedHeight
                        
                        // Restore canvas content if it had content
                        if (imageData.width > 0 && imageData.height > 0) {
                            ctx.putImageData(imageData, 0, 0)
                        }
                        
                        ctxRef.current = ctx
                    }
                }
            }
        }

        // Use ResizeObserver for modern browsers
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                setTimeout(updateCanvasSize, 50)
            })
            
            resizeObserver.observe(container)
            
            return () => {
                resizeObserver.disconnect()
            }
        } else {
            // Fallback for older browsers
            const handleResize = () => {
                setTimeout(updateCanvasSize, 50)
            }
            
            window.addEventListener('resize', handleResize)
            
            return () => {
                window.removeEventListener('resize', handleResize)
            }
        }
    }, [imageUrl, initializeCanvas])

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
                            {!useFallbackImage ? (
                                <Image
                                    src={imageUrl}
                                    alt={alt}
                                    width={isZoomMode ? 800 : 400}
                                    height={isZoomMode ? 1200 : 600}
                                    className={`w-full h-auto transition-opacity duration-300 ${isZoomMode ? 'rounded-xl shadow-inner' : 'rounded-lg'} bg-gray-50 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    priority={isZoomMode}
                                    unoptimized={true}
                                    onLoad={(e) => {
                                        setIsImageLoading(false)
                                        setImageLoadError(null)
                                        // Wait for DOM to be ready, then initialize canvas
                                        setTimeout(() => {
                                            initializeCanvas()
                                        }, 100)
                                        // Also try after a longer delay for production timing issues
                                        setTimeout(() => {
                                            initializeCanvas()
                                        }, 300)
                                    }}
                                    onError={(e) => {
                                        console.warn('Next.js Image failed, falling back to regular img tag. URL:', imageUrl)
                                        setIsImageLoading(false)
                                        setUseFallbackImage(true)
                                    }}
                                />
                            ) : (
                                <>
                                    {/* Try without crossOrigin first */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt={alt}
                                        className={`w-full h-auto transition-opacity duration-300 ${isZoomMode ? 'rounded-xl shadow-inner' : 'rounded-lg'} bg-gray-50 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                        onLoad={() => {
                                            setIsImageLoading(false)
                                            setImageLoadError(null)
                                            // Wait for DOM to be ready, then initialize canvas
                                            setTimeout(() => {
                                                initializeCanvas()
                                            }, 100)
                                            // Also try after a longer delay for production timing issues
                                            setTimeout(() => {
                                                initializeCanvas()
                                            }, 300)
                                        }}
                                        onError={(e) => {
                                            console.error('Fallback image failed without CORS. URL:', imageUrl)
                                            setImageLoadError('Image konnte nicht geladen werden')
                                            setIsImageLoading(false)
                                        }}
                                    />
                                </>
                            )}
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
                    <div className={`w-full bg-gray-100 border-2 border-dashed border-gray-300 ${isZoomMode ? 'rounded-xl h-[600px] lg:h-[800px]' : 'rounded-lg h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]'} flex flex-col items-center justify-center text-gray-500 text-sm md:text-base p-4`}>
                        {imageLoadError ? (
                            <>
                                <p className="text-red-600 font-semibold mb-2">{imageLoadError}</p>
                                <p className="text-xs text-gray-400 break-all text-center">{imageUrl}</p>
                            </>
                        ) : (
                            'Kein Bild verfügbar'
                        )}
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

