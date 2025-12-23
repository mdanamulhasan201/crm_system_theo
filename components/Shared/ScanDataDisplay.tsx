'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { MdZoomOutMap } from 'react-icons/md'
import { TfiDownload } from 'react-icons/tfi'
import { RiArrowDownSLine } from 'react-icons/ri'
import { ScanData } from '@/types/scan'
import { useAuth } from '@/contexts/AuthContext'
import { generateFeetPdf } from '@/lib/FootPdfGenerate'
import EditableImageCanvas, { DrawingToolbar } from './EditableImageCanvas'

interface ScanDataDisplayProps {
    scanData: ScanData
    isEditable?: boolean
    editableData?: any
    onInputChange?: (field: string, value: string) => void
    children?: React.ReactNode
    onDataChange?: (filteredData: any) => void
    defaultSelectedDate?: string | null
    onDateChange?: (date: string | null) => void
    availableDates?: string[]
    onZoomChange?: (isZoomed: boolean) => void
}

export default function ScanDataDisplay({
    scanData,
    isEditable = false,
    editableData = {},
    onInputChange,
    children,
    onDataChange,
    defaultSelectedDate = null,
    onDateChange,
    availableDates: propAvailableDates,
    onZoomChange
}: ScanDataDisplayProps) {
    const { user } = useAuth();
    const [selectedScanDate, setSelectedScanDate] = useState<string>(defaultSelectedDate || '');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen');
    const [brushSize, setBrushSize] = useState(3);
    const [brushColor, setBrushColor] = useState('#000000');

    // Helper function to check if screenerFile exists
    const hasScreenerFile = useMemo(() => {
        return scanData?.screenerFile && Array.isArray(scanData.screenerFile) && scanData.screenerFile.length > 0;
    }, [scanData?.screenerFile]);

    const toggleZoom = () => {
        const newZoomState = !isZoomed;
        setIsZoomed(newZoomState);
        onZoomChange?.(newZoomState);
    };

    const availableScanDates = useMemo(() => {

        if (propAvailableDates && Array.isArray(propAvailableDates) && propAvailableDates.length > 0) {
            return propAvailableDates
                .map(date => ({
                    date: date,
                    id: date, // Use date as id if no file id available
                    displayDate: new Date(date).toLocaleDateString('de-DE')
                }))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        // Fallback to screenerFile
        if (!scanData?.screenerFile || !Array.isArray(scanData.screenerFile) || scanData.screenerFile.length === 0) {
            return [];
        }

        try {
            return scanData.screenerFile
                .filter(file => file && file.updatedAt)
                .map(file => ({
                    date: file.updatedAt,
                    id: file.id,
                    displayDate: new Date(file.updatedAt).toLocaleDateString('de-DE')
                }))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            console.error('Error processing scan dates:', error);
            return [];
        }
    }, [scanData?.screenerFile, propAvailableDates]);

    const selectedScanData = useMemo(() => {
        if (!hasScreenerFile || !scanData.screenerFile) return null;

        if (selectedScanDate) {
            return scanData.screenerFile.find(file => file.updatedAt === selectedScanDate) || null;
        }

        // Return latest file by date
        return scanData.screenerFile.reduce((latest, item) => {
            const latestDate = new Date(latest.updatedAt);
            const currentDate = new Date(item.updatedAt);
            return currentDate > latestDate ? item : latest;
        });
    }, [hasScreenerFile, scanData.screenerFile, selectedScanDate]);

    const getLatestData = (fieldName: keyof Pick<ScanData, 'picture_10' | 'picture_23' | 'picture_11' | 'picture_24' | 'threed_model_left' | 'threed_model_right' | 'picture_17' | 'picture_16'>) => {
        if (hasScreenerFile && selectedScanData) {
            return selectedScanData[fieldName] || null;
        }
        return hasScreenerFile ? null : (scanData[fieldName] || null);
    };

    useEffect(() => {
        if (defaultSelectedDate) {
            setSelectedScanDate(defaultSelectedDate);
        } else if (availableScanDates.length > 0) {
            const latestDate = availableScanDates[0].date;
            if (!selectedScanDate || selectedScanDate !== latestDate) {
                setSelectedScanDate(latestDate);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultSelectedDate, availableScanDates]);


    const handleDateSelect = (date: string) => {
        setSelectedScanDate(date);
        setShowDateDropdown(false);
        onDateChange?.(date || null);
    };

    const getCurrentDisplayDate = useMemo(() => {
        if (selectedScanDate) {
            return new Date(selectedScanDate).toLocaleDateString('de-DE');
        }
        if (selectedScanData) {
            return new Date(selectedScanData.updatedAt).toLocaleDateString('de-DE');
        }
        return scanData.updatedAt ? new Date(scanData.updatedAt).toLocaleDateString('de-DE') : '-';
    }, [selectedScanDate, selectedScanData, scanData.updatedAt]);

    const previousDataRef = useRef<string | null>(null);

    useEffect(() => {
        if (!onDataChange) return;

        const currentData = hasScreenerFile && scanData.screenerFile
            ? (selectedScanData || scanData.screenerFile[0] || null)
            : scanData;

        const dataId = currentData?.id || currentData?.updatedAt || JSON.stringify({
            id: currentData?.id,
            updatedAt: currentData?.updatedAt
        });

        if (previousDataRef.current !== dataId) {
            previousDataRef.current = dataId;
            onDataChange(currentData);
        }
    }, [onDataChange, hasScreenerFile, selectedScanData, scanData]);

    // Helper function to format display value
    const formatDisplayValue = (value: any): string => {
        if (value === null || value === undefined || value === '') return '-';
        const trimmed = typeof value === 'string' ? value.trim() : value;
        return trimmed === '' ? '-' : String(trimmed);
    };

    // Helper function to get field value
    const getFieldValue = (fieldName: string): any => {
        if (hasScreenerFile) {
            return selectedScanData ? (selectedScanData as any)[fieldName] : null;
        }
        return scanData[fieldName as keyof ScanData];
    };

    const renderField = (fieldName: string, label: string) => {
        if (isEditable && onInputChange) {
            const inputValue = editableData[fieldName] || '';
            return (
                <div>
                    <div className="text-center text-gray-600 text-sm">{label}</div>
                    <div className="border border-gray-300 text-center py-1 bg-gray-50">
                        <input
                            type="text"
                            value={inputValue}
                            placeholder="-"
                            onChange={(e) => onInputChange(fieldName, e.target.value)}
                            className="w-full text-center border-none outline-none bg-transparent"
                        />
                    </div>
                </div>
            );
        }

        const fieldValue = getFieldValue(fieldName);
        const displayValue = formatDisplayValue(fieldValue);

        return (
            <div>
                <div className="text-center text-gray-600 text-sm">{label}</div>
                <div className="border border-gray-300 text-center py-1 bg-gray-50">
                    <span className="text-gray-800">{displayValue}</span>
                </div>
            </div>
        );
    };

    // download pdfs for both feet

    const handleDownloadFeetPdf = async () => {
        try {
            if (isDownloading) return;
            setIsDownloading(true);
            // Fix the mapping: picture_23 is right foot, picture_24 is left foot
            const rightUrl = getLatestData('picture_23');
            const leftUrl = getLatestData('picture_24');
            if (!leftUrl || !rightUrl) {
                alert('Left or right foot image not available.');
                return;
            }

            // Generate combined PDF with both feet
            const baseName = (scanData as any)?.customerNumber || scanData.id;
            const headerBase = {
                logoUrl: user?.image || null,
                customerFullName: `${scanData.vorname || ''} ${scanData.nachname || ''}`.trim(),
                customerNumber: (scanData as any)?.customerNumber ?? null,
                dateOfBirthText: scanData.geburtsdatum || null
            } as const;

            // Get dynamic foot length values from selected scan data (Fusslänge = foot length)
            const currentData = selectedScanData || scanData;
            const leftFootLength = parseFloat((currentData as any).fusslange2 as string) || 0; // Left foot Fusslänge
            const rightFootLength = parseFloat((currentData as any).fusslange1 as string) || 0; // Right foot Fusslänge

            const { combined } = await generateFeetPdf({
                rightImageUrl: rightUrl,
                leftImageUrl: leftUrl,
                header: headerBase,
                generateCombined: true,
                leftFootLength,
                rightFootLength
            });

            if (combined) {
                const combinedUrlBlob = URL.createObjectURL(combined);
                const a = document.createElement('a');
                a.href = combinedUrlBlob;
                a.download = `feet_scan_${baseName}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(combinedUrlBlob);
            }
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            alert('PDF generation failed.');
        } finally {
            // Ensure loading is visible briefly
            await new Promise((resolve) => setTimeout(resolve, 500));
            setIsDownloading(false);
        }
    };

    return (
        <div className="mb-6" aria-busy={isDownloading}>
            {isDownloading && (
                <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg px-6 py-5 flex items-center gap-3">
                        <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                        <span className="text-gray-900 font-medium">Generating PDF...</span>
                    </div>
                </div>
            )}
            <div className="mt-2 relative mb-4">
                <div
                    className={`flex w-fit items-center gap-2 p-2 rounded transition-colors ${availableScanDates.length > 0
                        ? 'cursor-pointer hover:bg-gray-100'
                        : 'cursor-not-allowed opacity-50'
                        }`}
                    onClick={() => availableScanDates.length > 0 && setShowDateDropdown(!showDateDropdown)}
                >
                    <span className="text-gray-600 text-sm">
                        Scan Date: {getCurrentDisplayDate}
                    </span>
                    {availableScanDates.length > 0 && (
                        <RiArrowDownSLine className={`text-gray-900 text-xl transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                    )}
                </div>

                {/* Date Dropdown */}
                {showDateDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-48">
                        {availableScanDates.length > 0 ? (
                            availableScanDates.map((scanDate) => (
                                <div
                                    key={scanDate.id}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${selectedScanDate === scanDate.date ? 'bg-blue-50 text-blue-600' : ''
                                        }`}
                                    onClick={() => handleDateSelect(scanDate.date)}
                                >
                                    {scanDate.displayDate}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                                No scan dates available
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Zoom Mode - Show only images when zoomed - Full Screen */}
            {isZoomed ? (
                <div className="fixed inset-0 z-[9998] bg-white overflow-y-auto">
                    {/* Drawing Toolbar */}
                    <div className="sticky top-0 z-[9999] bg-white border-b border-gray-200 shadow-sm">
                        <DrawingToolbar
                            drawingMode={drawingMode}
                            setDrawingMode={setDrawingMode}
                            brushSize={brushSize}
                            setBrushSize={setBrushSize}
                            brushColor={brushColor}
                            setBrushColor={setBrushColor}
                            onExitZoom={toggleZoom}
                        />
                    </div>

                    {/* Full screen responsive image layout with canvas overlay */}
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8 p-4 lg:p-8 min-h-[calc(100vh-80px)]">
                        {/* Right foot image */}
                        {getLatestData('picture_23') && (
                            <div className="w-full lg:w-1/2 max-w-4xl">
                                <EditableImageCanvas
                                    imageUrl={getLatestData('picture_23')!}
                                    alt="Right foot scan - Plantaransicht"
                                    title="Right Foot"
                                    downloadFileName={`foot_scan_right_${(scanData as any)?.customerNumber || scanData.id}`}
                                    drawingMode={drawingMode}
                                    brushSize={brushSize}
                                    brushColor={brushColor}
                                />
                            </div>
                        )}

                        {/* Left foot image */}
                        {getLatestData('picture_24') && (
                            <div className="w-full lg:w-1/2 max-w-4xl">
                                <EditableImageCanvas
                                    imageUrl={getLatestData('picture_24')!}
                                    alt="Left foot scan - Plantaransicht"
                                    title="Left Foot"
                                    downloadFileName={`foot_scan_left_${(scanData as any)?.customerNumber || scanData.id}`}
                                    drawingMode={drawingMode}
                                    brushSize={brushSize}
                                    brushColor={brushColor}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Normal Mode - Show images with data fields */
                <div className="flex flex-col lg:flex-row justify-between items-center">
                    {/* left image section */}
                    <div className="flex-1 mb-6 lg:mb-0 flex flex-col items-center">
                        <div className="w-60 max-w-md">
                            {getLatestData('picture_23') ? (
                                <Image
                                    src={getLatestData('picture_23')!}
                                    alt="Left foot scan - Plantaransicht"
                                    width={300}
                                    height={500}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="w-full h-[500px] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                                    No left foot scan image available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* scan data section */}
                    <div className="flex-1 mx-2 ">
                        <div className='flex items-center justify-center gap-5 mb-5'>
                            <div
                                className={`border border-gray-500 rounded p-1 cursor-pointer hover:bg-gray-100 transition ${isZoomed ? 'bg-blue-100 border-blue-500' : ''}`}
                                onClick={toggleZoom}
                                title={isZoomed ? "Exit zoom mode" : "Zoom images"}
                            >
                                <MdZoomOutMap className={`text-4xl ${isZoomed ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div className={`border border-gray-500 rounded p-1 ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'} transition`} onClick={handleDownloadFeetPdf} title='Download Combined PDF (both feet)'>
                                <TfiDownload className={`text-4xl ${isDownloading ? 'text-gray-400' : 'text-gray-600'}`} />
                            </div>

                            {/* Additional content (like save button, etc.) */}
                            {children}
                        </div>
                        {/* scan data fields */}
                        <div className="grid grid-cols-2 gap-2 mx-2">
                            {renderField('fusslange2', 'Fusslänge')}
                            {renderField('fusslange1', 'Fusslänge')}
                            {renderField('fussbreite2', 'Fussbreite')}
                            {renderField('fussbreite1', 'Fussbreite')}
                            {renderField('kugelumfang2', 'Kugelumfang')}
                            {renderField('kugelumfang1', 'Kugelumfang')}
                            {renderField('rist2', 'Rist')}
                            {renderField('rist1', 'Rist')}
                            {renderField('zehentyp2', 'Zehentyp')}
                            {renderField('zehentyp1', 'Zehentyp')}
                            {renderField('archIndex2', 'Arch Index')}
                            {renderField('archIndex1', 'Arch Index')}
                        </div>
                    </div>

                    {/* right image section */}
                    <div className="flex-1 mb-6 lg:mb-0 flex flex-col items-center">
                        <div className="w-60 max-w-md">
                            {getLatestData('picture_24') ? (
                                <Image
                                    src={getLatestData('picture_24')!}
                                    alt="Right foot scan - Plantaransicht"
                                    width={300}
                                    height={500}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="w-full h-[500px] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                                    No right foot scan image available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
