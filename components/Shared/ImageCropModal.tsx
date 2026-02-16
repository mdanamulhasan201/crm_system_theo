'use client'
import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { TfiDownload } from 'react-icons/tfi'
import toast from 'react-hot-toast'

interface CropArea {
    x: number
    y: number
    width: number
    height: number
}

interface ImageCropModalProps {
    isOpen: boolean
    onClose: () => void
    leftImageUrl: string | null
    rightImageUrl: string | null
    onDownload: (leftCroppedBlob: Blob | null, rightCroppedBlob: Blob | null) => void
    customerNumber?: string | number
    singleImageMode?: 'left' | 'right' | null
    singleImageLabel?: string
}

export default function ImageCropModal({
    isOpen,
    onClose,
    leftImageUrl,
    rightImageUrl,
    onDownload,
    customerNumber,
    singleImageMode = null,
    singleImageLabel
}: ImageCropModalProps) {
    const [leftCropArea, setLeftCropArea] = useState<CropArea | null>(null)
    const [rightCropArea, setRightCropArea] = useState<CropArea | null>(null)
    const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null)
    const [isResizing, setIsResizing] = useState<{ side: 'left' | 'right'; corner: 'nw' | 'ne' | 'sw' | 'se' } | null>(null)
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [leftImageLoaded, setLeftImageLoaded] = useState(false)
    const [rightImageLoaded, setRightImageLoaded] = useState(false)
    
    const leftImageRef = useRef<HTMLImageElement>(null)
    const rightImageRef = useRef<HTMLImageElement>(null)
    const leftContainerRef = useRef<HTMLDivElement>(null)
    const rightContainerRef = useRef<HTMLDivElement>(null)

    // Initialize crop areas when images load
    useEffect(() => {
        if (leftImageLoaded && leftImageRef.current) {
            const img = leftImageRef.current
            
            // Use natural dimensions for accurate cropping
            const naturalWidth = img.naturalWidth || img.width
            const naturalHeight = img.naturalHeight || img.height
            
            // Set initial crop area to center 80% of image
            const cropWidth = naturalWidth * 0.8
            const cropHeight = naturalHeight * 0.8
            const cropX = (naturalWidth - cropWidth) / 2
            const cropY = (naturalHeight - cropHeight) / 2
            
            setLeftCropArea({
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight
            })
        }
    }, [leftImageLoaded])

    useEffect(() => {
        if (rightImageLoaded && rightImageRef.current) {
            const img = rightImageRef.current
            
            // Use natural dimensions for accurate cropping
            const naturalWidth = img.naturalWidth || img.width
            const naturalHeight = img.naturalHeight || img.height
            
            // Set initial crop area to center 80% of image
            const cropWidth = naturalWidth * 0.8
            const cropHeight = naturalHeight * 0.8
            const cropX = (naturalWidth - cropWidth) / 2
            const cropY = (naturalHeight - cropHeight) / 2
            
            setRightCropArea({
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight
            })
        }
    }, [rightImageLoaded])

    // Reset crop areas when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setLeftCropArea(null)
            setRightCropArea(null)
            setLeftImageLoaded(false)
            setRightImageLoaded(false)
            setIsDragging(null)
            setIsResizing(null)
            setDragStart(null)
        }
    }, [isOpen])

    // Add global mouse event listeners for dragging/resizing
    useEffect(() => {
        if (!isOpen) return

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isResizing) {
                const { side, corner } = isResizing
                const cropArea = (side === 'left' ? leftCropArea : rightCropArea)
                if (!cropArea) return
                
                const container = (side === 'left' ? leftContainerRef.current : rightContainerRef.current)
                const img = (side === 'left' ? leftImageRef.current : rightImageRef.current)
                if (!container || !img) return
                
                const rect = container.getBoundingClientRect()
                const mouseX = e.clientX - rect.left
                const mouseY = e.clientY - rect.top
                
                const imgRect = img.getBoundingClientRect()
                const imgLeft = imgRect.left - rect.left
                const imgTop = imgRect.top - rect.top
                
                const scaleX = (img.naturalWidth || img.width) / imgRect.width
                const scaleY = (img.naturalHeight || img.height) / imgRect.height
                
                const naturalX = (mouseX - imgLeft) * scaleX
                const naturalY = (mouseY - imgTop) * scaleY
                
                const naturalWidth = img.naturalWidth || img.width
                const naturalHeight = img.naturalHeight || img.height
                
                let newX = cropArea.x
                let newY = cropArea.y
                let newWidth = cropArea.width
                let newHeight = cropArea.height
                
                switch (corner) {
                    case 'nw':
                        newWidth = cropArea.x + cropArea.width - naturalX
                        newHeight = cropArea.y + cropArea.height - naturalY
                        newX = naturalX
                        newY = naturalY
                        break
                    case 'ne':
                        newWidth = naturalX - cropArea.x
                        newHeight = cropArea.y + cropArea.height - naturalY
                        newY = naturalY
                        break
                    case 'sw':
                        newWidth = cropArea.x + cropArea.width - naturalX
                        newHeight = naturalY - cropArea.y
                        newX = naturalX
                        break
                    case 'se':
                        newWidth = naturalX - cropArea.x
                        newHeight = naturalY - cropArea.y
                        break
                }
                
                const minSize = 50
                if (newWidth < minSize) newWidth = minSize
                if (newHeight < minSize) newHeight = minSize
                
                newX = Math.max(0, Math.min(newX, naturalWidth - newWidth))
                newY = Math.max(0, Math.min(newY, naturalHeight - newHeight))
                newWidth = Math.min(newWidth, naturalWidth - newX)
                newHeight = Math.min(newHeight, naturalHeight - newY)
                
                const newCropArea = { x: newX, y: newY, width: newWidth, height: newHeight }
                
                if (side === 'left') {
                    setLeftCropArea(newCropArea)
                } else {
                    setRightCropArea(newCropArea)
                }
                return
            }
            
            if (isDragging && dragStart) {
                const container = (isDragging === 'left' ? leftContainerRef.current : rightContainerRef.current)
                const img = (isDragging === 'left' ? leftImageRef.current : rightImageRef.current)
                const cropArea = (isDragging === 'left' ? leftCropArea : rightCropArea)
                
                if (!container || !img || !cropArea) return
                
                const rect = container.getBoundingClientRect()
                const currentX = e.clientX - rect.left
                const currentY = e.clientY - rect.top
                
                const imgRect = img.getBoundingClientRect()
                const imgLeft = imgRect.left - rect.left
                const imgTop = imgRect.top - rect.top
                
                const scaleX = (img.naturalWidth || img.width) / imgRect.width
                const scaleY = (img.naturalHeight || img.height) / imgRect.height
                
                const naturalX = (currentX - imgLeft) * scaleX
                const naturalY = (currentY - imgTop) * scaleY
                const startNaturalX = (dragStart.x - imgLeft) * scaleX
                const startNaturalY = (dragStart.y - imgTop) * scaleY
                
                const deltaX = naturalX - startNaturalX
                const deltaY = naturalY - startNaturalY
                
                let newX = cropArea.x + deltaX
                let newY = cropArea.y + deltaY
                
                const naturalWidth = img.naturalWidth || img.width
                const naturalHeight = img.naturalHeight || img.height
                
                newX = Math.max(0, Math.min(newX, naturalWidth - cropArea.width))
                newY = Math.max(0, Math.min(newY, naturalHeight - cropArea.height))
                
                const newCropArea = {
                    ...cropArea,
                    x: newX,
                    y: newY
                }
                
                if (isDragging === 'left') {
                    setLeftCropArea(newCropArea)
                } else {
                    setRightCropArea(newCropArea)
                }
                
                setDragStart({ x: currentX, y: currentY })
            }
        }

        const handleGlobalMouseUp = () => {
            setIsDragging(null)
            setIsResizing(null)
            setDragStart(null)
        }

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleGlobalMouseMove)
            window.addEventListener('mouseup', handleGlobalMouseUp)
            
            return () => {
                window.removeEventListener('mousemove', handleGlobalMouseMove)
                window.removeEventListener('mouseup', handleGlobalMouseUp)
            }
        }
    }, [isOpen, isDragging, isResizing, dragStart, leftCropArea, rightCropArea])

    const handleMouseDown = (side: 'left' | 'right', e: React.MouseEvent) => {
        if (side === 'left' && !leftCropArea) return
        if (side === 'right' && !rightCropArea) return
        
        setIsDragging(side)
        const rect = (side === 'left' ? leftContainerRef.current : rightContainerRef.current)?.getBoundingClientRect()
        if (rect) {
            setDragStart({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isResizing) {
            const { side, corner } = isResizing
            handleResize(side, corner, e)
            return
        }
        
        if (!isDragging || !dragStart) return
        
        const container = (isDragging === 'left' ? leftContainerRef.current : rightContainerRef.current)
        const img = (isDragging === 'left' ? leftImageRef.current : rightImageRef.current)
        const cropArea = (isDragging === 'left' ? leftCropArea : rightCropArea)
        
        if (!container || !img || !cropArea) return
        
        const rect = container.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top
        
        const imgRect = img.getBoundingClientRect()
        const imgLeft = imgRect.left - rect.left
        const imgTop = imgRect.top - rect.top
        
        // Calculate scale factor between displayed and natural size
        const scaleX = (img.naturalWidth || img.width) / imgRect.width
        const scaleY = (img.naturalHeight || img.height) / imgRect.height
        
        // Convert mouse position to natural image coordinates
        const naturalX = (currentX - imgLeft) * scaleX
        const naturalY = (currentY - imgTop) * scaleY
        const startNaturalX = (dragStart.x - imgLeft) * scaleX
        const startNaturalY = (dragStart.y - imgTop) * scaleY
        
        // Calculate delta in natural coordinates
        const deltaX = naturalX - startNaturalX
        const deltaY = naturalY - startNaturalY
        
        // Calculate new crop area position in natural coordinates
        let newX = cropArea.x + deltaX
        let newY = cropArea.y + deltaY
        
        const naturalWidth = img.naturalWidth || img.width
        const naturalHeight = img.naturalHeight || img.height
        
        // Constrain to image bounds
        newX = Math.max(0, Math.min(newX, naturalWidth - cropArea.width))
        newY = Math.max(0, Math.min(newY, naturalHeight - cropArea.height))
        
        const newCropArea = {
            ...cropArea,
            x: newX,
            y: newY
        }
        
        if (isDragging === 'left') {
            setLeftCropArea(newCropArea)
        } else {
            setRightCropArea(newCropArea)
        }
        
        setDragStart({ x: currentX, y: currentY })
    }

    const handleMouseUp = () => {
        setIsDragging(null)
        setIsResizing(null)
        setDragStart(null)
    }

    // Handle resize of crop area
    const handleResize = (side: 'left' | 'right', corner: 'nw' | 'ne' | 'sw' | 'se', e: React.MouseEvent) => {
        e.stopPropagation()
        const cropArea = (side === 'left' ? leftCropArea : rightCropArea)
        if (!cropArea) return
        
        const container = (side === 'left' ? leftContainerRef.current : rightContainerRef.current)
        const img = (side === 'left' ? leftImageRef.current : rightImageRef.current)
        if (!container || !img) return
        
        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        const imgRect = img.getBoundingClientRect()
        const imgLeft = imgRect.left - rect.left
        const imgTop = imgRect.top - rect.top
        
        // Calculate scale factor between displayed and natural size
        const scaleX = (img.naturalWidth || img.width) / imgRect.width
        const scaleY = (img.naturalHeight || img.height) / imgRect.height
        
        // Convert mouse position to natural image coordinates
        const naturalX = (mouseX - imgLeft) * scaleX
        const naturalY = (mouseY - imgTop) * scaleY
        
        const naturalWidth = img.naturalWidth || img.width
        const naturalHeight = img.naturalHeight || img.height
        
        let newX = cropArea.x
        let newY = cropArea.y
        let newWidth = cropArea.width
        let newHeight = cropArea.height
        
        switch (corner) {
            case 'nw':
                newWidth = cropArea.x + cropArea.width - naturalX
                newHeight = cropArea.y + cropArea.height - naturalY
                newX = naturalX
                newY = naturalY
                break
            case 'ne':
                newWidth = naturalX - cropArea.x
                newHeight = cropArea.y + cropArea.height - naturalY
                newY = naturalY
                break
            case 'sw':
                newWidth = cropArea.x + cropArea.width - naturalX
                newHeight = naturalY - cropArea.y
                newX = naturalX
                break
            case 'se':
                newWidth = naturalX - cropArea.x
                newHeight = naturalY - cropArea.y
                break
        }
        
        // Constrain to image bounds and minimum size
        const minSize = 50
        if (newWidth < minSize) newWidth = minSize
        if (newHeight < minSize) newHeight = minSize
        
        newX = Math.max(0, Math.min(newX, naturalWidth - newWidth))
        newY = Math.max(0, Math.min(newY, naturalHeight - newHeight))
        newWidth = Math.min(newWidth, naturalWidth - newX)
        newHeight = Math.min(newHeight, naturalHeight - newY)
        
        const newCropArea = { x: newX, y: newY, width: newWidth, height: newHeight }
        
        if (side === 'left') {
            setLeftCropArea(newCropArea)
        } else {
            setRightCropArea(newCropArea)
        }
    }

    // Crop image using canvas
    const cropImage = async (imageUrl: string, cropArea: CropArea): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                if (!ctx) {
                    reject(new Error('Could not get canvas context'))
                    return
                }
                
                // Set canvas size to crop area
                canvas.width = cropArea.width
                canvas.height = cropArea.height
                
                // Draw cropped portion
                ctx.drawImage(
                    img,
                    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                    0, 0, cropArea.width, cropArea.height
                )
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Failed to create blob'))
                    }
                }, 'image/png')
            }
            
            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }
            
            img.src = imageUrl
        })
    }

    const handleDownload = async () => {
        try {
            let leftCroppedBlob: Blob | null = null
            let rightCroppedBlob: Blob | null = null
            
            if (singleImageMode === 'left') {
                if (leftImageUrl && leftCropArea) {
                    leftCroppedBlob = await cropImage(leftImageUrl, leftCropArea)
                }
            } else if (singleImageMode === 'right') {
                if (rightImageUrl && rightCropArea) {
                    rightCroppedBlob = await cropImage(rightImageUrl, rightCropArea)
                }
            } else {
                // Both images mode
                if (leftImageUrl && leftCropArea) {
                    leftCroppedBlob = await cropImage(leftImageUrl, leftCropArea)
                }
                
                if (rightImageUrl && rightCropArea) {
                    rightCroppedBlob = await cropImage(rightImageUrl, rightCropArea)
                }
            }
            
            onDownload(leftCroppedBlob, rightCroppedBlob)
            onClose()
        } catch (error) {
            console.error('Error cropping images:', error)
            toast.error('Fehler beim Zuschneiden des Bildes.')
        }
    }

    const renderCropOverlay = (side: 'left' | 'right') => {
        const cropArea = side === 'left' ? leftCropArea : rightCropArea
        const img = side === 'left' ? leftImageRef.current : rightImageRef.current
        
        if (!cropArea || !img) return null
        
        const imgRect = img.getBoundingClientRect()
        const container = side === 'left' ? leftContainerRef.current : rightContainerRef.current
        if (!container) return null
        
        const containerRect = container.getBoundingClientRect()
        const imgLeft = imgRect.left - containerRect.left
        const imgTop = imgRect.top - containerRect.top
        
        // Calculate scale factor between natural and displayed size
        const scaleX = imgRect.width / (img.naturalWidth || img.width)
        const scaleY = imgRect.height / (img.naturalHeight || img.height)
        
        // Convert crop area from natural coordinates to displayed coordinates
        const displayX = cropArea.x * scaleX
        const displayY = cropArea.y * scaleY
        const displayWidth = cropArea.width * scaleX
        const displayHeight = cropArea.height * scaleY
        
        return (
            <>
                {/* Dark overlay */}
                <div
                    className="absolute bg-black/50 pointer-events-none"
                    style={{
                        left: imgLeft,
                        top: imgTop,
                        width: imgRect.width,
                        height: imgRect.height,
                        clipPath: `polygon(
                            0% 0%,
                            0% 100%,
                            ${displayX}px 100%,
                            ${displayX}px ${displayY}px,
                            ${displayX + displayWidth}px ${displayY}px,
                            ${displayX + displayWidth}px ${displayY + displayHeight}px,
                            ${displayX}px ${displayY + displayHeight}px,
                            ${displayX}px 100%,
                            100% 100%,
                            100% 0%
                        )`
                    }}
                />
                
                {/* Crop border */}
                <div
                    className="absolute border-2 border-white shadow-lg cursor-move"
                    style={{
                        left: imgLeft + displayX,
                        top: imgTop + displayY,
                        width: displayWidth,
                        height: displayHeight
                    }}
                    onMouseDown={(e) => handleMouseDown(side, e)}
                >
                    {/* Resize handles */}
                    {['nw', 'ne', 'sw', 'se'].map((corner) => (
                        <div
                            key={corner}
                            className="absolute w-4 h-4 bg-white border border-gray-400 cursor-nwse-resize"
                            style={{
                                left: corner.includes('w') ? '-6px' : 'auto',
                                right: corner.includes('e') ? '-6px' : 'auto',
                                top: corner.includes('n') ? '-6px' : 'auto',
                                bottom: corner.includes('s') ? '-6px' : 'auto'
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setIsResizing({ side, corner: corner as 'nw' | 'ne' | 'sw' | 'se' })
                                const container = (side === 'left' ? leftContainerRef.current : rightContainerRef.current)
                                if (container) {
                                    const rect = container.getBoundingClientRect()
                                    setDragStart({
                                        x: e.clientX - rect.left,
                                        y: e.clientY - rect.top
                                    })
                                }
                            }}
                        />
                    ))}
                </div>
            </>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${singleImageMode ? 'max-w-4xl w-full' : 'max-w-6xl'} max-h-[90vh] overflow-y-auto`}>
                <DialogHeader>
                    <DialogTitle>Bilder zuschneiden und herunterladen</DialogTitle>
                </DialogHeader>
                
                <div className={`grid gap-6 py-4 ${singleImageMode ? 'grid-cols-1 max-w-full' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {/* Left Foot Image */}
                    {leftImageUrl && (!singleImageMode || singleImageMode === 'left') && (
                        <div className={`space-y-2 ${singleImageMode ? 'w-full' : ''}`}>
                            <h3 className="text-sm font-semibold text-gray-700">{singleImageLabel || 'Linker Fuß'}</h3>
                            <div
                                ref={leftContainerRef}
                                className={`relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 ${singleImageMode ? 'w-full flex justify-center' : ''}`}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    ref={leftImageRef}
                                    src={leftImageUrl}
                                    alt={singleImageLabel || 'Linker Fuß'}
                                    className={`${singleImageMode ? 'w-full h-auto' : 'max-w-full h-auto'}`}
                                    onLoad={() => setLeftImageLoaded(true)}
                                    crossOrigin="anonymous"
                                />
                                {leftImageLoaded && renderCropOverlay('left')}
                            </div>
                        </div>
                    )}
                    
                    {/* Right Foot Image */}
                    {rightImageUrl && (!singleImageMode || singleImageMode === 'right') && (
                        <div className={`space-y-2 ${singleImageMode ? 'w-full' : ''}`}>
                            <h3 className="text-sm font-semibold text-gray-700">{singleImageLabel || 'Rechter Fuß'}</h3>
                            <div
                                ref={rightContainerRef}
                                className={`relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 ${singleImageMode ? 'w-full flex justify-center' : ''}`}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    ref={rightImageRef}
                                    src={rightImageUrl}
                                    alt={singleImageLabel || 'Rechter Fuß'}
                                    className={`${singleImageMode ? 'w-full h-auto' : 'max-w-full h-auto'}`}
                                    onLoad={() => setRightImageLoaded(true)}
                                    crossOrigin="anonymous"
                                />
                                {rightImageLoaded && renderCropOverlay('right')}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                    <p>• Ziehen Sie den Rahmen, um den Bereich zu verschieben</p>
                    <p>• Ziehen Sie die Ecken, um die Größe zu ändern</p>
                </div>
                
                <DialogFooter>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={
                            singleImageMode === 'left' 
                                ? (!leftCropArea || !leftImageUrl)
                                : singleImageMode === 'right'
                                ? (!rightCropArea || !rightImageUrl)
                                : ((!leftCropArea && !rightCropArea) || (!leftImageUrl && !rightImageUrl))
                        }
                        className="px-4 py-2 bg-[#4A8A5F] text-white rounded-lg hover:bg-[#4A8A5F]/90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <TfiDownload className="text-base" />
                        Herunterladen
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

