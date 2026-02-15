'use client'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast';
import ImagePreviewModal from '@/components/CustomerModal/ImagePreviewModal';
import { ScanData } from '@/types/scan';
import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer';
import ScanDataDisplay from '@/components/Shared/ScanDataDisplay';
import EinlagenQuestions from '../Scanning/EinlagenQuestions';
import MassschuheQuestions from '../Scanning/MassschuheQuestion';
import SonstigesQuestion from '../Scanning/SonstigesQuestion';

interface ScanningDataPageProps {
    scanData: ScanData;
    selectedForm?: 'einlagen' | 'massschuhe' | 'sonstiges';
    onScreenerIdChange?: (screenerId: string | null) => void;
}

export default function ScanningDataPage({ scanData, selectedForm = 'einlagen', onScreenerIdChange }: ScanningDataPageProps) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImg, setModalImg] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalType, setModalType] = useState<'image' | 'stl' | null>(null);
    const [stlUrl, setStlUrl] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasQuestions, setHasQuestions] = useState<boolean>(true); // Default to true to show loading state

    // Reset hasQuestions when form type changes
    useEffect(() => {
        if (selectedForm === 'sonstiges') {
            // For Sonstiges, immediately hide questions section (no questions available)
            setHasQuestions(false);
        } else {
            setHasQuestions(true); // Reset to show loading state when form changes
        }
    }, [selectedForm]);

    // Use the existing hook for customer data management with date filtering
    const { customer: currentScanData, availableDates, updateCustomer, refreshCustomer, isUpdating, error } = useSingleCustomer(scanData.id, selectedDate);

    // State for editable scan data
    const [editableData, setEditableData] = useState({
        fusslange1: scanData.fusslange1 ?? '',
        fusslange2: scanData.fusslange2 ?? '',
        fussbreite1: scanData.fussbreite1 ?? '',
        fussbreite2: scanData.fussbreite2 ?? '',
        kugelumfang1: scanData.kugelumfang1 ?? '',
        kugelumfang2: scanData.kugelumfang2 ?? '',
        rist1: scanData.rist1 ?? '',
        rist2: scanData.rist2 ?? '',
        zehentyp1: scanData.zehentyp1 ?? '',
        zehentyp2: scanData.zehentyp2 ?? '',
        archIndex1: scanData.archIndex1 ?? '',
        archIndex2: scanData.archIndex2 ?? '',
    });

    // Sync editableData when scanData prop or currentScanData changes
    // But only if there's no screenerFile (screenerFile থাকলে main data থেকে sync হবে না)
    useEffect(() => {
        const dataToSync = currentScanData || scanData;
        const hasScreenerFile = dataToSync?.screenerFile && Array.isArray(dataToSync.screenerFile) && dataToSync.screenerFile.length > 0;
        
        // Only sync from main data if no screenerFile exists
        // If screenerFile exists, data will come from handleDataChange callback
        if (!hasScreenerFile && !selectedDate) {
            setEditableData({
                fusslange1: dataToSync.fusslange1 ?? '',
                fusslange2: dataToSync.fusslange2 ?? '',
                fussbreite1: dataToSync.fussbreite1 ?? '',
                fussbreite2: dataToSync.fussbreite2 ?? '',
                kugelumfang1: dataToSync.kugelumfang1 ?? '',
                kugelumfang2: dataToSync.kugelumfang2 ?? '',
                rist1: dataToSync.rist1 ?? '',
                rist2: dataToSync.rist2 ?? '',
                zehentyp1: dataToSync.zehentyp1 ?? '',
                zehentyp2: dataToSync.zehentyp2 ?? '',
                archIndex1: dataToSync.archIndex1 ?? '',
                archIndex2: dataToSync.archIndex2 ?? '',
            });
        }
    }, [scanData, currentScanData, selectedDate]);

    // Check if any field has changed
    const [originalData, setOriginalData] = useState(editableData);
    const isChanged = Object.keys(editableData).some(
        (key) => editableData[key as keyof typeof editableData] !== originalData[key as keyof typeof originalData]
    );

    // Track previous filtered data to prevent unnecessary updates
    const previousFilteredDataRef = useRef<string | null>(null);

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setEditableData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Use the data from hook or fallback to prop (moved before handleDateChange)
    const displayData = currentScanData || scanData;

    // Handle date selection from ScanDataDisplay
    const handleDateChange = useCallback((date: string | null) => {
        setSelectedDate(date || undefined);
        
        // Get current data at callback time
        const currentData = currentScanData || scanData;
        
        // Find the screenerFile ID for the selected date
        if (date && currentData?.screenerFile && Array.isArray(currentData.screenerFile)) {
            const selectedScreenerFile = currentData.screenerFile.find(
                file => file.updatedAt === date
            );
            const screenerId = selectedScreenerFile?.id || null;
            onScreenerIdChange?.(screenerId);
        } else {
            // If no date selected, use the latest screenerFile ID
            if (currentData?.screenerFile && Array.isArray(currentData.screenerFile) && currentData.screenerFile.length > 0) {
                const latestScreenerFile = currentData.screenerFile.reduce((latest, item) => {
                    const latestDate = new Date(latest.updatedAt);
                    const currentDate = new Date(item.updatedAt);
                    return currentDate > latestDate ? item : latest;
                });
                onScreenerIdChange?.(latestScreenerFile.id);
            } else {
                onScreenerIdChange?.(null);
            }
        }
    }, [currentScanData, scanData, onScreenerIdChange]);

    // Memoized callback to handle data changes from date filter
    const handleDataChange = useCallback((filteredData: any) => {
        if (!filteredData) return;

        // Create a unique identifier for the current filtered data
        const dataId = filteredData.id || filteredData.updatedAt || JSON.stringify({
            fusslange1: filteredData.fusslange1,
            fusslange2: filteredData.fusslange2,
        });

        // Only update if the data has actually changed
        if (previousFilteredDataRef.current === dataId) {
            return;
        }

        previousFilteredDataRef.current = dataId;

        // Preserve null values from screenerFile, don't convert to empty string
        const newEditableData = {
            fusslange1: filteredData.fusslange1 !== undefined ? filteredData.fusslange1 : '',
            fusslange2: filteredData.fusslange2 !== undefined ? filteredData.fusslange2 : '',
            fussbreite1: filteredData.fussbreite1 !== undefined ? filteredData.fussbreite1 : '',
            fussbreite2: filteredData.fussbreite2 !== undefined ? filteredData.fussbreite2 : '',
            kugelumfang1: filteredData.kugelumfang1 !== undefined ? filteredData.kugelumfang1 : '',
            kugelumfang2: filteredData.kugelumfang2 !== undefined ? filteredData.kugelumfang2 : '',
            rist1: filteredData.rist1 !== undefined ? filteredData.rist1 : '',
            rist2: filteredData.rist2 !== undefined ? filteredData.rist2 : '',
            zehentyp1: filteredData.zehentyp1 !== undefined ? filteredData.zehentyp1 : '',
            zehentyp2: filteredData.zehentyp2 !== undefined ? filteredData.zehentyp2 : '',
            archIndex1: filteredData.archIndex1 !== undefined ? filteredData.archIndex1 : '',
            archIndex2: filteredData.archIndex2 !== undefined ? filteredData.archIndex2 : '',
        };

        setEditableData(newEditableData);
        setOriginalData(newEditableData);
    }, []);

    const handleSaveChanges = async () => {
        try {
            const success = await updateCustomer(editableData);
            if (success) {
                setOriginalData(editableData);
                setIsEditing(false); // Exit edit mode after successful save
                toast.success('Scan data updated successfully!');
            } else {
                toast.error('Failed to save changes');
            }
        } catch (err: any) {
            toast.error('Failed to save changes');
        }
    };

    // Handle image save from Zoom Mode
    const handleImageSave = async () => {
        await refreshCustomer(selectedDate);
    };

    // Helper to open modal with image
    const openModal = (img: string | null, title: string) => {
        setModalImg(img);
        setModalTitle(title);
        setModalType('image');
        setStlUrl(null);
        setModalOpen(true);
    };

    // Helper to open modal with STL
    const openStlModal = (stl: string | null, title: string) => {
        setStlUrl(stl);
        setModalTitle(title);
        setModalType('stl');
        setModalImg(null);
        setModalOpen(true);
    };


    const latestScreener = React.useMemo(() => {
        if (Array.isArray(displayData.screenerFile) && displayData.screenerFile.length > 0) {
            return displayData.screenerFile.reduce((latest, item) => {
                const latestDate = new Date(latest.updatedAt);
                const currentDate = new Date(item.updatedAt);
                return currentDate > latestDate ? item : latest;
            });
        }
        return null;
    }, [displayData.screenerFile]);

    // Initialize screenerId on mount or when displayData changes
    useEffect(() => {
        if (displayData?.screenerFile && Array.isArray(displayData.screenerFile) && displayData.screenerFile.length > 0) {
            if (selectedDate) {
                const selectedScreenerFile = displayData.screenerFile.find(
                    file => file.updatedAt === selectedDate
                );
                if (selectedScreenerFile) {
                    onScreenerIdChange?.(selectedScreenerFile.id);
                }
            } else if (latestScreener) {
                onScreenerIdChange?.(latestScreener.id);
            }
        }
    }, [displayData, selectedDate, latestScreener, onScreenerIdChange]);

    const getLatestData = (fieldName: keyof Pick<ScanData, 'picture_10' | 'picture_23' | 'picture_11' | 'picture_24' | 'threed_model_left' | 'threed_model_right' | 'picture_17' | 'picture_16'>) => {
        if (latestScreener && latestScreener[fieldName]) {
            return latestScreener[fieldName];
        }
        return displayData[fieldName] || null;
    };

    return (
        <>
            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                modalImg={modalImg}
                modalTitle={modalTitle}
                modalType={modalType}
                stlUrl={stlUrl}
            />

            <div className='flex flex-col xl:flex-row justify-between items-start mb-6 gap-4'>
                <div className={isZoomed ? 'w-full' : (hasQuestions ? 'w-full xl:w-8/12' : 'w-full')}>
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="font-bold text-xl capitalize">{displayData.vorname} {displayData.nachname}</div>
                    </div>

                    {/* Use the reusable ScanDataDisplay component */}
                    <ScanDataDisplay
                        scanData={displayData}
                        isEditable={true}
                        editableData={editableData}
                        onInputChange={handleInputChange}
                        onDataChange={handleDataChange}
                        onDateChange={handleDateChange}
                        availableDates={availableDates}
                        defaultSelectedDate={selectedDate || null}
                        onZoomChange={setIsZoomed}
                        onImageSave={handleImageSave}
                        onEditStateChange={setIsEditing}
                        externalIsEditing={isEditing}
                    >
                        {/* Additional content for the scan data section */}
                        {isChanged && (
                            <button
                                onClick={handleSaveChanges}
                                className='bg-[#4A8A6A] cursor-pointer text-white px-2 py-1 rounded hover:bg-[#4A8A6A]/80 transition text-sm'
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Saving...' : 'Save'}
                            </button>
                        )}
                        {error && (
                            <span className='ml-2 text-red-600 text-xs'>{error}</span>
                        )}
                    </ScanDataDisplay>
                </div>
                {/* Hide questions section when zoomed or when no questions are available */}
                {!isZoomed && (
                    <div className={hasQuestions ? 'w-full xl:w-4/12' : 'hidden'}>
                        {selectedForm === 'einlagen' ? (
                            <EinlagenQuestions 
                                customer={displayData} 
                                onQuestionsLoaded={setHasQuestions}
                            />
                        ) : selectedForm === 'massschuhe' ? (
                            <MassschuheQuestions 
                                customer={displayData} 
                                onQuestionsLoaded={setHasQuestions}
                            />
                        ) : selectedForm === 'sonstiges' ? (
                            <SonstigesQuestion 
                                customer={displayData} 
                                onQuestionsLoaded={setHasQuestions}
                            />
                        ) : null}
                    </div>
                )}
            </div>

            {/* button section - now using latest data sorted by updatedAt - Hide when zoomed */}
            {!isZoomed && (
                <div className="mt-8 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                <div className="flex justify-center md:justify-start">
                    <div className="flex flex-wrap space-x-2">
                        <button className="border border-gray-300 cursor-pointer bg-white hover:bg-gray-100 px-4 py-1 text-sm my-1" onClick={() => openModal(getLatestData('picture_10'), 'Fersenneigung (Links)')}>Fersenneigung</button>
                        <button className="border border-gray-300 cursor-pointer bg-white hover:bg-gray-100 px-4 py-1 text-sm relative my-1" onClick={() => openModal(getLatestData('picture_23'), 'Plantaransicht (Links)')}>Plantaransicht</button>
                        <button className="border border-gray-300 cursor-pointer  bg-white hover:bg-gray-100 px-4 py-1 text-sm my-1" onClick={() => openStlModal(getLatestData('threed_model_left'), '3D-Modell (Links)')}>3D-Modell</button>
                        <button className="border border-gray-300 cursor-pointer bg-white hover:bg-gray-100 px-4 py-1 text-sm my-1" onClick={() => openModal(getLatestData('picture_17'), 'Sohlen Index (Links)')}>Sohlen Index</button>
                    </div>
                </div>

                <div className="flex justify-center md:justify-end">
                    <div className="flex flex-wrap space-x-2">
                        <button className="border border-gray-300 bg-white px-4 hover:bg-gray-100 cursor-pointer py-1 text-sm my-1" onClick={() => openModal(getLatestData('picture_11'), 'Fersenneigung (Rechts)')}>Fersenneigung</button>
                        <button className="border border-gray-300 bg-white px-4 hover:bg-gray-100 cursor-pointer py-1 text-sm my-1" onClick={() => openModal(getLatestData('picture_24'), 'Plantaransicht (Rechts)')}>Plantaransicht</button>
                        <button className="border border-gray-300 bg-white px-4 hover:bg-gray-100 cursor-pointer py-1 text-sm my-1" onClick={() => openStlModal(getLatestData('threed_model_right'), '3D-Modell (Rechts)')}>3D-Modell</button>
                        <button className="border border-gray-300 bg-white px-4 hover:bg-gray-100 cursor-pointer py-1 text-sm my-1" onClick={() => openModal(getLatestData('picture_16'), 'Sohlen Index (Rechts)')}>Sohlen Index</button>
                    </div>
                </div>
            </div>
            )}
        </>
    )
}

