'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePicture2324 } from '@/hooks/orders/usePicture2324';
import { Maximize2 } from 'lucide-react';
import FullscreenImageModal from './FullscreenImageModal';
import Image from 'next/image';

interface ScanPictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderNumber?: string;
    customerName?: string;
}

export default function ScanPictureModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
    customerName,
}: ScanPictureModalProps) {
    const { data, loading, error } = usePicture2324(orderId);
    const [selectedFoot, setSelectedFoot] = useState<'left' | 'right' | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);

    const materials = data?.material
        ? data.material
              .split(',')
              .map((m) => m.trim())
              .filter((m) => m.length > 0)
        : [];

    const hasAnyImage = !!(data?.picture_23 || data?.picture_24);

    // Format date for fertigstellungBis - converts UTC to user's local timezone
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }

            const months = [
                'Januar',
                'Februar',
                'März',
                'April',
                'Mai',
                'Juni',
                'Juli',
                'August',
                'September',
                'Oktober',
                'November',
                'Dezember',
            ];
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${day}. ${month} ${year}, ${hours}:${minutes}`;
        } catch {
            return dateString;
        }
    };

    // Determine which image to show based on selected foot
    const getCurrentImage = () => {
        if (selectedFoot === 'left') {
            return data?.picture_23 || null;
        } else if (selectedFoot === 'right') {
            return data?.picture_24 || null;
        }
        return null;
    };

    // Auto-select foot when data loads
    React.useEffect(() => {
        if (data) {
            if (data.picture_23 && !data.picture_24) {
                setSelectedFoot('left');
            } else if (data.picture_24 && !data.picture_23) {
                setSelectedFoot('right');
            } else if (data.picture_23 && data.picture_24) {
                setSelectedFoot('left'); // Default to left if both available
            }
        } else {
            setSelectedFoot(null);
        }
    }, [data]);

    const currentImage = getCurrentImage();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden p-0 gap-0 shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-[#61A175] flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold text-white">
                        Versorgung{orderNumber ? ` – ${orderNumber}` : ''}
                        {customerName ? ` – ${customerName}` : ''}
                    </DialogTitle>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto overflow-x-hidden max-h-[calc(95vh-180px)] bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61A175] mb-4"></div>
                                <p className="text-gray-600">Daten werden geladen...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">Fehler: {error}</p>
                                <Button onClick={onClose} variant="outline" className="cursor-pointer">
                                    Schließen
                                </Button>
                            </div>
                        </div>
                    ) : !data ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-600">Keine Daten verfügbar</p>
                        </div>
                    ) : hasAnyImage ? (
                        <div className="flex flex-col lg:flex-row gap-6 items-start overflow-x-hidden">
                            {/* Left: Images */}
                            <div className="w-full lg:w-[60%] shrink-0 min-w-0">
                                {/* Display Selected Image */}
                                {currentImage ? (
                                    <div className="relative w-full bg-white rounded-xl border-2 border-gray-200 shadow-lg flex items-center justify-center overflow-auto group">
                                        <div className="relative w-full flex items-center justify-center p-4">
                                            <Image
                                                src={currentImage}
                                                alt={selectedFoot === 'left' ? 'Linker Fuß' : 'Rechter Fuß'}
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                className="w-full max-w-[30vh] h-auto rounded-xl transition-transform duration-300"
                                             
                                                onError={(e) => {
                                                    console.error('Image failed to load:', currentImage);
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.error-message')) {
                                                        const errorMsg = document.createElement('p');
                                                        errorMsg.className = 'text-gray-500 error-message';
                                                        errorMsg.textContent = 'Bild konnte nicht geladen werden';
                                                        parent.appendChild(errorMsg);
                                                    }
                                                }}
                                                unoptimized
                                            />
                                        </div>
                                        {/* 1:1 Bild öffnen Button */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <Button
                                                onClick={() => setShowFullscreen(true)}
                                                variant="default"
                                                size="sm"
                                                className="cursor-pointer bg-[#61A175] hover:bg-[#4d8a5f] text-white shadow-2xl flex items-center gap-2 font-semibold"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                                1:1 Bild öffnen
                                            </Button>
                                        </div>
                                    </div>
                                ) : selectedFoot ? (
                                    <div className="relative w-full bg-white rounded-xl border-2 border-gray-200 shadow-lg flex items-center justify-center p-8">
                                        <p className="text-gray-500 text-center">Kein Bild verfügbar für {selectedFoot === 'left' ? 'linken' : 'rechten'} Fuß</p>
                                    </div>
                                ) : (
                                    <div className="relative w-full bg-white rounded-xl border-2 border-gray-200 shadow-lg flex items-center justify-center p-8">
                                        <p className="text-gray-500 text-center">Bitte wählen Sie einen Fuß aus</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Meta information */}
                            <div className="w-full lg:w-[40%] shrink-0 min-w-0 space-y-4 bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg">
                                {data.fertigstellungBis && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Fertigstellung bis
                                        </h3>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatDate(data.fertigstellungBis)}
                                        </p>
                                    </div>
                                )}
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Kunde
                                    </h3>
                                    <p className="text-sm font-medium text-gray-900">{data.customerName || '—'}</p>
                                </div>
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Diagnose
                                    </h3>
                                    {data.diagnosisStatus && Array.isArray(data.diagnosisStatus) && data.diagnosisStatus.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.diagnosisStatus.map((diagnosis, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 shadow-sm"
                                                >
                                                    {diagnosis}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">—</p>
                                    )}
                                </div>
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Versorgung
                                    </h3>
                                    <p className="text-sm font-medium text-gray-900">
                                        {data.versorgungName || '—'}
                                    </p>
                                </div>
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Materialien
                                    </h3>
                                    {materials.length > 0 ? (
                                        <ul className="space-y-2">
                                            {materials.map((m, idx) => (
                                                <li key={idx} className="text-sm text-gray-900 flex items-center">
                                                    <span className="w-2 h-2 bg-[#61A175] rounded-full mr-3 shrink-0"></span>
                                                    <span className="font-medium">{m}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Keine Materialien angegeben</p>
                                    )}
                                </div>

                                {/* Insole Stock Section */}
                                {data.insoleStock && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Einlagenlager
                                        </h3>
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-[#61A175] rounded-full mr-3 shrink-0"></span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {data.insoleStock.produktname} - {data.insoleStock.size}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Versorgung Note Section */}
                                {data.versorgung_note && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Notiz
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                {data.versorgung_note}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Foot Selection Buttons */}
                                <div className="pt-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Fuß Auswahl
                                    </h3>
                                    <div className="flex flex-col gap-2.5">
                                        <Button
                                            onClick={() => setSelectedFoot('left')}
                                            variant={selectedFoot === 'left' ? 'default' : 'outline'}
                                            className={`cursor-pointer w-full transition-all duration-200 h-11 ${
                                                selectedFoot === 'left'
                                                    ? 'bg-[#61A175] hover:bg-[#4d8a5f] text-white shadow-md font-semibold'
                                                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#61A175] font-medium'
                                            } ${!data?.picture_23 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!data?.picture_23}
                                        >
                                            <span className="mr-2 text-lg">👣</span>
                                            Linker Fuß
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedFoot('right')}
                                            variant={selectedFoot === 'right' ? 'default' : 'outline'}
                                            className={`cursor-pointer w-full transition-all duration-200 h-11 ${
                                                selectedFoot === 'right'
                                                    ? 'bg-[#61A175] hover:bg-[#4d8a5f] text-white shadow-md font-semibold'
                                                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#61A175] font-medium'
                                            } ${!data?.picture_24 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!data?.picture_24}
                                        >
                                            <span className="mr-2 text-lg">👣</span>
                                            Rechter Fuß
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No images at all: only meta information, full width
                        <div className="w-full space-y-4 bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg">
                            {data.fertigstellungBis && (
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Fertigstellung bis
                                    </h3>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatDate(data.fertigstellungBis)}
                                    </p>
                                </div>
                            )}
                            <div className="pb-4 border-b border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Kunde
                                </h3>
                                <p className="text-sm font-medium text-gray-900">{data.customerName || '—'}</p>
                            </div>
                            <div className="pb-4 border-b border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Diagnose
                                </h3>
                                {data.diagnosisStatus && Array.isArray(data.diagnosisStatus) && data.diagnosisStatus.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {data.diagnosisStatus.map((diagnosis, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 shadow-sm"
                                            >
                                                {diagnosis}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">—</p>
                                )}
                            </div>
                            <div className="pb-4 border-b border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Versorgung
                                </h3>
                                <p className="text-sm font-medium text-gray-900">
                                    {data.versorgungName || '—'}
                                </p>
                            </div>
                            <div className="pb-4 border-b border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Materialien
                                </h3>
                                {materials.length > 0 ? (
                                    <ul className="space-y-2">
                                        {materials.map((m, idx) => (
                                            <li key={idx} className="text-sm text-gray-900 flex items-center">
                                                <span className="w-2 h-2 bg-[#61A175] rounded-full mr-3 shrink-0"></span>
                                                <span className="font-medium">{m}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Keine Materialien angegeben</p>
                                )}
                            </div>

                            {/* Insole Stock Section */}
                            {data.insoleStock && (
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Einlagenlager
                                    </h3>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 bg-[#61A175] rounded-full mr-3 shrink-0"></span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {data.insoleStock.produktname} - {data.insoleStock.size} mm
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Versorgung Note Section */}
                            {data.versorgung_note && (
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Notiz
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                            {data.versorgung_note}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
                    <Button
                        onClick={onClose}
                        variant="default"
                        className="cursor-pointer bg-[#61A175] hover:bg-[#4d8a5f] text-white px-8 py-2 font-semibold shadow-md transition-all duration-200"
                    >
                        Schließen
                    </Button>
                </div>
            </DialogContent>

            {/* Fullscreen 1:1 Image Modal */}
            {currentImage && (
                <FullscreenImageModal
                    isOpen={showFullscreen}
                    onClose={() => setShowFullscreen(false)}
                    imageUrl={currentImage}
                    imageAlt={selectedFoot === 'left' ? 'Linker Fuß - 1:1' : 'Rechter Fuß - 1:1'}
                />
            )}
        </Dialog>
    );
}

