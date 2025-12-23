'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePicture2324 } from '@/hooks/orders/usePicture2324';
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
            <DialogContent className="sm:max-w-6xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden p-0 gap-0">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-white flex items-center justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                    Versorgung{orderNumber ? ` – ${orderNumber}` : ''}
                        {customerName ? ` – ${customerName}` : ''}
                    </DialogTitle>
                </div>

                {/* Content */}
                <div className="px-4 py-4 overflow-y-auto overflow-x-hidden max-h-[calc(95vh-180px)] bg-white">
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
                            <div className="w-full lg:w-[65%] shrink-0 min-w-0">
                                {/* Display Selected Image */}
                                {currentImage ? (
                                    <div className="relative w-full min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={currentImage}
                                            alt={selectedFoot === 'left' ? 'Linker Fuß' : 'Rechter Fuß'}
                                            className="w-full h-auto max-w-full object-contain rounded-lg"
                                            style={{ maxHeight: 'calc(95vh - 350px)', maxWidth: '100%' }}
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
                                        />
                                    </div>
                                ) : selectedFoot ? (
                                    <div className="relative w-full min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                        <p className="text-gray-500">Kein Bild verfügbar für {selectedFoot === 'left' ? 'linken' : 'rechten'} Fuß</p>
                                    </div>
                                ) : (
                                    <div className="relative w-full min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                        <p className="text-gray-500">Bitte wählen Sie einen Fuß aus</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Meta information */}
                            <div className="w-full lg:w-[35%] shrink-0 min-w-0 space-y-5 bg-gray-50 rounded-lg p-5 border border-gray-200">
                                {data.fertigstellungBis && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Fertigstellung bis
                                        </h3>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(data.fertigstellungBis)}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Kunde
                                    </h3>
                                    <p className="text-sm text-gray-900">{data.customerName || '—'}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Diagnose
                                    </h3>
                                    {data.diagnosisStatus && Array.isArray(data.diagnosisStatus) && data.diagnosisStatus.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.diagnosisStatus.map((diagnosis, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
                                                >
                                                    {diagnosis}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">—</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Versorgung
                                    </h3>
                                    <p className="text-sm text-gray-900">
                                        {data.versorgungName || '—'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Materialien
                                    </h3>
                                    {materials.length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {materials.map((m, idx) => (
                                                <li key={idx} className="text-sm text-gray-900 flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-[#61A175] rounded-full mr-2"></span>
                                                    {m}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Keine Materialien angegeben</p>
                                    )}
                                </div>

                                {/* Foot Selection Buttons */}
                                <div className="pt-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Fuß Auswahl
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            onClick={() => setSelectedFoot('left')}
                                            variant={selectedFoot === 'left' ? 'default' : 'outline'}
                                            className={`cursor-pointer w-full ${
                                                selectedFoot === 'left'
                                                    ? 'bg-[#61A175] hover:bg-[#61A175]/90 text-white'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            } ${!data?.picture_23 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!data?.picture_23}
                                        >
                                            <span className="mr-2">👣</span>
                                            Linker Fuß
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedFoot('right')}
                                            variant={selectedFoot === 'right' ? 'default' : 'outline'}
                                            className={`cursor-pointer w-full ${
                                                selectedFoot === 'right'
                                                    ? 'bg-[#61A175] hover:bg-[#61A175]/90 text-white'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            } ${!data?.picture_24 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!data?.picture_24}
                                        >
                                            <span className="mr-2">👣</span>
                                            Rechter Fuß
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No images at all: only meta information, full width
                        <div className="w-full space-y-5 bg-gray-50 rounded-lg p-6 border border-gray-200">
                            {data.fertigstellungBis && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Fertigstellung bis
                                    </h3>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(data.fertigstellungBis)}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Kunde
                                </h3>
                                <p className="text-sm text-gray-900">{data.customerName || '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Diagnose
                                </h3>
                                {data.diagnosisStatus && Array.isArray(data.diagnosisStatus) && data.diagnosisStatus.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {data.diagnosisStatus.map((diagnosis, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
                                            >
                                                {diagnosis}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">—</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Versorgung
                                </h3>
                                <p className="text-sm text-gray-900">
                                    {data.versorgungName || '—'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Materialien
                                </h3>
                                {materials.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {materials.map((m, idx) => (
                                            <li key={idx} className="text-sm text-gray-900 flex items-center">
                                                <span className="w-1.5 h-1.5 bg-[#61A175] rounded-full mr-2"></span>
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">Keine Materialien angegeben</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
                    <Button
                        onClick={onClose}
                        variant="default"
                        className="cursor-pointer bg-[#61A175] hover:bg-[#61A175]/80 text-white px-8"
                    >
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

