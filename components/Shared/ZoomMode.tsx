'use client'
import { useState, useRef } from 'react'
import { FaSave, FaPrint } from 'react-icons/fa'
import { TfiDownload } from 'react-icons/tfi'
import { ScanData } from '@/types/scan'
import { useAuth } from '@/contexts/AuthContext'
import { generateFeetPdf } from '@/lib/FootPdfGenerate'
import { updateSingleScannerFile } from '@/apis/customerApis'
import { EditableImageCanvas, DrawingToolbar } from './Drawing'
import ImageCropModal from './ImageCropModal'
import toast from 'react-hot-toast'

interface ZoomModeProps {
    scanData: ScanData
    selectedScanData: any
    hasScreenerFile: boolean
    imageRefreshKey: number
    onExit: () => void
    onImageSave?: () => void | Promise<void>
    onImageRefresh: () => void
}

export default function ZoomMode({
    scanData,
    selectedScanData,
    hasScreenerFile,
    imageRefreshKey,
    onExit,
    onImageSave,
    onImageRefresh
}: ZoomModeProps) {
    const { user } = useAuth()
    const [isDownloading, setIsDownloading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [cropModalLeftImage, setCropModalLeftImage] = useState<string | null>(null)
    const [cropModalRightImage, setCropModalRightImage] = useState<string | null>(null)
    const [singleImageCropModal, setSingleImageCropModal] = useState<{ isOpen: boolean; imageUrl: string | null; side: 'left' | 'right' | null }>({
        isOpen: false,
        imageUrl: null,
        side: null
    })
    const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen')
    const [brushSize, setBrushSize] = useState(3)
    const [brushColor, setBrushColor] = useState('#000000')

    // Refs to get edited image data from canvas components

    const rightFootImageDataRef = useRef<(() => Promise<Blob | null>) | null>(null)
    const leftFootImageDataRef = useRef<(() => Promise<Blob | null>) | null>(null)

    // Get image URLs with paint priority
    const getLeftImage = (): string | null => {
        if (hasScreenerFile && selectedScanData) {
            return (selectedScanData as any).paint_23 || selectedScanData.picture_23 || null
        }
        return (scanData as any).paint_23 || scanData.picture_23 || null
    }

    const getRightImage = (): string | null => {
        if (hasScreenerFile && selectedScanData) {
            return (selectedScanData as any).paint_24 || selectedScanData.picture_24 || null
        }
        return (scanData as any).paint_24 || scanData.picture_24 || null
    }

    // Save edited images
    const handleSaveEditedImages = async () => {
        try {
            if (isSaving) return

            if (!selectedScanData || !selectedScanData.id) {
                toast.error('Keine Scandatei ausgewählt. Bitte wählen Sie ein Scandatum aus.')
                return
            }

            const customerId = scanData.id
            const screenerId = selectedScanData.id

            // Get edited images from both canvases
            const rightFootBlob = rightFootImageDataRef.current
                ? await rightFootImageDataRef.current()
                : null
            const leftFootBlob = leftFootImageDataRef.current
                ? await leftFootImageDataRef.current()
                : null

            if (!rightFootBlob || !leftFootBlob) {
                toast.error('Bearbeitete Bilder konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.')
                return
            }

            setIsSaving(true)

            // Create FormData with paint_24 (right foot) and paint_23 (left foot)
            const formData = new FormData()
            formData.append('paint_24', rightFootBlob, 'paint_24.png')
            formData.append('paint_23', leftFootBlob, 'paint_23.png')

            // Call API to update scanner file
            await updateSingleScannerFile(customerId, screenerId, formData)

            toast.success('Bilder erfolgreich gespeichert!')

            // Refresh images
            onImageRefresh()

            // Refresh data to show updated images instantly
            if (onImageSave) {
                await onImageSave()
            }
        } catch (error: any) {
            console.error('Error saving images:', error)
            toast.error(error?.response?.data?.message || 'Bilder konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.')
        } finally {
            setIsSaving(false)
        }
    }

    // Helper function to convert blob to data URL
    const blobToDataUrl = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            const timeout = setTimeout(() => {
                reader.abort()
                reject(new Error('FileReader timeout'))
            }, 15000)
            
            reader.onload = () => {
                clearTimeout(timeout)
                const result = reader.result as string
                if (result && result.startsWith('data:')) {
                    resolve(result)
                } else {
                    reject(new Error('Invalid data URL'))
                }
            }
            reader.onerror = () => {
                clearTimeout(timeout)
                reject(new Error('FileReader error'))
            }
            reader.readAsDataURL(blob)
        })
    }

    // Open crop modal with edited images
    const handleOpenCropModal = async () => {
        try {
            // Get edited images from both canvases
            const rightFootBlob = rightFootImageDataRef.current
                ? await rightFootImageDataRef.current()
                : null
            const leftFootBlob = leftFootImageDataRef.current
                ? await leftFootImageDataRef.current()
                : null

            if (!rightFootBlob || !leftFootBlob) {
                toast.error('Bearbeitete Bilder konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.')
                return
            }

            // Convert blobs to data URLs for crop modal
            const rightImageDataUrl = await blobToDataUrl(rightFootBlob)
            const leftImageDataUrl = await blobToDataUrl(leftFootBlob)

            setCropModalLeftImage(leftImageDataUrl)
            setCropModalRightImage(rightImageDataUrl)
            setIsCropModalOpen(true)
        } catch (error) {
            console.error('Error opening crop modal:', error)
            toast.error('Fehler beim Öffnen des Zuschnitt-Dialogs.')
        }
    }

    // Open single image crop modal
    const handleOpenSingleImageCropModal = async (side: 'left' | 'right') => {
        try {
            const imageDataRef = side === 'left' ? leftFootImageDataRef : rightFootImageDataRef
            const blob = imageDataRef.current ? await imageDataRef.current() : null

            if (!blob) {
                toast.error('Bearbeitetes Bild konnte nicht abgerufen werden. Bitte versuchen Sie es erneut.')
                return
            }

            // Convert blob to data URL for crop modal
            const imageDataUrl = await blobToDataUrl(blob)

            setSingleImageCropModal({
                isOpen: true,
                imageUrl: imageDataUrl,
                side
            })
        } catch (error) {
            console.error('Error opening single image crop modal:', error)
            toast.error('Fehler beim Öffnen des Zuschnitt-Dialogs.')
        }
    }

    // Handle download from crop modal
    const handleCropModalDownload = async (leftCroppedBlob: Blob | null, rightCroppedBlob: Blob | null) => {
        try {
            if (!leftCroppedBlob && !rightCroppedBlob) {
                toast.error('Keine Bilder zum Herunterladen verfügbar.')
                return
            }

            // Download left image if available
            if (leftCroppedBlob) {
                const leftUrl = URL.createObjectURL(leftCroppedBlob)
                const leftA = document.createElement('a')
                leftA.href = leftUrl
                leftA.download = `foot_scan_left_cropped_${(scanData as any)?.customerNumber || scanData.id}.png`
                document.body.appendChild(leftA)
                leftA.click()
                document.body.removeChild(leftA)
                URL.revokeObjectURL(leftUrl)
            }

            // Download right image if available
            if (rightCroppedBlob) {
                const rightUrl = URL.createObjectURL(rightCroppedBlob)
                const rightA = document.createElement('a')
                rightA.href = rightUrl
                rightA.download = `foot_scan_right_cropped_${(scanData as any)?.customerNumber || scanData.id}.png`
                document.body.appendChild(rightA)
                rightA.click()
                document.body.removeChild(rightA)
                URL.revokeObjectURL(rightUrl)
            }

            toast.success('Zugeschnittene Bilder wurden heruntergeladen!')
        } catch (error) {
            console.error('Error downloading cropped images:', error)
            toast.error('Fehler beim Herunterladen der Bilder.')
        }
    }

    // Handle download from single image crop modal
    const handleSingleImageCropModalDownload = async (leftCroppedBlob: Blob | null, rightCroppedBlob: Blob | null) => {
        try {
            const blob = singleImageCropModal.side === 'left' ? leftCroppedBlob : rightCroppedBlob
            if (!blob) {
                toast.error('Kein Bild zum Herunterladen verfügbar.')
                return
            }

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const sideLabel = singleImageCropModal.side === 'left' ? 'left' : 'right'
            a.download = `foot_scan_${sideLabel}_cropped_${(scanData as any)?.customerNumber || scanData.id}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success('Zugeschnittenes Bild wurde heruntergeladen!')
        } catch (error) {
            console.error('Error downloading cropped image:', error)
            toast.error('Fehler beim Herunterladen des Bildes.')
        }
    }

    // Print/Download PDF with edited images
    const handlePrintEditedImages = async () => {
        try {
            if (isDownloading) return
            setIsDownloading(true)

            // Get edited images from both canvases
            const rightFootBlob = rightFootImageDataRef.current
                ? await rightFootImageDataRef.current()
                : null
            const leftFootBlob = leftFootImageDataRef.current
                ? await leftFootImageDataRef.current()
                : null

            if (!rightFootBlob || !leftFootBlob) {
                toast.error('Bearbeitete Bilder konnten nicht abgerufen werden. Möglicherweise liegt ein CORS-Problem vor. Bitte stellen Sie sicher, dass die Bilder CORS-Header haben.')
                setIsDownloading(false)
                return
            }
            
            // Check if blobs are valid (not empty)
            if (rightFootBlob.size === 0 || leftFootBlob.size === 0) {
                toast.error('Die Bilder sind leer. Bitte versuchen Sie es erneut.')
                setIsDownloading(false)
                return
            }

            // Convert blobs to data URLs for PDF generation
            let rightImageDataUrl: string
            let leftImageDataUrl: string
            
            try {
                rightImageDataUrl = await blobToDataUrl(rightFootBlob)
            } catch (error) {
                console.error('Error converting right image to data URL:', error)
                toast.error('Fehler beim Verarbeiten des rechten Bildes.')
                setIsDownloading(false)
                return
            }

            try {
                leftImageDataUrl = await blobToDataUrl(leftFootBlob)
            } catch (error) {
                console.error('Error converting left image to data URL:', error)
                toast.error('Fehler beim Verarbeiten des linken Bildes.')
                setIsDownloading(false)
                return
            }

            // Generate combined PDF with both edited feet images
            const baseName = (scanData as any)?.customerNumber || scanData.id
            const headerBase = {
                logoUrl: user?.image || null,
                customerFullName: `${scanData.vorname || ''} ${scanData.nachname || ''}`.trim(),
                customerNumber: (scanData as any)?.customerNumber ?? null,
                dateOfBirthText: scanData.geburtsdatum || null
            } as const

            // Get dynamic foot length values from selected scan data
            const currentData = selectedScanData || scanData
            const leftFootLength = parseFloat((currentData as any).fusslange2 as string) || 0
            const rightFootLength = parseFloat((currentData as any).fusslange1 as string) || 0

            const { combined } = await generateFeetPdf({
                rightImageUrl: rightImageDataUrl,
                leftImageUrl: leftImageDataUrl,
                header: headerBase,
                generateCombined: true,
                leftFootLength,
                rightFootLength
            })

            if (combined) {
                // Create blob URL for PDF
                const pdfUrl = URL.createObjectURL(combined)

                // Create iframe to load PDF and trigger print
                const iframe = document.createElement('iframe')
                iframe.style.position = 'fixed'
                iframe.style.right = '0'
                iframe.style.bottom = '0'
                iframe.style.width = '0'
                iframe.style.height = '0'
                iframe.style.border = '0'
                iframe.src = pdfUrl

                document.body.appendChild(iframe)

                iframe.onload = () => {
                    try {
                        // Wait a bit for PDF to fully load
                        setTimeout(() => {
                            if (iframe.contentWindow) {
                                iframe.contentWindow.focus()
                                iframe.contentWindow.print()
                            }
                            // Clean up after printing
                            setTimeout(() => {
                                document.body.removeChild(iframe)
                                URL.revokeObjectURL(pdfUrl)
                            }, 1000)
                        }, 500)
                        toast.success('Druckdialog wird geöffnet...')
                    } catch (error) {
                        console.error('Print error:', error)
                        // Fallback: download if print fails
                        const a = document.createElement('a')
                        a.href = pdfUrl
                        a.download = `feet_scan_edited_${baseName}.pdf`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        document.body.removeChild(iframe)
                        URL.revokeObjectURL(pdfUrl)
                        toast.error('Drucken fehlgeschlagen. PDF stattdessen heruntergeladen.')
                    }
                }
            }
        } catch (err) {
            console.error('Failed to generate PDF:', err)
            toast.error('PDF-Generierung fehlgeschlagen.')
        } finally {
            await new Promise((resolve) => setTimeout(resolve, 500))
            setIsDownloading(false)
        }
    }

    const leftImage = getLeftImage()
    const rightImage = getRightImage()

    return (
        <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-lg my-4">

            {/* Modern Drawing Toolbar */}
            <div className="sticky z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm rounded-t-lg">

                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 py-2 sm:py-2.5 lg:py-3 overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                        {/* Drawing Toolbar - All in one line */}
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
                            <DrawingToolbar
                                drawingMode={drawingMode}
                                setDrawingMode={setDrawingMode}
                                brushSize={brushSize}
                                setBrushSize={setBrushSize}
                                brushColor={brushColor}
                                setBrushColor={setBrushColor}
                                onExitZoom={onExit}
                            />
                        </div>
                        
                        {/* Action Buttons - All in one line */}
                        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
                            {/* Download with Crop Button */}
                            <button
                                onClick={handleOpenCropModal}
                                disabled={!selectedScanData}
                                className={`px-3 py-2 cursor-pointer rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm hover:shadow transform  ${
                                    !selectedScanData
                                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                        : 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                                }`}
                                title="Bilder zuschneiden und herunterladen"
                            >
                                <TfiDownload className="text-sm sm:text-base shrink-0" />
                                <span className="hidden sm:inline lg:hidden">Herunterladen</span>
                                <span className="hidden lg:inline">Herunterladen</span>
                            </button>
                            
                            {/* Print/Download PDF Button */}
                            <button
                                onClick={handlePrintEditedImages}
                                disabled={isDownloading || !selectedScanData}
                                className={`px-3 py-2 cursor-pointer rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm hover:shadow transform  ${
                                    isDownloading || !selectedScanData
                                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                        : 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                                }`}
                                title="Drucken/Download bearbeitete Bilder als PDF"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin shrink-0" />
                                        <span className="hidden sm:inline lg:hidden">Generieren</span>
                                        <span className="hidden lg:inline">Generieren...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPrint className="text-sm sm:text-base shrink-0" />
                                        <span className="hidden sm:inline lg:hidden">Drucken</span>
                                        <span className="hidden lg:inline">Drucken als PDF</span>
                                    </>
                                )}
                            </button>
                            
                            {/* Save Button */}
                            <button
                                onClick={handleSaveEditedImages}
                                disabled={isSaving || !selectedScanData}
                                className={`px-3 py-2 cursor-pointer rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm hover:shadow-lg transform  ${
                                    isSaving || !selectedScanData
                                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                        : 'bg-[#4A8A5F] hover:bg-[#4A8A5F]/90 active:bg-[#4A8A5F]/70 text-white'
                                }`}
                                title="Speichere bearbeitete Bilder"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                        <span className="hidden sm:inline lg:hidden">Speichern</span>
                                        <span className="hidden lg:inline">Speichern...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="text-sm sm:text-base shrink-0" />
                                        <span className="hidden sm:inline lg:hidden">Speichere Bilder</span>
                                        <span className="hidden lg:inline">Speichere Bilder</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive image layout with canvas overlay */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex flex-col xl:flex-row justify-center items-stretch xl:items-stretch gap-6 lg:gap-8 xl:gap-12">
                    {/* Left foot image */}
                    {leftImage && (
                        <div className="w-full xl:w-1/2 shrink-0 flex">
                            <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full">
                                <EditableImageCanvas
                                    key={`zoom-left-${leftImage}-${selectedScanData?.updatedAt || scanData.updatedAt}-${imageRefreshKey}`}
                                    imageUrl={leftImage}
                                    alt="Left foot scan - Plantaransicht"
                                    title="Linker Fuß"
                                    downloadFileName={`foot_scan_left_${(scanData as any)?.customerNumber || scanData.id}`}
                                    drawingMode={drawingMode}
                                    brushSize={brushSize}
                                    brushColor={brushColor}
                                    isZoomMode={true}
                                    onImageDataReady={(getImageData) => {
                                        leftFootImageDataRef.current = getImageData
                                    }}
                                    onOpenCropModal={() => handleOpenSingleImageCropModal('left')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Right foot image */}
                    {rightImage && (
                        <div className="w-full xl:w-1/2 shrink-0 flex">
                            <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full">
                                <EditableImageCanvas
                                    key={`zoom-right-${rightImage}-${selectedScanData?.updatedAt || scanData.updatedAt}-${imageRefreshKey}`}
                                    imageUrl={rightImage}
                                    alt="Right foot scan - Plantaransicht"
                                    title="Rechter Fuß"
                                    downloadFileName={`foot_scan_right_${(scanData as any)?.customerNumber || scanData.id}`}
                                    drawingMode={drawingMode}
                                    brushSize={brushSize}
                                    brushColor={brushColor}
                                    isZoomMode={true}
                                    onImageDataReady={(getImageData) => {
                                        rightFootImageDataRef.current = getImageData
                                    }}
                                    onOpenCropModal={() => handleOpenSingleImageCropModal('right')}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Image Crop Modal - Both Images */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                onClose={() => {
                    setIsCropModalOpen(false)
                    setCropModalLeftImage(null)
                    setCropModalRightImage(null)
                }}
                leftImageUrl={cropModalLeftImage}
                rightImageUrl={cropModalRightImage}
                onDownload={handleCropModalDownload}
                customerNumber={(scanData as any)?.customerNumber || scanData.id}
            />

            {/* Single Image Crop Modal */}
            <ImageCropModal
                isOpen={singleImageCropModal.isOpen}
                onClose={() => {
                    setSingleImageCropModal({ isOpen: false, imageUrl: null, side: null })
                }}
                leftImageUrl={singleImageCropModal.side === 'left' ? singleImageCropModal.imageUrl : null}
                rightImageUrl={singleImageCropModal.side === 'right' ? singleImageCropModal.imageUrl : null}
                onDownload={handleSingleImageCropModalDownload}
                customerNumber={(scanData as any)?.customerNumber || scanData.id}
                singleImageMode={singleImageCropModal.side}
                singleImageLabel={singleImageCropModal.side === 'left' ? 'Linker Fuß' : 'Rechter Fuß'}
            />
        </div>
    )
}

