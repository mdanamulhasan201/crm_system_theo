'use client'
import React, { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { MdZoomOutMap } from 'react-icons/md'
import { TfiDownload } from 'react-icons/tfi'
import { RiArrowDownSLine } from 'react-icons/ri'
import { ScanData } from '@/types/scan'
import { useAuth } from '@/contexts/AuthContext'
import { generateFeetPdf } from '@/lib/FootPdfGenerate'

interface ScanDataDisplayProps {
    scanData: ScanData
    isEditable?: boolean
    editableData?: any
    onInputChange?: (field: string, value: string) => void
    showSaveButton?: boolean
    onSave?: () => void
    isUpdating?: boolean
    error?: string | null
    children?: React.ReactNode
    onDataChange?: (filteredData: any) => void
}

export default function ScanDataDisplay({
    scanData,
    isEditable = false,
    editableData = {},
    onInputChange,
    showSaveButton = false,
    onSave,
    isUpdating = false,
    error = null,
    children,
    onDataChange
}: ScanDataDisplayProps) {
    const { user } = useAuth();
    // Date filter state
    const [selectedScanDate, setSelectedScanDate] = useState<string>('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    // Zoom state
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Toggle zoom mode
    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    // Get all available scan dates from screenerFile
    const availableScanDates = useMemo(() => {
        if (!scanData?.screenerFile || !Array.isArray(scanData.screenerFile) || scanData.screenerFile.length === 0) {
            return [];
        }

        try {
            return scanData.screenerFile
                .filter(file => file && file.updatedAt)
                .map(file => ({
                    date: file.updatedAt,
                    id: file.id,
                    displayDate: new Date(file.updatedAt).toLocaleDateString()
                }))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            console.error('Error processing scan dates:', error);
            return [];
        }
    }, [scanData?.screenerFile]);

    const selectedScanData = useMemo(() => {
        if (!scanData?.screenerFile || !Array.isArray(scanData.screenerFile) || scanData.screenerFile.length === 0) {
            return null;
        }

        if (selectedScanDate) {
            return scanData.screenerFile.find(file => file.updatedAt === selectedScanDate);
        }

        if (scanData.screenerFile.length > 0) {
            return scanData.screenerFile.reduce((latest, item) => {
                const latestDate = new Date(latest.updatedAt);
                const currentDate = new Date(item.updatedAt);
                return currentDate > latestDate ? item : latest;
            });
        }

        return null;
    }, [scanData?.screenerFile, selectedScanDate]);

    const getLatestData = (fieldName: keyof Pick<ScanData, 'picture_10' | 'picture_23' | 'picture_11' | 'picture_24' | 'threed_model_left' | 'threed_model_right' | 'picture_17' | 'picture_16'>) => {
        if (selectedScanData && selectedScanData[fieldName]) {
            return selectedScanData[fieldName];
        }
        return scanData[fieldName] || null;
    };

    const handleDateSelect = (date: string) => {
        setSelectedScanDate(date);
        setShowDateDropdown(false);
    };

    const getCurrentDisplayDate = () => {
        if (selectedScanDate) {
            return new Date(selectedScanDate).toLocaleDateString();
        }
        if (selectedScanData) {
            return new Date(selectedScanData.updatedAt).toLocaleDateString();
        }
        return scanData.updatedAt ? new Date(scanData.updatedAt).toLocaleDateString() : '-';
    };

    // Track previous data to prevent unnecessary onDataChange calls
    const previousDataRef = useRef<string | null>(null);

    React.useEffect(() => {
        if (onDataChange) {
            const currentData = selectedScanData || scanData;
            
            // Create a unique identifier for the current data
            const dataId = (selectedScanData ? selectedScanData.id : null) || 
                         (selectedScanData ? selectedScanData.updatedAt : scanData.updatedAt) ||
                         currentData.id ||
                         JSON.stringify({
                             id: currentData.id,
                             updatedAt: selectedScanData ? selectedScanData.updatedAt : scanData.updatedAt
                         });
            
            // Only call onDataChange if the data has actually changed
            if (previousDataRef.current !== dataId) {
                previousDataRef.current = dataId;
                onDataChange(currentData);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedScanData, scanData]);

    const renderField = (fieldName: string, label: string) => {
        if (isEditable && onInputChange) {
            return (
                <div>
                    <div className="text-center text-gray-600 text-sm">{label}</div>
                    <div className="border border-gray-300 text-center py-1">
                        <input
                            type="text"
                            value={editableData[fieldName] || ''}
                            onChange={(e) => onInputChange(fieldName, e.target.value)}
                            className="w-full text-center border-none outline-none"
                        />
                    </div>
                </div>
            );
        }

        // Use selectedScanData if available, otherwise fall back to scanData
        const fieldValue = selectedScanData && (selectedScanData as any)[fieldName] !== undefined
            ? (selectedScanData as any)[fieldName]
            : scanData[fieldName as keyof ScanData];
        const displayValue = typeof fieldValue === 'string' || typeof fieldValue === 'number' ? fieldValue : '-';

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
                        Scan Date: {getCurrentDisplayDate()}
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

            {/* Zoom Mode - Show only images when zoomed */}
            {isZoomed ? (
                <div className="relative mb-8">
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={toggleZoom}
                            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all duration-300 ease-out flex items-center gap-1 md:gap-2 text-sm md:text-base"
                            title="Exit zoom mode"
                        >
                            <span>✕</span>
                            <span className="hidden sm:inline">Exit Zoom</span>
                        </button>
                    </div>

                    {/* Responsive image layout */}
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8">
                        {/* Left foot image - Responsive sizing */}
                        <div className="text-center w-full lg:w-auto">
                            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-gray-700">Right Foot</h3>
                            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                                {getLatestData('picture_23') ? (
                                    <Image
                                        src={getLatestData('picture_23')!}
                                        alt="Right foot scan - Plantaransicht"
                                        width={400}
                                        height={600}
                                        className="w-full h-auto rounded-lg "
                                    />
                                ) : (
                                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm md:text-base">
                                        No right foot scan image available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right foot image - Responsive sizing */}
                        <div className="text-center w-full lg:w-auto">
                            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-gray-700">Left Foot</h3>
                            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                                {getLatestData('picture_24') ? (
                                    <Image
                                        src={getLatestData('picture_24')!}
                                        alt="Left foot scan - Plantaransicht"
                                        width={400}
                                        height={600}
                                        className="w-full h-auto rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm md:text-base">
                                        No left foot scan image available
                                    </div>
                                )}
                            </div>
                        </div>
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
