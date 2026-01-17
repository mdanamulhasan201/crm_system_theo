'use client'
import { useState, useRef } from 'react'
import { FaSave, FaPrint } from 'react-icons/fa'
import { ScanData } from '@/types/scan'
import { useAuth } from '@/contexts/AuthContext'
import { generateFeetPdf } from '@/lib/FootPdfGenerate'
import { updateSingleScannerFile } from '@/apis/customerApis'
import EditableImageCanvas, { DrawingToolbar } from './EditableImageCanvas'
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
    const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen')
    const [brushSize, setBrushSize] = useState(3)
    const [brushColor, setBrushColor] = useState('#000000')

<<<<<<< HEAD
=======
    // Refs to get edited image data from canvas components
>>>>>>> 70f38c7 (updates)
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
                toast.error('Bearbeitete Bilder konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.')
                return
            }

            // Convert blobs to data URLs for PDF generation
            const rightImageDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(rightFootBlob)
            })

            const leftImageDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(leftFootBlob)
            })

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
            {/* Loading Overlay */}
            {(isDownloading || isSaving) && (
                <div className="absolute inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="bg-white rounded-lg shadow-lg px-6 py-5 flex items-center gap-3">
                        <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                        <span className="text-gray-900 font-medium">
                            {isSaving ? 'Bilder werden gespeichert...' : 'PDF wird generiert...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Modern Drawing Toolbar */}
<<<<<<< HEAD
            <div className="sticky z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm rounded-t-lg">
=======
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm rounded-t-lg">
>>>>>>> 70f38c7 (updates)
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 py-2 sm:py-3 lg:py-4">
                        {/* Drawing Toolbar - Responsive */}
                        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start">
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
                        
                        {/* Action Buttons - Smart responsive layout */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
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
                                <FaPrint className="text-sm sm:text-base shrink-0" />
                                <span className="hidden sm:inline lg:hidden">
                                        {isDownloading ? 'Generieren' : 'Drucken'}
                                </span>
                                <span className="hidden lg:inline">
                                    {isDownloading ? 'Generieren...' : 'Drucken als PDF'}
                                </span>
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
                                <FaSave className="text-sm sm:text-base shrink-0" />
                                <span className="hidden sm:inline lg:hidden">
                                    {isSaving ? 'Speichern' : 'Speichere Bilder'}
                                </span>
                                <span className="hidden lg:inline">
                                    {isSaving ? 'Speichern...' : 'Speichere Bilder'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive image layout with canvas overlay */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
<<<<<<< HEAD
                {!leftImage && !rightImage ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <p className="text-gray-600 text-lg mb-2">Keine Bilder verfügbar</p>
                            <p className="text-gray-500 text-sm">Bitte wählen Sie ein Scandatum mit verfügbaren Bildern aus.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col xl:flex-row justify-center items-stretch xl:items-stretch gap-6 lg:gap-8 xl:gap-12">
                        {/* Left foot image */}
                        {leftImage ? (
                            <div className="w-full xl:w-1/2 shrink-0 flex">
                                <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full">
                                    <EditableImageCanvas
                                        key={`zoom-left-${leftImage}-${selectedScanData?.updatedAt || scanData.updatedAt}-${imageRefreshKey}`}
                                        imageUrl={leftImage}
                                        alt="Left foot scan - Plantaransicht"
                                        title=""
                                        downloadFileName={`foot_scan_left_${(scanData as any)?.customerNumber || scanData.id}`}
                                        drawingMode={drawingMode}
                                        brushSize={brushSize}
                                        brushColor={brushColor}
                                        isZoomMode={true}
                                        onImageDataReady={(getImageData) => {
                                            leftFootImageDataRef.current = getImageData
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full xl:w-1/2 shrink-0 flex">
                                <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full items-center justify-center">
                                    <p className="text-gray-500 text-sm">Kein linkes Fußbild verfügbar</p>
                                </div>
                            </div>
                        )}

                        {/* Right foot image */}
                        {rightImage ? (
                            <div className="w-full xl:w-1/2 shrink-0 flex">
                                <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full">
                                    <EditableImageCanvas
                                        key={`zoom-right-${rightImage}-${selectedScanData?.updatedAt || scanData.updatedAt}-${imageRefreshKey}`}
                                        imageUrl={rightImage}
                                        alt="Right foot scan - Plantaransicht"
                                        title=""
                                        downloadFileName={`foot_scan_right_${(scanData as any)?.customerNumber || scanData.id}`}
                                        drawingMode={drawingMode}
                                        brushSize={brushSize}
                                        brushColor={brushColor}
                                        isZoomMode={true}
                                        onImageDataReady={(getImageData) => {
                                            rightFootImageDataRef.current = getImageData
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full xl:w-1/2 shrink-0 flex">
                                <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full items-center justify-center">
                                    <p className="text-gray-500 text-sm">Kein rechtes Fußbild verfügbar</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
=======
                <div className="flex flex-col xl:flex-row justify-center items-stretch xl:items-stretch gap-6 lg:gap-8 xl:gap-12">
                    {/* Left foot image */}
                    {leftImage && (
                        <div className="w-full xl:w-1/2 shrink-0 flex">
                            <div className="bg-white rounded-xl shadow-xl p-4 lg:p-6 border border-gray-200/50 flex flex-col w-full h-full">
                                <EditableImageCanvas
                                    key={`zoom-left-${leftImage}-${selectedScanData?.updatedAt || scanData.updatedAt}-${imageRefreshKey}`}
                                    imageUrl={leftImage}
                                    alt="Left foot scan - Plantaransicht"
                                    title=""
                                    downloadFileName={`foot_scan_left_${(scanData as any)?.customerNumber || scanData.id}`}
                                    drawingMode={drawingMode}
                                    brushSize={brushSize}
                                    brushColor={brushColor}
                                    isZoomMode={true}
                                    onImageDataReady={(getImageData) => {
                                        leftFootImageDataRef.current = getImageData
                                    }}
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
                                    title=""
                                    downloadFileName={`foot_scan_right_${(scanData as any)?.customerNumber || scanData.id}`}
                                    drawingMode={drawingMode}
                                    brushSize={brushSize}
                                    brushColor={brushColor}
                                    isZoomMode={true}
                                    onImageDataReady={(getImageData) => {
                                        rightFootImageDataRef.current = getImageData
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
>>>>>>> 70f38c7 (updates)
            </div>
        </div>
    )
}

