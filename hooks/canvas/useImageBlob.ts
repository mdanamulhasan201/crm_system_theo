import { useRef, useCallback, RefObject } from 'react'

export interface UseImageBlobProps {
    canvasRef: RefObject<HTMLCanvasElement | null>
    containerRef: RefObject<HTMLDivElement | null>
    imageUrlRef: RefObject<string | null>
}

/**
 * Hook to generate edited image as blob (handles CORS properly to avoid tainted canvas)
 */
export function useImageBlob({
    canvasRef,
    containerRef,
    imageUrlRef
}: UseImageBlobProps) {
    const getEditedImageBlob = useCallback(async (): Promise<Blob | null> => {
        const canvas = canvasRef.current
        const container = containerRef.current
        const imageUrl = imageUrlRef.current
        
        if (!canvas || !imageUrl || !container) {
            return null
        }

        const displayedImg = container.querySelector('img') as HTMLImageElement
        if (!displayedImg || !displayedImg.complete) {
            return null
        }

        try {
            // Get original image dimensions - prefer natural dimensions for best quality
            const naturalWidth = displayedImg.naturalWidth > 0 
                ? displayedImg.naturalWidth 
                : (displayedImg.offsetWidth || canvas.width || 800)
            const naturalHeight = displayedImg.naturalHeight > 0 
                ? displayedImg.naturalHeight 
                : (displayedImg.offsetHeight || canvas.height || 1200)
            const displayedWidth = displayedImg.offsetWidth || canvas.width
            const displayedHeight = displayedImg.offsetHeight || canvas.height

            // Create combined canvas with original image dimensions
            const combinedCanvas = document.createElement('canvas')
            const ctx = combinedCanvas.getContext('2d', { willReadFrequently: false })
            if (!ctx) return null

            combinedCanvas.width = naturalWidth
            combinedCanvas.height = naturalHeight

            // Enable high-quality image rendering
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'

            // ALWAYS fetch image as blob first to avoid CORS tainting issues
            let imageDrawn = false
            let imageBlob: Blob | null = null
            
            try {
                const isDataUrl = imageUrl.startsWith('data:')
                const isBlobUrl = imageUrl.startsWith('blob:')
                
                if (isDataUrl || isBlobUrl) {
                    const response = await fetch(imageUrl)
                    if (response.ok) {
                        imageBlob = await response.blob()
                    }
                } else {
                    // Fetch with CORS mode first
                    try {
                        const response = await fetch(imageUrl, { 
                            mode: 'cors', 
                            credentials: 'omit',
                            cache: 'default'
                        })
                        if (response.ok) {
                            imageBlob = await response.blob()
                        }
                    } catch (corsError) {
                        // If CORS fails, try no-cors (may work for same-origin)
                        try {
                            const response = await fetch(imageUrl, { 
                                mode: 'no-cors',
                                credentials: 'omit'
                            })
                            if (response.ok || response.type === 'opaque') {
                                imageBlob = await response.blob()
                            }
                        } catch (noCorsError) {
                            console.warn('Could not fetch image blob:', noCorsError)
                        }
                    }
                }

                // Create an Image from blob (blob URLs are same-origin, so no CORS issue)
                if (imageBlob) {
                    const img = new window.Image()
                    const objectUrl = URL.createObjectURL(imageBlob)
                    
                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            URL.revokeObjectURL(objectUrl)
                            reject(new Error('Image load timeout'))
                        }, 10000)
                        
                        img.onload = () => {
                            clearTimeout(timeout)
                            try {
                                ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight)
                                imageDrawn = true
                            } catch (drawError) {
                                console.warn('Could not draw image from blob:', drawError)
                            }
                            URL.revokeObjectURL(objectUrl)
                            resolve()
                        }
                        img.onerror = () => {
                            clearTimeout(timeout)
                            URL.revokeObjectURL(objectUrl)
                            reject(new Error('Image load failed'))
                        }
                        img.src = objectUrl
                    })
                }
            } catch (fetchError) {
                console.warn('Could not fetch image blob, will use white background:', fetchError)
            }

            // Fill with white background if image wasn't drawn
            if (!imageDrawn) {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)
            }

            // Draw the canvas overlay (drawings) scaled to match original image size
            if (canvas.width > 0 && canvas.height > 0 && displayedWidth > 0 && displayedHeight > 0) {
                const scaleX = naturalWidth / displayedWidth
                const scaleY = naturalHeight / displayedHeight
                ctx.save()
                ctx.scale(scaleX, scaleY)
                ctx.drawImage(canvas, 0, 0)
                ctx.restore()
            }

            // Export as blob - canvas should not be tainted now since we used blob URL
            return new Promise((resolve) => {
                try {
                    combinedCanvas.toBlob((blob) => {
                        if (blob && blob.size > 0) {
                            resolve(blob)
                        } else {
                            console.error('Failed to generate blob from canvas - canvas may be tainted')
                            resolve(null)
                        }
                    }, 'image/png', 1.0) // Maximum quality
                } catch (error) {
                    console.error('Error calling toBlob (canvas tainted):', error)
                    resolve(null)
                }
            })
        } catch (error) {
            console.error('Error getting edited image:', error)
            return null
        }
    }, [canvasRef, containerRef, imageUrlRef])

    return { getEditedImageBlob }
}

