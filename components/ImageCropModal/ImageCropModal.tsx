'use client'

import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RotateCcw, Check, X } from 'lucide-react'

interface ImageCropModalProps {
    isOpen: boolean
    onClose: () => void
    imageSrc: string
    fileName: string
    fileType?: string
    /** Fixed aspect ratio (e.g. 16/9). Omit or pass undefined for free-form crop. */
    aspect?: number
    label?: string
    onCropComplete: (croppedFile: File) => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    )
}

async function getCroppedFile(
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
    fileName: string,
    fileType: string,
): Promise<File> {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = Math.floor(pixelCrop.width * scaleX)
    canvas.height = Math.floor(pixelCrop.height * scaleY)

    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
    )

    return new Promise<File>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas is empty')); return }
            resolve(new File([blob], fileName, { type: fileType }))
        }, fileType)
    })
}

export default function ImageCropModal({
    isOpen,
    onClose,
    imageSrc,
    fileName,
    fileType = 'image/jpeg',
    aspect,
    label = 'Bild zuschneiden',
    onCropComplete,
}: ImageCropModalProps) {
    const imgRef = useRef<HTMLImageElement>(null)
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [isProcessing, setIsProcessing] = useState(false)

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        if (aspect) {
            setCrop(centerAspectCrop(width, height, aspect))
        } else {
            // Default: select 80% of the image, free-form
            setCrop(centerCrop({ unit: '%', width: 80, height: 80 }, width, height))
        }
    }, [aspect])

    const handleReset = () => {
        if (!imgRef.current) return
        const { width, height } = imgRef.current
        if (aspect) {
            setCrop(centerAspectCrop(width, height, aspect))
        } else {
            setCrop(centerCrop({ unit: '%', width: 80, height: 80 }, width, height))
        }
        setCompletedCrop(undefined)
    }

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) return
        setIsProcessing(true)
        try {
            const file = await getCroppedFile(imgRef.current, completedCrop, fileName, fileType)
            onCropComplete(file)
            onClose()
        } catch (e) {
            console.error('Crop error:', e)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        setCrop(undefined)
        setCompletedCrop(undefined)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle className="text-base font-semibold">{label}</DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Ziehen Sie die Eckpunkte oder Kanten des Rahmens, um den Ausschnitt zu wählen.
                    </p>
                </DialogHeader>

                {/* Crop area — scrollable if image is large */}
                <div className="overflow-auto bg-gray-900 flex items-center justify-center px-4 py-4" style={{ maxHeight: 420 }}>
                    {imageSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            minWidth={20}
                            minHeight={20}
                            keepSelection
                            style={{ maxWidth: '100%' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Zuschnitt"
                                onLoad={onImageLoad}
                                style={{ maxWidth: '100%', maxHeight: 360, display: 'block' }}
                            />
                        </ReactCrop>
                    )}
                </div>

                {/* Crop size info */}
                {completedCrop && (
                    <div className="px-5 pt-2 pb-0">
                        <p className="text-center text-xs text-gray-400">
                            Ausschnitt: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center px-5 pb-5 pt-3 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="cursor-pointer gap-1.5 text-gray-600"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Zurücksetzen
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="cursor-pointer gap-1.5"
                        >
                            <X className="w-4 h-4" />
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isProcessing || !completedCrop?.width || !completedCrop?.height}
                            className="bg-[#62A07C] hover:bg-[#4A8A5F] cursor-pointer gap-1.5"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Verarbeitung...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Zuschnitt übernehmen
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
